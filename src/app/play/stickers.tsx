import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KidHeader } from '@/components/kid/KidTop';
import { SkyBackground, Tabs } from '@/components/ui';
import { STICKERS } from '@/games/content';
import { BADGES } from '@/games/rewards';
import { tap } from '@/lib/feedback';
import { usePagePoint } from '@/lib/usePagePoint';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

type Tab = 'board' | 'all' | 'badges';

/** 스티커북: 스티커판(자유롭게 붙이기) · 모음 · 배지 */
export default function StickerBook() {
  const app = useApp();
  const profile = app.profile;
  const [tab, setTab] = useState<Tab>('board');
  const [picked, setPicked] = useState<string | null>(null);
  const { ref: boxRef, measure, ratio } = usePagePoint();
  if (!profile) return null;

  const counts = new Map<string, number>();
  for (const s of profile.stickers) counts.set(s, (counts.get(s) ?? 0) + 1);
  const board = profile.stickerBoard ?? [];
  const used = (id: string) => board.filter((b) => b.id === id).length;
  const badges = new Set(profile.badges ?? []);

  return (
    <SkyBackground>
      <KidHeader onClose={() => router.back()} center={`${profile.child.name}의 스티커북`} />
      <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
        <Tabs
          items={[
            { id: 'board', label: '스티커판' },
            { id: 'all', label: `모음 ${counts.size}` },
            { id: 'badges', label: `배지 ${badges.size}` },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'board' && (
        <View style={styles.boardWrap}>
          <Text style={styles.sub}>{picked ? '판을 눌러서 붙여 봐! (붙인 걸 누르면 떼어져)' : '아래에서 스티커를 골라 봐!'}</Text>
          <Pressable
            ref={boxRef}
            onLayout={measure}
            onPressIn={measure}
            accessibilityLabel="스티커판"
            onPress={(e) => {
              if (!picked || used(picked) >= (counts.get(picked) ?? 0)) return;
              tap();
              const r = ratio(e);
              const x = Math.min(0.95, Math.max(0.05, r.x));
              const y = Math.min(0.95, Math.max(0.05, r.y));
              app.saveStickerBoard([...board, { id: picked, x, y }]);
            }}
            style={styles.board}
          >
            {board.map((b, i) => (
              <Pressable
                key={i}
                accessibilityLabel={`${b.id} 떼기`}
                onPress={() => {
                  tap();
                  app.saveStickerBoard(board.filter((_, j) => j !== i));
                }}
                style={[styles.placed, { left: `${b.x * 100}%`, top: `${b.y * 100}%` }]}
              >
                <Text style={{ fontSize: 40 }}>{b.id}</Text>
              </Pressable>
            ))}
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tray}>
            {[...counts].map(([id, n]) => {
              const left = n - used(id);
              return (
                <Pressable
                  key={id}
                  accessibilityLabel={`${id} 고르기`}
                  onPress={() => {
                    tap();
                    setPicked(picked === id ? null : id);
                  }}
                  style={[styles.trayItem, picked === id && styles.on, left <= 0 && { opacity: 0.35 }]}
                >
                  <Text style={{ fontSize: 32 }}>{id}</Text>
                  <Text style={styles.left}>{left}</Text>
                </Pressable>
              );
            })}
            {counts.size === 0 && <Text style={styles.sub}>날씨 놀이를 하면 스티커가 생겨요</Text>}
          </ScrollView>
        </View>
      )}

      {tab === 'all' && (
        <ScrollView contentContainerStyle={styles.wrap}>
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
        </ScrollView>
      )}

      {tab === 'badges' && (
        <ScrollView contentContainerStyle={styles.wrap}>
          <View style={styles.grid}>
            {BADGES.map((b) => {
              const got = badges.has(b.id);
              return (
                <View key={b.id} style={[styles.badge, !got && styles.cellEmpty]}>
                  <View style={[styles.medal, !got && { backgroundColor: 'transparent', borderColor: colors.line }]}>
                    <Text style={{ fontSize: 34, opacity: got ? 1 : 0.2 }}>{got ? b.emoji : '❔'}</Text>
                  </View>
                  <Text style={styles.badgeName}>{b.label}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 40 },
  boardWrap: { flex: 1, padding: 16, gap: 10 },
  board: {
    flex: 1,
    backgroundColor: '#FFF8E8',
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: '#F3D9A4',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placed: { position: 'absolute', marginLeft: -24, marginTop: -26 },
  tray: { gap: 8, paddingVertical: 4 },
  trayItem: { width: 60, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  on: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  left: { position: 'absolute', right: 4, bottom: 2, fontFamily: fonts.title, fontSize: 12, color: colors.primaryDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  cellEmpty: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  sticker: { fontSize: 40 },
  count: { position: 'absolute', right: 6, bottom: 4, fontFamily: fonts.title, fontSize: 13, color: colors.primaryDark },
  badge: { width: 104, alignItems: 'center', padding: 8, borderRadius: radius.lg, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, gap: 4 },
  medal: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFE9A8', borderWidth: 3, borderColor: '#F5B83D', alignItems: 'center', justifyContent: 'center' },
  badgeName: { fontFamily: fonts.title, fontSize: 14, color: colors.ink, textAlign: 'center' },
  badgeDesc: { fontFamily: fonts.body, fontSize: 11, color: colors.inkMuted, textAlign: 'center' },
});
