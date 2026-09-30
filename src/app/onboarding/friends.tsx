import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PeopleEditor } from '@/components/PeopleEditor';
import { BigButton } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';

export default function FriendsStep() {
  const { draft } = useOnboarding();
  const count = draft.people.filter((p) => p.kind === 'friend').length;
  return (
    <OnboardingFrame
      step={4}
      maru="친한 친구도 만들어요"
      sub="친구 이야기도 섞여야 선생님 시험이 아니라 놀이로 느껴져요. (선택)"
      footer={<BigButton label={count ? '다음' : '나중에 할게요'} variant={count ? 'primary' : 'secondary'} onPress={() => router.push('/onboarding/pin')} />}
    >
      <PeopleEditor kind="friend" people={draft.people} studioPath="/onboarding/studio" />
    </OnboardingFrame>
  );
}
