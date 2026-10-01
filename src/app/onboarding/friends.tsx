import { router } from 'expo-router';
import { useState } from 'react';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PeopleEditor } from '@/components/PeopleEditor';
import { BigButton, Tabs } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';

/** 친구·가족 만들기 (선택): 한 화면에 탭 두 개 */
export default function FriendsStep() {
  const { draft } = useOnboarding();
  const [kind, setKind] = useState<'friend' | 'parent'>('friend');
  const count = draft.people.filter((p) => p.kind !== 'teacher').length;
  return (
    <OnboardingFrame
      step={4}
      maru="친구·가족도 만들어요"
      sub="아이가 아는 친구와 어른을 만들어요. 나중에 해도 돼요."
      footer={<BigButton label={count ? '다음' : '나중에 할게요'} variant={count ? 'primary' : 'secondary'} onPress={() => router.push('/onboarding/pin')} />}
    >
      <Tabs
        items={[
          { id: 'friend', label: '친구' },
          { id: 'parent', label: '가족·어른' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <PeopleEditor kind={kind} people={draft.people} studioPath="/onboarding/studio" />
    </OnboardingFrame>
  );
}
