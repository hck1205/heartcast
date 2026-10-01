import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { demoHistory, demoProfile, withDemoPersonas } from '@/data/demoSeed';
import { localRepository } from '@/data/localRepository';
import type { AccountMode, Repository } from '@/data/repository';
import { supabaseRepository } from '@/data/supabaseRepository';
import { artResponses } from '@/games/art';
import { bonusStars, buy, dayKey as rewardDayKey, newBadges, shopItem, streakBonus, toggleEquip } from '@/games/rewards';
import { withAgeDefaults } from '@/lib/avatar';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { uuid } from '@/lib/util';
import type { Drawing, ParentNote, Person, PlayResponse, PlaySession, Profile } from '@/types';

const MODE_KEY = 'mn:mode';
const HISTORY_DAYS = 60;

interface AppState {
  ready: boolean;
  mode: AccountMode | null;
  email: string | null;
  profile: Profile | null;
  responses: PlayResponse[];
  notes: ParentNote[];
  drawings: Drawing[];
  error: string | null;
  cloudAvailable: boolean;
  /** 부모 PIN 통과 여부 (앱을 다시 열면 다시 잠김) */
  parentUnlocked: boolean;
  setParentUnlocked(v: boolean): void;
  startDemo(): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  saveProfile(p: Profile): Promise<void>;
  /** 날씨 놀이 기록 + 별·스티커. 오늘 첫 놀이로 3·5·7일 연속이면 보너스 별을 더 주고 알려준다 */
  recordSession(session: PlaySession, responses: PlayResponse[], sticker: string): Promise<{ streakDays: number; bonusStars: number } | null>;
  /** 공방에서 만든/고친 사람을 저장하고, 아이가 고른 이미지 응답을 기록한다 */
  savePerson(person: Person, responses: PlayResponse[]): Promise<void>;
  removePerson(id: string): Promise<void>;
  /** 관계도 놀이에서 이은 선(응답)을 기록하고 별을 준다 */
  saveRelations(responses: PlayResponse[], stars?: number): Promise<void>;
  /** 그림 놀이: 그림 원본 + 분석용 응답을 저장하고 별을 준다 */
  saveDrawing(drawing: Drawing): Promise<void>;
  /** 프로필 저장 직후 온보딩 중 모아둔 응답을 한꺼번에 기록 */
  saveResponses(responses: PlayResponse[]): Promise<void>;
  addNote(note: ParentNote): Promise<void>;
  /** 별 상점: 열기 (별이 모자라면 ok=false) */
  buyItem(id: string): Promise<{ ok: boolean; reason?: string }>;
  /** 별 상점: 쓰기/벗기 */
  equipItem(id: string): Promise<void>;
  saveStickerBoard(board: NonNullable<Profile['stickerBoard']>): Promise<void>;
  /** 보너스 게임 별 받기 (하루 한 번). 받은 별 수를 돌려준다 */
  claimBonus(popped: number): Promise<number>;
  /** 새로 받은 배지 (축하 화면을 보여준 뒤 dismissBadge) */
  pendingBadges: string[];
  dismissBadge(): void;
  loadDemoData(): Promise<void>;
  resetAll(): Promise<void>;
  refresh(): Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const repoFor = (mode: AccountMode | null): Repository | null =>
  mode === 'cloud' ? supabaseRepository : mode === 'demo' ? localRepository : null;

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [responses, setResponses] = useState<PlayResponse[]>([]);
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [pendingBadges, setPendingBadges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [parentUnlocked, setParentUnlocked] = useState(false);

  const loadFor = useCallback(async (m: AccountMode | null) => {
    const repo = repoFor(m);
    if (!repo) {
      setProfile(null);
      setResponses([]);
      setNotes([]);
      setDrawings([]);
      return;
    }
    const since = new Date(Date.now() - HISTORY_DAYS * 86400000).toISOString();
    const [p, rs, ns, ds] = await Promise.all([repo.loadProfile(), repo.listResponses(since), repo.listNotes(), repo.listDrawings(since)]);
    setProfile(p ? withAgeDefaults(p) : null);
    setResponses(rs);
    setNotes(ns);
    setDrawings(ds);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let m = ((await AsyncStorage.getItem(MODE_KEY)) as AccountMode | null) ?? null;
        if (m === 'cloud') {
          if (!isSupabaseConfigured) m = null;
          else {
            const { data } = await getSupabase().auth.getSession();
            if (!data.session) m = null;
            else setEmail(data.session.user.email ?? null);
          }
        }
        setMode(m);
        await loadFor(m);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setReady(true);
      }
    })();
  }, [loadFor]);

  const switchMode = useCallback(
    async (m: AccountMode | null) => {
      if (m) await AsyncStorage.setItem(MODE_KEY, m);
      else await AsyncStorage.removeItem(MODE_KEY);
      setMode(m);
      await loadFor(m);
    },
    [loadFor],
  );

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setError(null);
    try {
      return await fn();
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setError(msg);
      throw e;
    }
  }, []);

  const value = useMemo<AppState>(() => {
    const repo = repoFor(mode);
    const need = () => {
      if (!repo) throw new Error('계정을 먼저 선택해 주세요');
      return repo;
    };
    /** 응답 묶음을 한 세션으로 저장하고 화면 state 에 더한다 (session 이 없으면 첫 응답의 세션 id·시각으로) */
    const persist = async (rs: PlayResponse[], session?: PlaySession) => {
      if (!rs.length && !session) return;
      const s = session ?? { id: rs[0].sessionId, startedAt: rs[0].createdAt, finishedAt: new Date().toISOString() };
      await need().saveSession(s, rs);
      setResponses((prev) => [...prev, ...rs]);
    };
    /**
     * 프로필 고치기 (별·스티커·사람·상점) — 저장소와 화면 state 를 함께 바꾼다.
     * 고친 뒤 새로 받을 배지가 있으면 함께 넣고 축하 대기열에 올린다. extra 는 방금 저장한(아직 state 에 안 들어간) 기록.
     */
    const updateProfile = async (change: (p: Profile) => Profile, extra: { responses?: PlayResponse[]; drawings?: Drawing[] } = {}) => {
      if (!profile) return;
      let next = change(profile);
      const earned = newBadges({ profile: next, responses: [...responses, ...(extra.responses ?? [])], drawings: [...drawings, ...(extra.drawings ?? [])] });
      if (earned.length) {
        next = { ...next, badges: [...(next.badges ?? []), ...earned] };
        setPendingBadges((b) => [...b, ...earned]);
      }
      await need().saveProfile(next);
      setProfile(next);
    };
    return {
      ready,
      mode,
      email,
      profile,
      responses,
      notes,
      drawings,
      error,
      cloudAvailable: isSupabaseConfigured,
      parentUnlocked,
      setParentUnlocked,
      startDemo: () => run(() => switchMode('demo')),
      signIn: (em, pw) =>
        run(async () => {
          const { data, error: err } = await getSupabase().auth.signInWithPassword({ email: em, password: pw });
          if (err) throw new Error(err.message);
          setEmail(data.user?.email ?? em);
          await switchMode('cloud');
        }),
      signUp: (em, pw) =>
        run(async () => {
          const { data, error: err } = await getSupabase().auth.signUp({ email: em, password: pw });
          if (err) throw new Error(err.message);
          if (!data.session) throw new Error('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.');
          setEmail(data.user?.email ?? em);
          await switchMode('cloud');
        }),
      signOut: () =>
        run(async () => {
          if (mode === 'cloud') await getSupabase().auth.signOut();
          setEmail(null);
          setParentUnlocked(false);
          await switchMode(null);
        }),
      saveProfile: (p) =>
        run(async () => {
          await need().saveProfile(p);
          setProfile(p);
        }),
      recordSession: (session, rs, sticker) =>
        run(async () => {
          const bonus = streakBonus(responses);
          await persist(rs, session);
          await updateProfile((p) => ({ ...p, stars: p.stars + rs.length + (bonus?.stars ?? 0), stickers: [...p.stickers, sticker] }), { responses: rs });
          return bonus ? { streakDays: bonus.days, bonusStars: bonus.stars } : null;
        }),
      savePerson: (person, rs) =>
        run(async () => {
          if (!profile) throw new Error('프로필이 없어요');
          await updateProfile((p) => {
            const exists = p.people.some((x) => x.id === person.id);
            const people = exists ? p.people.map((x) => (x.id === person.id ? person : x)) : [...p.people, person];
            return { ...p, people, stars: p.stars + (rs.length ? 3 : 0) };
          });
          await persist(rs);
        }),
      removePerson: (id) => run(() => updateProfile((p) => ({ ...p, people: p.people.filter((x) => x.id !== id) }))),
      saveRelations: (rs, stars = 0) =>
        run(async () => {
          await persist(rs);
          if (stars) await updateProfile((p) => ({ ...p, stars: p.stars + stars }), { responses: rs });
        }),
      saveDrawing: (d) =>
        run(async () => {
          if (!profile) throw new Error('프로필이 없어요');
          await need().saveDrawing(d);
          setDrawings((prev) => [...prev.filter((x) => x.id !== d.id), d]);
          await persist(artResponses(d, profile.people, uuid()));
          await updateProfile((p) => ({ ...p, stars: p.stars + 3 }), { drawings: [d] });
        }),
      saveResponses: (rs) =>
        run(async () => {
          // 온보딩 중 모아둔 응답은 한 세션으로 묶는다
          const sessionId = uuid();
          await persist(rs.map((x) => ({ ...x, sessionId })));
        }),
      buyItem: (id) =>
        run(async () => {
          if (!profile) return { ok: false, reason: 'profile' };
          const r = buy(profile, id);
          if (r.ok) await updateProfile(() => r.profile);
          return { ok: r.ok, reason: r.reason };
        }),
      equipItem: (id) =>
        run(async () => {
          const item = shopItem(id);
          if (item) await updateProfile((p) => toggleEquip(p, item));
        }),
      saveStickerBoard: (board) => run(() => updateProfile((p) => ({ ...p, stickerBoard: board }))),
      claimBonus: (popped) =>
        run(async () => {
          if (!profile) return 0;
          const n = bonusStars(popped, profile);
          if (n) await updateProfile((p) => ({ ...p, stars: p.stars + n, bonusDay: rewardDayKey(new Date()) }));
          return n;
        }),
      pendingBadges,
      dismissBadge: () => setPendingBadges((b) => b.slice(1)),
      addNote: (n) =>
        run(async () => {
          await need().addNote(n);
          setNotes((prev) => [n, ...prev]);
        }),
      loadDemoData: () =>
        run(async () => {
          const r = need();
          const base = withDemoPersonas(profile ?? demoProfile());
          await r.saveProfile(base);
          const { sessions, responses: rs, drawings: ds } = demoHistory(base);
          for (const d of ds) await r.saveDrawing(d);
          for (const s of sessions) {
            await r.saveSession(
              s,
              rs.filter((x) => x.sessionId === s.id),
            );
          }
          await loadFor(mode);
        }),
      resetAll: () =>
        run(async () => {
          await need().resetAll();
          setParentUnlocked(false);
          await loadFor(mode);
        }),
      refresh: () => run(() => loadFor(mode)),
    };
  }, [ready, mode, email, profile, responses, notes, drawings, pendingBadges, error, parentUnlocked, run, switchMode, loadFor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
