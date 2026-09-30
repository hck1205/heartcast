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
      maru="우리 반 친구들도 만들어요"
      sub="친구가 많을수록 관계도 놀이가 풍성해져요. 친한 친구부터 시작해서 나중에 더 만들어도 돼요. (선택, 30명까지)"
      footer={<BigButton label={count ? '다음' : '나중에 할게요'} variant={count ? 'primary' : 'secondary'} onPress={() => router.push('/onboarding/grownups')} />}
    >
      <PeopleEditor kind="friend" people={draft.people} studioPath="/onboarding/studio" />
    </OnboardingFrame>
  );
}
