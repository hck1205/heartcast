import { createContext, useContext, useState, type ReactNode } from 'react';

import { randomAvatar } from '@/lib/avatar';
import type { AvatarConfig, Person, PlayResponse } from '@/types';

export interface OnboardingDraft {
  childName: string;
  className: string;
  childAvatar: AvatarConfig;
  people: Person[];
  /** 공방에서 아이가 고른 이미지 응답 — 프로필 저장 직후 기록한다 */
  pendingResponses: PlayResponse[];
}

const Ctx = createContext<{ draft: OnboardingDraft; update: (p: Partial<OnboardingDraft>) => void } | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    childName: '',
    className: '',
    childAvatar: randomAvatar(),
    people: [],
    pendingResponses: [],
  }));
  return <Ctx.Provider value={{ draft, update: (p) => setDraft((d) => ({ ...d, ...p })) }}>{children}</Ctx.Provider>;
}

export function useOnboarding() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return v;
}
