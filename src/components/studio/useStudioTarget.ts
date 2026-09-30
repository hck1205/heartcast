import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { defaultAge, randomAvatar } from '@/lib/avatar';
import { uuid } from '@/lib/util';
import type { Person, PersonKind } from '@/types';

/** 공방 경로 파라미터(id, kind)로 편집할 사람을 찾거나 새로 만든다 */
export function useStudioTarget(people: Person[]): { person: Person; isNew: boolean } {
  const { id, kind } = useLocalSearchParams<{ id?: string; kind?: PersonKind }>();
  const existing = id ? people.find((p) => p.id === id) : undefined;
  const [fresh] = useState<Person>(() => {
    const k: PersonKind = kind === 'friend' || kind === 'parent' ? kind : 'teacher';
    return { id: uuid(), kind: k, name: '', avatar: randomAvatar(defaultAge(k)) };
  });
  return existing ? { person: existing, isNew: false } : { person: fresh, isNew: true };
}
