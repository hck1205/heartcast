import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Signal } from '@/report/analyze';
import { colors, fonts, radius, shadow } from '@/theme';

export const SIGNAL_META = {
  talk: { icon: '💬', label: '대화 추천', color: colors.signal.talk, bg: '#FFF1EC' },
  watch: { icon: '👀', label: '살펴보기', color: colors.signal.watch, bg: '#FFF8E8' },
  good: { icon: '🌟', label: '좋은 신호', color: colors.signal.good, bg: '#ECF9F2' },
} as const;

export function SignalCard({ signal }: { signal: Signal }) {
  const m = SIGNAL_META[signal.level];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/parent/talk', params: { signal: signal.id } })}
      style={[styles.card, { backgroundColor: m.bg, borderLeftColor: m.color }]}
    >
      <View style={styles.head}>
        <Text style={[styles.badge, { color: m.color }]}>
          {m.icon} {m.label}
        </Text>
      </View>
      <Text style={styles.title}>{signal.title}</Text>
      <Text style={styles.detail}>{signal.detail}</Text>
      <Text style={[styles.link, { color: m.color }]}>그랬구나 대화 카드 보기 ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: 14, borderLeftWidth: 6, gap: 4, ...shadow, shadowOpacity: 0.06 },
  head: { flexDirection: 'row' },
  badge: { fontFamily: fonts.title, fontSize: 13 },
  title: { fontFamily: fonts.title, fontSize: 17, color: colors.ink, lineHeight: 24 },
  detail: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, lineHeight: 21 },
  link: { fontFamily: fonts.title, fontSize: 14, marginTop: 4 },
});
