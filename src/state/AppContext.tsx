import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { localRepository } from '@/data/localRepository';
import type { AccountMode, Repository } from '@/data/repository';
import { supabaseRepository } from '@/data/supabaseRepository';
import { withAgeDefaults } from '@/lib/avatar';
import { DAY } from '@/lib/dates';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Drawing, ParentNote, Person, PlayResponse, PlaySession, Profile } from '@/types';
import { makeDataActions } from './dataActions';
import { useAccount } from './useAccount';

const HISTORY_DAYS = 60;

export interface AppState {
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

/** 앱 상태: 계정(useAccount) + 불러온 데이터 + 데이터 동작(makeDataActions)을 조립한다 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [responses, setResponses] = useState<PlayResponse[]>([]);
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [pendingBadges, setPendingBadges] = useState<string[]>([]);
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
    const since = new Date(Date.now() - HISTORY_DAYS * DAY).toISOString();
    const [p, rs, ns, ds] = await Promise.all([repo.loadProfile(), repo.listResponses(since), repo.listNotes(), repo.listDrawings(since)]);
    setProfile(p ? withAgeDefaults(p) : null);
    setResponses(rs);
    setNotes(ns);
    setDrawings(ds);
  }, []);
  const lock = useCallback(() => setParentUnlocked(false), []);
  const { ready, mode, email, error, run, startDemo, signIn, signUp, signOut } = useAccount(loadFor, lock);

  const value = useMemo<AppState>(
    () => ({
      ready,
      mode,
      email,
      error,
      startDemo,
      signIn,
      signUp,
      signOut,
      profile,
      responses,
      notes,
      drawings,
      cloudAvailable: isSupabaseConfigured,
      parentUnlocked,
      setParentUnlocked,
      pendingBadges,
      ...makeDataActions({
        repo: repoFor(mode),
        profile,
        responses,
        drawings,
        run,
        reload: () => loadFor(mode),
        setProfile,
        setResponses,
        setNotes,
        setDrawings,
        setPendingBadges,
        setParentUnlocked,
      }),
    }),
    [ready, mode, email, error, run, startDemo, signIn, signUp, signOut, profile, responses, notes, drawings, pendingBadges, parentUnlocked, loadFor],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
