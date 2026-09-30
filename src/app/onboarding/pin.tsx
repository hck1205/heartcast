import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { PinPad } from '@/components/PinPad';
import { hashPin, uuid } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { useOnboarding } from '@/state/OnboardingContext';
import { colors, fonts } from '@/theme';

export default function PinStep() {
  const app = useApp();
  const { draft } = useOnboarding();
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onComplete = async (pin: string) => {
    if (!first) {
      setFirst(pin);
      setError(null);
      return;
    }
    if (pin !== first) {
      setFirst(null);
      setError('두 번 입력한 숫자가 달라요. 처음부터 다시 해 주세요.');
      return;
    }
    setSaving(true);
    try {
      await app.saveProfile({
        child: {
          id: app.profile?.child.id ?? uuid(),
          name: draft.childName.trim(),
          avatar: draft.childAvatar,
          className: draft.className.trim(),
        },
        people: draft.people,
        pinHash: hashPin(pin),
        stars: app.profile?.stars ?? 0,
        stickers: app.profile?.stickers ?? [],
        onboardedAt: new Date().toISOString(),
      });
      router.replace('/onboarding/done');
    } catch (e: any) {
      setFirst(null);
      setError(e?.message ?? '저장하지 못했어요');
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingFrame
      step={5}
      maru={first ? '한 번 더 눌러서 확인해 주세요!' : '부모님만 아는 비밀번호 4자리를 정해 주세요. 리포트는 이 번호로 잠겨요.'}
      mood={first ? 'wink' : 'happy'}
      footer={saving ? <Text style={{ textAlign: 'center', fontFamily: fonts.body, color: colors.inkSoft }}>저장하는 중…</Text> : null}
    >
      <PinPad key={`${first}-${error}`} onComplete={onComplete} error={error} />
    </OnboardingFrame>
  );
}
