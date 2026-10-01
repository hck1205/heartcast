import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { say } from '@/lib/feedback';
import { colors, fonts } from '@/theme';
import { Maru } from '../Mascot';

/** 아이 화면 맨 위: ✕(닫기) · 가운데(진행 점이나 제목) · 오른쪽(없으면 빈 자리) */
export function KidHeader({ onClose, closeLabel = '그만하기', center, right }: { onClose: () => void; closeLabel?: string; center?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel={closeLabel} onPress={onClose} style={styles.iconBtn}>
        <Text style={styles.iconText}>✕</Text>
      </Pressable>
      {typeof center === 'string' ? (
        <Text style={styles.title} numberOfLines={1}>
          {center}
        </Text>
      ) : (
        (center ?? null)
      )}
      {right ?? <View style={styles.iconBtn} />}
    </View>
  );
}

/** 헤더 오른쪽의 글자 버튼 (예: 지우기) */
export function HeaderTextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={styles.iconBtn}>
      <Text style={[styles.iconText, { fontSize: 14 }]}>{label}</Text>
    </Pressable>
  );
}

const SIZES = {
  sm: { maru: 32, font: 19, line: 26, minHeight: 44, marginTop: 0 },
  md: { maru: 36, font: 21, line: 28, minHeight: 0, marginTop: 4 },
  lg: { maru: 36, font: 22, line: 30, minHeight: 56, marginTop: 4 },
} as const;

/** 마루의 질문 한 줄. 누르면 다시 읽어준다 */
export function AskBar({ text, mood = 'happy', size = 'md' }: { text: string; mood?: 'happy' | 'wow' | 'wink'; size?: keyof typeof SIZES }) {
  const z = SIZES[size];
  return (
    <Pressable onPress={() => say(text)} style={[styles.ask, { minHeight: z.minHeight, marginTop: z.marginTop }]} accessibilityHint="다시 듣기">
      <Maru size={z.maru} mood={mood} />
      <Text style={[styles.askText, { fontSize: z.font, lineHeight: z.line }]}>{text}</Text>
      <Text style={styles.speaker}>🔊</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4 },
  iconBtn: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: colors.inkSoft, fontFamily: fonts.body },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16 },
  askText: { flex: 1, fontFamily: fonts.title, color: colors.ink },
  speaker: { fontSize: 18, opacity: 0.6 },
});
