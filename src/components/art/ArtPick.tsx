import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { nameOf } from '@/games/persona';
import { colors, fonts, radius } from '@/theme';
import type { Drawing, Person } from '@/types';
import { Avatar } from '../Avatar';

/** 무엇을 그릴까: 우리 반 그리기 + 선생님·원장님·가족 카드 (친구는 우리 반 그림에서) */
export function ArtPick({ people, onPick }: { people: Person[]; onPick: (kind: Drawing['kind'], subjectId: string | null) => void }) {
  const choices = people.filter((p) => p.kind !== 'friend');
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Pressable accessibilityLabel="우리 반 그리기" onPress={() => onPick('scene', null)} style={styles.sceneCard}>
        <Text style={{ fontSize: 40 }}>🏫</Text>
        <Text style={styles.sceneText}>우리 반 그리기</Text>
      </Pressable>
      <View style={styles.grid}>
        {choices.map((p) => (
          <Pressable key={p.id} accessibilityLabel={`${nameOf(p)} 그리기`} onPress={() => onPick('portrait', p.id)} style={styles.card}>
            <Avatar avatar={p.avatar} size={78} />
            <Text style={styles.name} numberOfLines={1}>
              {nameOf(p)}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14 },
  sceneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.skySoft,
    borderWidth: 2,
    borderColor: colors.sky,
  },
  sceneText: { fontFamily: fonts.title, fontSize: 22, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  card: { width: 108, paddingVertical: 10, alignItems: 'center', borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  name: { fontFamily: fonts.title, fontSize: 14, color: colors.ink, marginTop: 4 },
});
