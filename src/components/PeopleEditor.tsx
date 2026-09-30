import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tap } from '@/lib/feedback';
import { colors, fonts, radius, shadow } from '@/theme';
import type { Person, PersonKind } from '@/types';
import { PersonCard } from './studio/PersonCard';

export const MAX_PEOPLE: Record<PersonKind, number> = { teacher: 8, friend: 8 };

/**
 * 선생님/친구 카드 모음. 카드를 누르면 공방(studioPath)에서 다시 꾸미고,
 * ➕ 를 누르면 새로 만든다.
 */
export function PeopleEditor({ kind, people, studioPath }: { kind: PersonKind; people: Person[]; studioPath: '/onboarding/studio' | '/parent/studio' | '/play/studio' }) {
  const mine = people.filter((p) => p.kind === kind);
  const label = kind === 'teacher' ? '선생님' : '친구';
  const open = (params: { id?: string; kind: PersonKind }) => {
    tap();
    router.push({ pathname: studioPath, params } as Href);
  };

  return (
    <View style={styles.grid}>
      {mine.map((p) => (
        <Pressable key={p.id} accessibilityLabel={`${p.name} 꾸미기`} onPress={() => open({ id: p.id, kind })} style={styles.card}>
          <PersonCard person={p} size={88} showTraits={false} />
          <Text style={styles.edit}>✏️ 다시 꾸미기</Text>
        </Pressable>
      ))}
      {mine.length < MAX_PEOPLE[kind] && (
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} 추가`} onPress={() => open({ kind })} style={[styles.card, styles.addCard]}>
          <Text style={{ fontSize: 44 }}>➕</Text>
          <Text style={styles.name}>{label} 만들기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: {
    width: 136,
    minHeight: 160,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    ...shadow,
  },
  addCard: { backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 3, borderStyle: 'dashed', borderColor: '#fff' },
  name: { fontFamily: fonts.title, fontSize: 16, color: colors.ink, marginTop: 4 },
  edit: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 2 },
});
