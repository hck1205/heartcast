import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PeopleEditor } from '@/components/PeopleEditor';
import { BigButton, Body } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';

/** 엄마·아빠·친구 부모님 같은 어른 만들기 (선택) — 관계도 놀이에서 "누구네 가족이야?"로 이어진다 */
export default function GrownupsStep() {
  const { draft } = useOnboarding();
  const count = draft.people.filter((p) => p.kind === 'parent').length;
  return (
    <OnboardingFrame
      step={5}
      maru="엄마·아빠, 친구네 어른도 만들어요"
      sub="우리 엄마·아빠, 등원길에 만나는 친구 부모님, 할머니처럼 아이가 아는 어른을 만들어요. (선택)"
      footer={<BigButton label={count ? '다음' : '나중에 할게요'} variant={count ? 'primary' : 'secondary'} onPress={() => router.push('/onboarding/pin')} />}
    >
      <PeopleEditor kind="parent" people={draft.people} studioPath="/onboarding/studio" />
      <Body muted style={{ textAlign: 'center', fontSize: 13 }}>나이 탭에서 어린이·어른·할머니·할아버지를 고를 수 있어요</Body>
    </OnboardingFrame>
  );
}
