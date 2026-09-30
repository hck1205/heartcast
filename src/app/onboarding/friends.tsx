import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PeopleEditor } from '@/components/PeopleEditor';
import { BigButton, Body } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';

export default function FriendsStep() {
  const { draft } = useOnboarding();
  const count = draft.people.filter((p) => p.kind === 'friend').length;
  return (
    <OnboardingFrame
      step={4}
      maru="친한 친구들도 있나요? 친구 이야기도 섞어야 아이가 '선생님 시험'이 아니라 놀이로 느껴요."
      footer={<BigButton label={count ? '다음' : '나중에 할게요'} icon="👉" color={count ? undefined : '#9AA7BD'} onPress={() => router.push('/onboarding/pin')} />}
    >
      <PeopleEditor kind="friend" people={draft.people} studioPath="/onboarding/studio" />
      <Body muted style={{ textAlign: 'center', fontSize: 14 }}>선택 사항이에요. 설정에서 언제든 추가할 수 있어요.</Body>
    </OnboardingFrame>
  );
}
