import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { shortDate } from '@/lib/format';
import { avatarFor, makeWho } from '@/games/people';
import { colors, fonts } from '@/theme';
import type { Drawing, Profile } from '@/types';
import { ArtCanvas } from './ArtCanvas';

export function drawingTitle(d: Drawing, profile: Profile) {
  return d.kind === 'scene' ? '우리 반 그림' : makeWho(profile.people, profile.child.name)(d.subjectId ?? '');
}

/** 아이가 그린 그림 썸네일 줄 (최신 순). 누르면 그림 상세로 */
export function DrawingStrip({ drawings, profile, size = 116 }: { drawings: Drawing[]; profile: Profile; size?: number }) {
  const list = [...drawings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const avatarOf = avatarFor(profile);
  const labelOf = makeWho(profile.people, profile.child.name);
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
            <ArtCanvas drawing={d} avatarOf={avatarOf} labelOf={labelOf} width={size} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {drawingTitle(d, profile)}
          </Text>
          <Text style={styles.date}>{shortDate(d.createdAt)}</Text>
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
