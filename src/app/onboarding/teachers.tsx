import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PeopleEditor } from '@/components/PeopleEditor';
import { BigButton, Body } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';

export default function TeachersStep() {
  const { draft, update } = useOnboarding();
  const count = draft.people.filter((p) => p.kind === 'teacher').length;
  return (
    <OnboardingFrame
      step={3}
      maru="어린이집 선생님들을 그려 주세요! 아이가 '우리 선생님이다!' 하고 알아볼 수 있게요."
      footer={<BigButton label={count ? '다음' : '선생님을 1명 이상 추가해 주세요'} icon={count ? '👉' : undefined} disabled={!count} onPress={() => router.push('/onboarding/friends')} />}
    >
      <PeopleEditor kind="teacher" people={draft.people} onChange={(people) => update({ people })} />
      <Body muted style={{ textAlign: 'center', fontSize: 14 }}>
        담임, 부담임, 보조 선생님 등 아이가 자주 만나는 분을 최대 4명까지 넣을 수 있어요.
      </Body>
    </OnboardingFrame>
  );
}
