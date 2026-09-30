import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton, H1, SkyBackground } from '@/components/ui';
import { STICKERS } from '@/games/content';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

export default function StickerBook() {
  const { profile } = useApp();
  if (!profile) return null;
  const counts = new Map<string, number>();
  for (const s of profile.stickers) counts.set(s, (counts.get(s) ?? 0) + 1);
  return (
    <SkyBackground>
      <ScrollView contentContainerStyle={styles.wrap}>
        <H1 style={{ textAlign: 'center' }}>{profile.child.name}의 스티커북</H1>
        <Text style={styles.sub}>{counts.size}종류 모았어요 · 날씨 놀이를 하면 새 스티커가 나와요</Text>
        <View style={styles.grid}>
          {STICKERS.map((s) => {
            const n = counts.get(s) ?? 0;
            return (
              <View key={s} style={[styles.cell, !n && styles.cellEmpty]}>
                <Text style={[styles.sticker, !n && { opacity: 0.15 }]}>{n ? s : '❔'}</Text>
                {n > 1 && <Text style={styles.count}>x{n}</Text>}
              </View>
            );
          })}
        </View>
        <BigButton variant="secondary" label="돌아가기" onPress={() => router.back()} />
      </ScrollView>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmpty: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  sticker: { fontSize: 40 },
  count: { position: 'absolute', right: 6, bottom: 4, fontFamily: fonts.title, fontSize: 13, color: colors.primaryDark },
});
