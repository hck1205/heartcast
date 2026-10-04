import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AskBar, KidHeader } from '@/components/kid/KidTop';
import { BigButton, Confetti, Screen } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { celebrate, say, tap, useSayOnChange } from '@/lib/feedback';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';

const SECONDS = 12;
const CLOUDS = 9;

type Cloud = { x: number; y: number; size: number; v: Animated.Value; popped: boolean };

/**
 * 보너스 게임 "해님 구하기": 하늘을 덮은 먹구름을 콕콕 눌러 터뜨리면 해님이 웃는다.
 * 순수 놀이라 기록하지 않는다. 별은 하루 한 번만 (구름 3개마다 1개, 최대 3개).
 */
export default function SunnyGame() {
  const app = useApp();
  const { width } = useWindowDimensions();
  const W = Math.min(width - 32, 420);
  const H = W * 1.05;
  const [clouds, setClouds] = useState<Cloud[]>(() =>
    Array.from({ length: CLOUDS }, (_, i) => ({
      x: ((i % 3) + 0.15 + Math.random() * 0.5) / 3,
      y: (Math.floor(i / 3) + 0.15 + Math.random() * 0.5) / 3,
      size: 0.26 + Math.random() * 0.08,
      v: new Animated.Value(1),
      popped: false,
    })),
  );
  const [phase, setPhase] = useState<'ready' | 'play' | 'done'>('ready');
  const [left, setLeft] = useState(SECONDS);
  const [stars, setStars] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  /** 시간이 다 됐을 때 읽을 터뜨린 개수 */
  const poppedRef = useRef(0);
  const popped = clouds.filter((c) => c.popped).length;

  const prompt =
    phase === 'ready'
      ? '먹구름이 해님을 가렸어! 구름을 콕콕 눌러서 해님을 구해 줘!'
      : phase === 'play'
        ? '콕콕! 빨리빨리!'
        : stars
          ? `해님이 웃어요! 별 ${stars}개 선물!`
          : '해님이 웃어요! 정말 잘했어!';
  useSayOnChange(prompt);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const end = async (count: number) => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPhase('done');
    celebrate();
    const n = await app.claimBonus(count).catch(() => 0);
    setStars(n);
  };

  const start = () => {
    tap();
    setPhase('play');
    setLeft(SECONDS);
    let t = SECONDS;
    timer.current = setInterval(() => {
      t -= 1;
      setLeft(t);
      if (t <= 0) end(poppedRef.current);
    }, 1000);
  };

  const pop = (i: number) => {
    if (phase !== 'play' || clouds[i].popped) return;
    tap();
    Animated.timing(clouds[i].v, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    const next = clouds.map((c, j) => (j === i ? { ...c, popped: true } : c));
    setClouds(next);
    poppedRef.current = next.filter((c) => c.popped).length;
    if (poppedRef.current === next.length) end(next.length);
  };

  const sunny = phase === 'done' || popped >= CLOUDS;

  return (
    <Screen>
      <KidHeader onClose={() => router.back()} center={phase === 'play' ? `⏰ ${left}초 · ☁️ ${popped}/${CLOUDS}` : '해님 구하기'} />
      <AskBar text={prompt} size="sm" />
      <View style={[styles.sky, { width: W, height: H, backgroundColor: sunny ? '#DDEEFF' : '#C3CBD8' }]}>
        <View style={styles.sun}>
          <WeatherIcon code={sunny ? 'sunny' : 'cloudy'} size={W * 0.42} />
        </View>
        {clouds.map((c, i) => (
          <Animated.View
            key={i}
            style={{ position: 'absolute', left: c.x * W - (c.size * W) / 2, top: c.y * H - (c.size * W) / 2, transform: [{ scale: c.v }], opacity: c.v }}
          >
            <Pressable accessibilityLabel={`구름 ${i + 1}`} disabled={c.popped || phase !== 'play'} onPress={() => pop(i)}>
              <Text style={{ fontSize: c.size * W * 0.8 }}>☁️</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      <View style={styles.footer}>
        {phase === 'ready' && <BigButton label="시작!" onPress={start} />}
        {phase === 'done' && (
          <>
            <Text style={styles.result}>
              ☁️ {popped}개 터뜨렸어! {stars ? `⭐ +${stars}` : stars === 0 ? '(오늘 보너스 별은 이미 받았어)' : ''}
            </Text>
            <BigButton
              small
              variant="secondary"
              label="한 번 더"
              onPress={() => {
                say('한 번 더!');
                router.replace('/play/sunny');
              }}
            />
            <BigButton small label="처음으로" onPress={() => router.replace('/play')} />
          </>
        )}
      </View>
      {phase === 'done' && <Confetti />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sky: { alignSelf: 'center', borderRadius: 28, overflow: 'hidden', marginTop: 8 },
  sun: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  footer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 8 },
  result: { fontFamily: fonts.title, fontSize: 20, color: colors.ink, textAlign: 'center' },
});
