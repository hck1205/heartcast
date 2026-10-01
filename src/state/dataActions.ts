import { demoHistory, demoProfile, withDemoPersonas } from '@/data/demoSeed';
import type { Repository } from '@/data/repository';
import { artResponses } from '@/games/art';
import { bonusStars, buy, newBadges, shopItem, streakBonus, toggleEquip } from '@/games/rewards';
import { dayKey } from '@/lib/dates';
import { uuid } from '@/lib/util';
import type { Drawing, ParentNote, PlayResponse, PlaySession, Profile } from '@/types';
import type { AppState } from './AppContext';

type Setter<T> = (update: T | ((prev: T) => T)) => void;

export interface DataDeps {
  repo: Repository | null;
  profile: Profile | null;
  responses: PlayResponse[];
  drawings: Drawing[];
  run: <T>(fn: () => Promise<T>) => Promise<T>;
  /** 지금 모드의 데이터를 다시 읽기 */
  reload: () => Promise<void>;
  setProfile: Setter<Profile | null>;
  setResponses: Setter<PlayResponse[]>;
  setNotes: Setter<ParentNote[]>;
  setDrawings: Setter<Drawing[]>;
  setPendingBadges: Setter<string[]>;
  setParentUnlocked: (v: boolean) => void;
}

export type DataActions = Pick<
  AppState,
  | 'saveProfile'
  | 'recordSession'
  | 'savePerson'
  | 'removePerson'
  | 'saveRelations'
  | 'saveDrawing'
  | 'saveResponses'
  | 'addNote'
  | 'buyItem'
  | 'equipItem'
  | 'saveStickerBoard'
  | 'claimBonus'
  | 'dismissBadge'
  | 'loadDemoData'
  | 'resetAll'
  | 'refresh'
>;

/** 데이터 동작: 저장소에 쓰고 화면 state 를 함께 바꾼다 (별·스티커·배지 포함) */
export function makeDataActions(d: DataDeps): DataActions {
  const { repo, profile, responses, drawings, run } = d;
  const need = () => {
    if (!repo) throw new Error('계정을 먼저 선택해 주세요');
    return repo;
  };
  /** 응답 묶음을 한 세션으로 저장하고 화면 state 에 더한다 (session 이 없으면 첫 응답의 세션 id·시각으로) */
  const persist = async (rs: PlayResponse[], session?: PlaySession) => {
    if (!rs.length && !session) return;
    const s = session ?? { id: rs[0].sessionId, startedAt: rs[0].createdAt, finishedAt: new Date().toISOString() };
    await need().saveSession(s, rs);
    d.setResponses((prev) => [...prev, ...rs]);
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
      d.setPendingBadges((b) => [...b, ...earned]);
    }
    await need().saveProfile(next);
    d.setProfile(next);
  };

  return {
    saveProfile: (p) =>
      run(async () => {
        await need().saveProfile(p);
        d.setProfile(p);
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
    saveDrawing: (drawing) =>
      run(async () => {
        if (!profile) throw new Error('프로필이 없어요');
        await need().saveDrawing(drawing);
        d.setDrawings((prev) => [...prev.filter((x) => x.id !== drawing.id), drawing]);
        await persist(artResponses(drawing, profile.people, uuid()));
        await updateProfile((p) => ({ ...p, stars: p.stars + 3 }), { drawings: [drawing] });
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
        if (n) await updateProfile((p) => ({ ...p, stars: p.stars + n, bonusDay: dayKey(new Date()) }));
        return n;
      }),
    dismissBadge: () => d.setPendingBadges((b) => b.slice(1)),
    addNote: (n) =>
      run(async () => {
        await need().addNote(n);
        d.setNotes((prev) => [n, ...prev]);
      }),
    loadDemoData: () =>
      run(async () => {
        const r = need();
        const base = withDemoPersonas(profile ?? demoProfile());
        await r.saveProfile(base);
        const { sessions, responses: rs, drawings: ds } = demoHistory(base);
        for (const x of ds) await r.saveDrawing(x);
        for (const s of sessions) {
          await r.saveSession(
            s,
            rs.filter((x) => x.sessionId === s.id),
          );
        }
        await d.reload();
      }),
    resetAll: () =>
      run(async () => {
        await need().resetAll();
        d.setParentUnlocked(false);
        await d.reload();
      }),
    refresh: () => run(() => d.reload()),
  };
}
