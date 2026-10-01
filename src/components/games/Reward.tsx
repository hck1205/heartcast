import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { celebrate, say, tap } from '@/lib/feedback';
import { useShake, useSpringIn } from '@/lib/motion';
import { Floating } from '../Mascot';
import { BigButton, Confetti, SkyBackground } from '../ui';
import { gameStyles } from './shared';

/** 놀이를 마친 뒤: 저장 중 / 다시 저장 / 선물 상자 열기 */
export function Reward({
  phase,
  sticker,
  count,
  bonus,
  onRetry,
}: {
  phase: 'saving' | 'reward' | 'error';
  sticker: string;
  count: number;
  /** 연속 출석 보너스 (있으면 한 줄 더 보여준다) */
  bonus?: { streakDays: number; bonusStars: number } | null;
  onRetry: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const { value: pop, play: popIn } = useSpringIn(3, 90);
  const { shake, rotate: rotateBy } = useShake();
  // 상자가 흔들흔들 → 펑! 스티커가 위로 솟아오른다
  const open = () => {
    tap();
    setOpening(true);
    shake([1, -1, 1, -1, 1, 0], 90, () => {
      setOpened(true);
      celebrate();
      say(`짜잔! 새 스티커!`);
      popIn();
    });
  };
  const rise = pop.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const rotate = rotateBy(14);
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
            {bonus && (
              <Text style={gameStyles.bonus}>
                🔥 {bonus.streakDays}일 연속! 보너스 별 {bonus.bonusStars}개 더!
              </Text>
            )}
            <Pressable onPress={open} disabled={opened || opening} style={gameStyles.gift} accessibilityLabel="선물 열기">
              {opened ? (
                <Animated.Text style={{ fontSize: 120, transform: [{ scale: pop }, { translateY: rise }] }}>{sticker}</Animated.Text>
              ) : (
                <Floating distance={10} duration={600}>
                  <Animated.Text style={{ fontSize: 120, transform: [{ rotate }] }}>🎁</Animated.Text>
                </Floating>
              )}
            </Pressable>
            <Text style={gameStyles.rewardSub}>{opened ? '새 스티커를 받았어!' : '선물 상자를 눌러봐!'}</Text>
            {opened && (
              <View style={{ gap: 10, alignSelf: 'stretch' }}>
                <BigButton label="☀️ 보너스 게임: 해님 구하기" onPress={() => router.replace('/play/sunny')} />
                <BigButton variant="secondary" label="처음으로" onPress={() => router.replace('/play')} />
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
