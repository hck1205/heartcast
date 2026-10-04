import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DIARY_DEVICES, findDiaryChoice, type DiaryDeviceId, type DiaryPage } from '@/games/diary';
import { tap } from '@/lib/feedback';
import { colors, fonts, radius, selectedLook } from '@/theme';

/** 꾸미기 칸 14개: 누르면 그 칸의 선택지가 아래에 열린다. 채운 칸에는 고른 것이 들어간다 */
export function DeviceGrid({ page, active, onOpen }: { page: DiaryPage; active: DiaryDeviceId | null; onOpen: (id: DiaryDeviceId) => void }) {
  return (
    <View style={styles.grid}>
      {DIARY_DEVICES.map((d) => {
        const picked = page.picks[d.id] ?? [];
        const first = picked[0] ? findDiaryChoice(d.id, picked[0]) : undefined;
        return (
          <Pressable
            key={d.id}
            accessibilityRole="button"
            accessibilityLabel={`${d.label} 칸`}
            accessibilityState={{ selected: active === d.id }}
            onPress={() => {
              tap();
              onOpen(d.id);
            }}
            style={[styles.cell, picked.length > 0 && styles.filled, active === d.id && styles.active]}
          >
            {first?.color ? <View style={[styles.dot, { backgroundColor: first.color }]} /> : <Text style={styles.cellEmoji}>{first ? first.emoji : d.emoji}</Text>}
            <Text style={styles.cellLabel} numberOfLines={1}>
              {d.label}
            </Text>
            {picked.length > 1 && <Text style={styles.count}>{picked.length}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

/** 열린 칸의 선택지 (같은 걸 다시 누르면 빠진다) */
export function ChoiceTray({ page, device, onPick }: { page: DiaryPage; device: DiaryDeviceId; onPick: (id: string) => void }) {
  const d = DIARY_DEVICES.find((x) => x.id === device)!;
  const picked = page.picks[device] ?? [];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tray}>
      {d.choices.map((c) => {
        const on = picked.includes(c.id);
        return (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityLabel={c.label}
            accessibilityState={{ selected: on }}
            onPress={() => {
              tap();
              onPick(c.id);
            }}
            style={[styles.choice, on && styles.choiceOn]}
          >
            {c.color ? <View style={[styles.swatch, { backgroundColor: c.color }]} /> : <Text style={styles.choiceEmoji}>{c.emoji}</Text>}
            <Text style={[styles.choiceLabel, on && { color: colors.primaryDark }]} numberOfLines={2}>
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center', maxWidth: 7 * 46 + 6 * 5, alignSelf: 'center' },
  cell: { width: 46, height: 54, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  filled: { backgroundColor: '#FFF7E6', borderColor: '#F3D9A4' },
  active: selectedLook,
  cellEmoji: { fontSize: 22 },
  cellLabel: { fontFamily: fonts.title, fontSize: 11, color: colors.inkSoft },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.line, marginBottom: 3 },
  count: { position: 'absolute', top: 2, right: 4, fontFamily: fonts.title, fontSize: 11, color: colors.primaryDark },
  tray: { gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
  choice: { width: 76, minHeight: 82, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', padding: 4, gap: 2 },
  choiceOn: selectedLook,
  choiceEmoji: { fontSize: 30 },
  choiceLabel: { fontFamily: fonts.title, fontSize: 12, color: colors.ink, textAlign: 'center' },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.line },
});
