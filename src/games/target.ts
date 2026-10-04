import type { Person, Profile, TargetType, TopicId } from '@/types';
import { TOPICS } from './content';

/** 질문 대상: 사람이면 그 사람, 주제(교실·밥·낮잠·놀이·나)면 주제 그림과 아이 */
export function resolveTarget(profile: Pick<Profile, 'people' | 'child'>, targetType: TargetType, targetId: string) {
  if (targetType === 'person') {
    const p: Person | undefined = profile.people.find((x) => x.id === targetId);
    return p ? { kind: 'person' as const, person: p } : null;
  }
  return { kind: 'topic' as const, topic: TOPICS[targetId as TopicId], child: profile.child };
}
