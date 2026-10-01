import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import type { AccountMode } from '@/data/repository';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const MODE_KEY = 'mn:mode';

/**
 * 계정: 처음 켤 때 저장된 모드 복원 · 데모 시작 · 로그인/가입/로그아웃.
 * 모드가 바뀔 때마다 `loadFor(mode)` 로 데이터를 다시 읽는다. `run` 은 오류를 화면용 `error` 에 담는다.
 */
export function useAccount(loadFor: (m: AccountMode | null) => Promise<void>, onSignOut: () => void) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<AccountMode | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const startDemo = useCallback(() => run(() => switchMode('demo')), [run, switchMode]);
  const signIn = useCallback(
    (em: string, pw: string) =>
      run(async () => {
        const { data, error: err } = await getSupabase().auth.signInWithPassword({ email: em, password: pw });
        if (err) throw new Error(err.message);
        setEmail(data.user?.email ?? em);
        await switchMode('cloud');
      }),
    [run, switchMode],
  );
  const signUp = useCallback(
    (em: string, pw: string) =>
      run(async () => {
        const { data, error: err } = await getSupabase().auth.signUp({ email: em, password: pw });
        if (err) throw new Error(err.message);
        if (!data.session) throw new Error('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.');
        setEmail(data.user?.email ?? em);
        await switchMode('cloud');
      }),
    [run, switchMode],
  );
  const signOut = useCallback(
    () =>
      run(async () => {
        if (mode === 'cloud') await getSupabase().auth.signOut();
        setEmail(null);
        onSignOut();
        await switchMode(null);
      }),
    [run, switchMode, mode, onSignOut],
  );

  return { ready, mode, email, error, run, startDemo, signIn, signUp, signOut };
}
