import { router } from 'expo-router';

import { Studio } from '@/components/studio/Studio';
import { useStudioTarget } from '@/components/studio/useStudioTarget';
import { useOnboarding } from '@/state/OnboardingContext';

/** 온보딩 중 공방: 아직 계정 프로필이 없으므로 초안에 모아 두었다가 PIN 단계에서 저장한다 */
export default function OnboardingStudio() {
  const { draft, update } = useOnboarding();
  const { person, isNew } = useStudioTarget(draft.people);
  return (
    <Studio
      initial={person}
      onCancel={() => router.back()}
      onDelete={
        isNew
          ? undefined
          : () => {
              update({
                people: draft.people.filter((p) => p.id !== person.id),
                pendingResponses: draft.pendingResponses.filter((r) => r.targetId !== person.id),
              });
              router.back();
            }
      }
      onDone={({ person: p, responses }) => {
        const people = isNew ? [...draft.people, p] : draft.people.map((x) => (x.id === p.id ? p : x));
        update({ people, pendingResponses: [...draft.pendingResponses, ...responses] });
        router.back();
      }}
    />
  );
}
