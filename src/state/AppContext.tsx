import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { localRepository } from '@/data/localRepository';
import type { AccountMode, Repository } from '@/data/repository';
import { supabaseRepository } from '@/data/supabaseRepository';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ParentNote, PlayResponse, PlaySession, Profile } from '@/types';

const MODE_KEY = 'mn:mode';
const HISTORY_DAYS = 60;

interface AppState {
  ready: boolean;
  mode: AccountMode | null;
  email: string | null;
  profile: Profile | null;
  responses: PlayResponse[];
  notes: ParentNote[];
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
  const [error, setError] = useState<string | null>(null);
  const [parentUnlocked, setParentUnlocked] = useState(false);

  const loadFor = useCallback(async (m: AccountMode | null) => {
    const repo = repoFor(m);
    if (!repo) {
      setProfile(null);
      setResponses([]);
      setNotes([]);
      return;
    }
    const since = new Date(Date.now() - HISTORY_DAYS * 86400000).toISOString();
    const [p, rs, ns] = await Promise.all([repo.loadProfile(), repo.listResponses(since), repo.listNotes()]);
    setProfile(p);
    setResponses(rs);
    setNotes(ns);
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
      addNote: (n) =>
        run(async () => {
          await need().addNote(n);
          setNotes((prev) => [n, ...prev]);
        }),
      loadDemoData: () =>
        run(async () => {
          const r = need();
          const p = profile ?? demoProfile();
          const base = profile ? p : { ...p };
          if (!profile) await r.saveProfile(base);
          const { sessions, responses: rs } = demoHistory(base);
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
  }, [ready, mode, email, profile, responses, notes, error, parentUnlocked, run, switchMode, loadFor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
