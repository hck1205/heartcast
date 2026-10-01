import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SELF } from '@/games/art';
import { nameOf } from '@/games/persona';
import { colors, fonts } from '@/theme';
import type { AvatarConfig, Drawing, Profile } from '@/types';
import { ArtCanvas } from './ArtCanvas';

export function avatarLookup(profile: Profile) {
  return (id: string): AvatarConfig | null => (id === SELF ? profile.child.avatar : (profile.people.find((p) => p.id === id)?.avatar ?? null));
}

export function labelLookup(profile: Profile) {
  return (id: string) => {
    if (id === SELF) return profile.child.name;
    const p = profile.people.find((x) => x.id === id);
    return p ? nameOf(p) : '';
  };
}

export function drawingTitle(d: Drawing, profile: Profile) {
  if (d.kind === 'scene') return '우리 반 그림';
  const p = profile.people.find((x) => x.id === d.subjectId);
  return p ? nameOf(p) : '(지워진 사람)';
}

/** 아이가 그린 그림 썸네일 줄 (최신 순). 누르면 그림 상세로 */
export function DrawingStrip({ drawings, profile, size = 116 }: { drawings: Drawing[]; profile: Profile; size?: number }) {
  const list = [...drawings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const avatarOf = avatarLookup(profile);
  if (!list.length) return <Text style={styles.empty}>아직 그린 그림이 없어요. 아이 화면의 “그림” 놀이에서 그려요.</Text>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {list.map((d) => (
        <Pressable
          key={d.id}
          accessibilityLabel={`${drawingTitle(d, profile)} 그림 보기`}
          onPress={() => router.push({ pathname: '/parent/drawing/[id]', params: { id: d.id } })}
          style={({ pressed }) => [{ width: size }, pressed && { opacity: 0.7 }]}
        >
          <View pointerEvents="none">
            <ArtCanvas drawing={d} avatarOf={avatarOf} labelOf={labelLookup(profile)} width={size} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {drawingTitle(d, profile)}
          </Text>
          <Text style={styles.date}>{new Date(d.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  title: { fontFamily: fonts.body, fontWeight: '700', fontSize: 13, color: colors.ink, marginTop: 4 },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
});
