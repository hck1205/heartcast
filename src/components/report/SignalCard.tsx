import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Signal } from '@/report/analyze';
import { colors, fonts, radius } from '@/theme';

export const SIGNAL_META = {
  talk: { icon: '💬', label: '대화 추천', color: colors.signal.talk, bg: '#FFF1EC' },
  watch: { icon: '👀', label: '살펴보기', color: colors.signal.watch, bg: '#FFF7E8' },
  good: { icon: '🌟', label: '좋은 신호', color: colors.signal.good, bg: '#ECF8F2' },
} as const;

/** 신호 한 줄: 아이콘 · 제목 · 짧은 설명 · › (누르면 그랬구나 대화 카드) */
export function SignalCard({ signal }: { signal: Signal }) {
  const m = SIGNAL_META[signal.level];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/parent/talk', params: { signal: signal.id } })}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.icon, { backgroundColor: m.bg }]}>
        <Text style={{ fontSize: 18 }}>{m.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.label, { color: m.color }]}>{m.label}</Text>
        <Text style={styles.title}>{signal.title}</Text>
        <Text style={styles.detail} numberOfLines={2}>
          {signal.detail}
        </Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  title: { fontFamily: fonts.body, fontSize: 15, fontWeight: '700', color: colors.ink, lineHeight: 21 },
  detail: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  chev: { fontSize: 24, color: colors.inkMuted },
});
