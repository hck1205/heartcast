import { hasBatchim } from '@/lib/josa';
import type { AvatarConfig, Person, PersonKind, Profile } from '@/types';
import { callName } from './persona';

/**
 * 사람 id 다루기 (관계도·그림 놀이·리포트 공용).
 * 아이 자신은 'self', 질문에 "아무도 없어"/"잘 모르겠어"는 'nobody'/'unknown'.
 */
export const SELF = 'self';
export const NOBODY = 'nobody';
export const UNKNOWN = 'unknown';

export type Who = (id: string) => string;

/**
 * 부르는 이름: 아이 화면에서는 나 자신을 '나', 부모 화면에서는 아이 이름.
 * kid: 아이에게 말할 때는 친구 이름을 "하준이"처럼 부른다.
 */
export function makeWho(people: Person[], selfName: string, opts: { kid?: boolean } = {}): Who {
  return (id: string) => {
    if (id === SELF) return selfName;
    if (id === NOBODY) return '아무도 없어';
    if (id === UNKNOWN) return '잘 모르겠어';
    const p = people.find((x) => x.id === id);
    if (!p) return '(지워진 사람)';
    if (opts.kid && p.kind === 'friend' && hasBatchim(p.name)) return `${p.name}이`;
    return callName(p.name, p.kind, p.role);
  };
}

/** id → 아바타 ('self' 는 아이 아바타). 없는 사람은 null */
export function avatarFor(profile: Pick<Profile, 'child' | 'people'>): (id: string) => AvatarConfig | null {
  return (id: string) => (id === SELF ? profile.child.avatar : (profile.people.find((p) => p.id === id)?.avatar ?? null));
}

const GROUP_LABEL: Record<PersonKind, string> = { teacher: '선생님', friend: '친구', parent: '가족·어른' };

/** 사람을 선생님 → 친구 → 가족·어른 순서로 묶는다 (빈 묶음은 뺀다) */
export function peopleGroups(people: Person[]): { kind: PersonKind; label: string; people: Person[] }[] {
  return (['teacher', 'friend', 'parent'] as const)
    .map((kind) => ({ kind, label: GROUP_LABEL[kind], people: people.filter((p) => p.kind === kind) }))
    .filter((g) => g.people.length);
}
