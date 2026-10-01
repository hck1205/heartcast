import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { tap } from '@/lib/feedback';
import { Floating } from '../Mascot';
import { BigButton, Confetti, SkyBackground } from '../ui';
import { gameStyles } from './shared';

/** 놀이를 마친 뒤: 저장 중 / 다시 저장 / 선물 상자 열기 */
export function Reward({ phase, sticker, count, onRetry }: { phase: 'saving' | 'reward' | 'error'; sticker: string; count: number; onRetry: () => void }) {
  const [opened, setOpened] = useState(false);
  const pop = useState(() => new Animated.Value(0))[0];
  const open = () => {
    tap();
    setOpened(true);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 3, tension: 90 }).start();
  };
  return (
    <SkyBackground top="#FFF3D6">
      <View style={gameStyles.rewardWrap}>
        {phase === 'saving' && <Text style={gameStyles.rewardTitle}>하늘에 날씨를 저장하는 중… ☁️</Text>}
        {phase === 'error' && (
          <>
            <Text style={gameStyles.rewardTitle}>앗, 저장이 안 됐어요 😢</Text>
            <BigButton label="다시 저장하기" onPress={onRetry} />
          </>
        )}
        {phase === 'reward' && (
          <>
            <Text style={gameStyles.rewardTitle}>다 했어요!</Text>
            <Text style={gameStyles.rewardSub}>⭐ 별 {count}개를 모았어요</Text>
            <Pressable onPress={open} disabled={opened} style={gameStyles.gift} accessibilityLabel="선물 열기">
              {opened ? (
                <Animated.Text style={{ fontSize: 120, transform: [{ scale: pop }] }}>{sticker}</Animated.Text>
              ) : (
                <Floating distance={10} duration={600}>
                  <Text style={{ fontSize: 120 }}>🎁</Text>
                </Floating>
              )}
            </Pressable>
            <Text style={gameStyles.rewardSub}>{opened ? '새 스티커를 받았어!' : '선물 상자를 눌러봐!'}</Text>
            {opened && (
              <View style={{ gap: 10, alignSelf: 'stretch' }}>
                <BigButton label="처음으로" onPress={() => router.replace('/play')} />
                <BigButton variant="ghost" label="스티커북 보기" onPress={() => router.replace('/play/stickers')} />
              </View>
            )}
          </>
        )}
      </View>
      {phase === 'reward' && <Confetti />}
    </SkyBackground>
  );
}
