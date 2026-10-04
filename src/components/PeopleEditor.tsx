import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KIND_LABEL } from '@/games/persona';
import { tap } from '@/lib/feedback';
import { colors, fonts, radius } from '@/theme';
import type { Person, PersonKind } from '@/types';
import { PersonCard } from './studio/PersonCard';

/** 선생님 8명 · 우리 반 친구 30명 · 어른(엄마·아빠·친구 부모님 등) 12명 */
export const MAX_PEOPLE: Record<PersonKind, number> = { teacher: 8, friend: 30, parent: 12 };

/**
 * 선생님/친구 카드 모음. 카드를 누르면 공방(studioPath)에서 다시 꾸미고,
 * ➕ 를 누르면 새로 만든다.
 */
export function PeopleEditor({ kind, people, studioPath }: { kind: PersonKind; people: Person[]; studioPath: '/onboarding/studio' | '/parent/studio' | '/play/studio' }) {
  const mine = people.filter((p) => p.kind === kind);
  const label = KIND_LABEL[kind];
  const open = (params: { id?: string; kind: PersonKind }) => {
    tap();
    router.push({ pathname: studioPath, params } as Href);
  };

  return (
    <View style={styles.grid}>
      {mine.map((p) => (
        <Pressable key={p.id} accessibilityLabel={`${p.name} 꾸미기`} onPress={() => open({ id: p.id, kind })} style={styles.card}>
          <PersonCard person={p} size={88} showTraits={false} />
          <Text style={styles.edit}>다시 꾸미기</Text>
        </Pressable>
      ))}
      {mine.length < MAX_PEOPLE[kind] && (
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} 추가`} onPress={() => open({ kind })} style={[styles.card, styles.addCard]}>
          <Text style={{ fontSize: 34, color: colors.inkMuted }}>＋</Text>
          <Text style={styles.name}>{label} 만들기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  card: {
    width: 140,
    minHeight: 150,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  addCard: { backgroundColor: 'transparent', borderWidth: 2, borderStyle: 'dashed', borderColor: '#D9D1C4' },
  name: { fontFamily: fonts.title, fontSize: 16, color: colors.inkSoft, marginTop: 4 },
  edit: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 2 },
});
