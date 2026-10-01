import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { badgeOf } from '@/games/rewards';
import { celebrate, say } from '@/lib/feedback';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';
import { BigButton, Confetti } from '../ui';

/** 새 배지를 받으면 한 번 크게 축하한다 (아이 화면 어디서든 위에 뜬다) */
export function BadgeCelebration() {
  const { pendingBadges, dismissBadge } = useApp();
  const badge = pendingBadges[0] ? badgeOf(pendingBadges[0]) : undefined;
  const [pop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!badge) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start();
    celebrate();
    const t = setTimeout(() => say(`새 배지! ${badge.label}! ${badge.desc}`), 300);
    return () => clearTimeout(t);
  }, [badge, pop]);
  if (!badge) return null;
  return (
    <View style={styles.overlay}>
      <Text style={styles.kicker}>🏅 새 배지를 받았어!</Text>
      <Animated.View style={[styles.medal, { transform: [{ scale: pop }] }]}>
        <Text style={{ fontSize: 72 }}>{badge.emoji}</Text>
      </Animated.View>
      <Text style={styles.title}>{badge.label}</Text>
      <Text style={styles.desc}>{badge.desc}</Text>
      <BigButton label="멋지다!" onPress={dismissBadge} style={{ alignSelf: 'stretch' }} />
      <Confetti />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(250,247,242,0.97)', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  kicker: { fontFamily: fonts.title, fontSize: 18, color: colors.primaryDark },
  medal: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFE9A8', borderWidth: 6, borderColor: '#F5B83D', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.title, fontSize: 30, color: colors.ink },
  desc: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft, marginBottom: 10 },
});
