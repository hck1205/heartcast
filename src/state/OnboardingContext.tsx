import { createContext, useContext, useState, type ReactNode } from 'react';

import { randomAvatar } from '@/lib/util';
import type { AvatarConfig, Person } from '@/types';

export interface OnboardingDraft {
  childName: string;
  className: string;
  childAvatar: AvatarConfig;
  people: Person[];
}

const Ctx = createContext<{ draft: OnboardingDraft; update: (p: Partial<OnboardingDraft>) => void } | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    childName: '',
    className: '',
    childAvatar: randomAvatar(),
    people: [],
  }));
  return <Ctx.Provider value={{ draft, update: (p) => setDraft((d) => ({ ...d, ...p })) }}>{children}</Ctx.Provider>;
}

export function useOnboarding() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return v;
}
