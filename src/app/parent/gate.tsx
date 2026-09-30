import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PinPad } from '@/components/PinPad';
import { BigButton, SkyBackground } from '@/components/ui';
import { hashPin } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';

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
    <SkyBackground>
      <View style={{ flex: 1, padding: 20, gap: 24, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: fonts.title, fontSize: 24, color: colors.ink }}>부모님 비밀번호</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft }}>리포트를 보려면 4자리를 눌러 주세요</Text>
        </View>
        <PinPad key={tries} onComplete={check} error={error} />
        <BigButton variant="ghost" label="놀이로 돌아가기" onPress={() => router.replace('/play')} />
      </View>
    </SkyBackground>
  );
}
