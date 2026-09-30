import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PeopleEditor } from '@/components/PeopleEditor';
import { BigButton, Body } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';

export default function TeachersStep() {
  const { draft } = useOnboarding();
  const count = draft.people.filter((p) => p.kind === 'teacher').length;
  return (
    <OnboardingFrame
      step={3}
      maru="아이와 함께 선생님을 만들어요"
      sub="생김새부터 닮은 동물·색깔까지 아이가 직접 골라요. 최대 8명까지 만들 수 있어요."
      footer={<BigButton label={count ? '다음' : '선생님을 1명 이상 만들어 주세요'} disabled={!count} onPress={() => router.push('/onboarding/friends')} />}
    >
      <PeopleEditor kind="teacher" people={draft.people} studioPath="/onboarding/studio" />
      <Body muted style={{ textAlign: 'center', fontSize: 13 }}>성격 고르기는 아이 느낌 그대로 두고 도와주지 마세요</Body>
    </OnboardingFrame>
  );
}
