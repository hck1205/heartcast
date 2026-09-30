import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { MaruSays } from '@/components/Mascot';
import { PinPad } from '@/components/PinPad';
import { BigButton, SkyBackground } from '@/components/ui';
import { hashPin } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors } from '@/theme';

export default function Gate() {
  const { profile, setParentUnlocked } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  const check = (pin: string) => {
    if (profile && hashPin(pin) === profile.pinHash) {
      setParentUnlocked(true);
      router.replace('/parent');
    } else {
      setTries((t) => t + 1);
      setError('번호가 달라요. 부모님께 물어보세요!');
    }
  };

  return (
    <SkyBackground top="#C9D6FF" bottom="#F3F5FF" hills={false}>
      <View style={{ flex: 1, padding: 20, gap: 24, justifyContent: 'center' }}>
        <MaruSays text="여기는 부모님 방이에요. 비밀번호 4자리를 눌러 주세요." size={80} />
        <PinPad key={tries} onComplete={check} error={error} />
        <BigButton label="놀이로 돌아가기" icon="🌈" color={colors.paper} textColor={colors.ink} onPress={() => router.replace('/play')} />
      </View>
    </SkyBackground>
  );
}
