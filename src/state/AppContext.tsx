import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { demoHistory, demoProfile, withDemoPersonas } from '@/data/demoSeed';
import { localRepository } from '@/data/localRepository';
import type { AccountMode, Repository } from '@/data/repository';
import { supabaseRepository } from '@/data/supabaseRepository';
import { artResponses } from '@/games/art';
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
  recordSession(session: PlaySession, responses: PlayResponse[], sticker: string): Promise<void>;
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
          const r = need();
          await r.saveSession(session, rs);
          setResponses((prev) => [...prev, ...rs]);
          if (profile) {
            const answered = rs.length;
            const next: Profile = {
              ...profile,
              stars: profile.stars + answered,
              stickers: [...profile.stickers, sticker],
            };
            await r.saveProfile(next);
            setProfile(next);
          }
        }),
      savePerson: (person, rs) =>
        run(async () => {
          const r = need();
          if (!profile) throw new Error('프로필이 없어요');
          const exists = profile.people.some((p) => p.id === person.id);
          const people = exists ? profile.people.map((p) => (p.id === person.id ? person : p)) : [...profile.people, person];
          const next: Profile = { ...profile, people, stars: profile.stars + (rs.length ? 3 : 0) };
          await r.saveProfile(next);
          setProfile(next);
          if (rs.length) {
            const now = new Date().toISOString();
            await r.saveSession({ id: rs[0].sessionId, startedAt: now, finishedAt: now }, rs);
            setResponses((prev) => [...prev, ...rs]);
          }
        }),
      removePerson: (id) =>
        run(async () => {
          if (!profile) return;
          const next: Profile = { ...profile, people: profile.people.filter((p) => p.id !== id) };
          await need().saveProfile(next);
          setProfile(next);
        }),
      saveRelations: (rs, stars = 0) =>
        run(async () => {
          const r = need();
          if (!rs.length) return;
          const now = new Date().toISOString();
          await r.saveSession({ id: rs[0].sessionId, startedAt: rs[0].createdAt, finishedAt: now }, rs);
          setResponses((prev) => [...prev, ...rs]);
          if (stars && profile) {
            const next: Profile = { ...profile, stars: profile.stars + stars };
            await r.saveProfile(next);
            setProfile(next);
          }
        }),
      saveDrawing: (d) =>
        run(async () => {
          const r = need();
          if (!profile) throw new Error('프로필이 없어요');
          await r.saveDrawing(d);
          setDrawings((prev) => [...prev.filter((x) => x.id !== d.id), d]);
          const sessionId = uuid();
          const rs = artResponses(d, profile.people, sessionId);
          await r.saveSession({ id: sessionId, startedAt: d.createdAt, finishedAt: new Date().toISOString() }, rs);
          setResponses((prev) => [...prev, ...rs]);
          const next: Profile = { ...profile, stars: profile.stars + 3 };
          await r.saveProfile(next);
          setProfile(next);
        }),
      saveResponses: (rs) =>
        run(async () => {
          if (!rs.length) return;
          const now = new Date().toISOString();
          const sessionId = uuid();
          const withSession = rs.map((x) => ({ ...x, sessionId }));
          await need().saveSession({ id: sessionId, startedAt: now, finishedAt: now }, withSession);
          setResponses((prev) => [...prev, ...withSession]);
        }),
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
  }, [ready, mode, email, profile, responses, notes, drawings, error, parentUnlocked, run, switchMode, loadFor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
