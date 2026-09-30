import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MAX_PEOPLE } from '@/components/PeopleEditor';
import { PersonCard } from '@/components/studio/PersonCard';
import { SkyBackground } from '@/components/ui';
import { KIND_LABEL } from '@/games/persona';
import { say, tap } from '@/lib/feedback';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { PersonKind } from '@/types';

const GREETING = '우리 반 공방이야! 선생님, 친구, 어른들을 만들어 봐.';

/** 아이용 "우리 반 공방": 선생님·친구·어른 카드를 모아 보고, 새로 만들거나 다시 꾸민다 */
export default function Workshop() {
  const { profile } = useApp();
  useEffect(() => {
    const t = setTimeout(() => say(GREETING), 300);
    return () => clearTimeout(t);
  }, []);
  if (!profile) return null;

  const open = (params: { id?: string; kind: PersonKind }) => {
    tap();
    router.push({ pathname: '/play/studio', params });
  };

  const shelf = (kind: PersonKind, title: string) => {
    const list = profile.people.filter((p) => p.kind === kind);
    return (
      <View style={styles.shelf}>
        <Text style={styles.shelfTitle}>{title}</Text>
        <View style={styles.grid}>
          {list.map((p) => (
            <Pressable key={p.id} accessibilityLabel={`${p.name} 다시 꾸미기`} onPress={() => open({ id: p.id, kind })} style={[styles.card, kind !== 'teacher' && styles.small]}>
              <PersonCard person={p} size={kind === 'teacher' ? 96 : 76} showTraits={kind === 'teacher'} />
              <Text style={styles.remake}>다시 꾸미기</Text>
            </Pressable>
          ))}
          {list.length < MAX_PEOPLE[kind] && (
            <Pressable accessibilityLabel={`${title} 새로 만들기`} onPress={() => open({ kind })} style={[styles.card, styles.add, kind !== 'teacher' && styles.small]}>
              <Text style={{ fontSize: 34, color: colors.inkMuted }}>＋</Text>
              <Text style={styles.addText}>새 {KIND_LABEL[kind]}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SkyBackground>
      <View style={styles.header}>
        <Pressable accessibilityLabel="뒤로" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>우리 반 공방</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.wrap}>
        {shelf('teacher', '우리 선생님')}
        {shelf('friend', '우리 반 친구')}
        {shelf('parent', '엄마·아빠·어른')}
      </ScrollView>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 6 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 32, color: colors.ink, marginTop: -4 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.title, fontSize: 20, color: colors.ink },
  wrap: { padding: 16, gap: 22, paddingBottom: 40 },
  shelf: { gap: 10 },
  shelfTitle: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: { width: 150, backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingVertical: 12, alignItems: 'center' },
  small: { width: 108, paddingVertical: 10 },
  remake: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 4 },
  add: { justifyContent: 'center', minHeight: 130, backgroundColor: 'transparent', borderWidth: 2, borderStyle: 'dashed', borderColor: '#D9D1C4' },
  addText: { fontFamily: fonts.title, fontSize: 16, color: colors.inkSoft, marginTop: 4 },
});
