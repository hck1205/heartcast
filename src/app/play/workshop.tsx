import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MaruSays } from '@/components/Mascot';
import { MAX_PEOPLE } from '@/components/PeopleEditor';
import { PersonCard } from '@/components/studio/PersonCard';
import { BigButton, H1, SkyBackground } from '@/components/ui';
import { say, tap } from '@/lib/feedback';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius, shadow } from '@/theme';
import type { PersonKind } from '@/types';

const GREETING = '여기는 선생님 공방이야! 선생님이랑 친구를 만들고, 마음이 바뀌면 다시 꾸며 봐.';

/** 아이용 "선생님 공방": 만든 선생님·친구 카드를 모아 보고, 새로 만들거나 다시 꾸민다 */
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
            <Pressable key={p.id} accessibilityLabel={`${p.name} 다시 꾸미기`} onPress={() => open({ id: p.id, kind })} style={styles.card}>
              <PersonCard person={p} size={96} />
              <Text style={styles.remake}>🖌️ 다시 꾸미기</Text>
            </Pressable>
          ))}
          {list.length < MAX_PEOPLE[kind] && (
            <Pressable accessibilityLabel={`${title} 새로 만들기`} onPress={() => open({ kind })} style={[styles.card, styles.add]}>
              <Text style={{ fontSize: 46 }}>➕</Text>
              <Text style={styles.addText}>{kind === 'teacher' ? '새 선생님' : '새 친구'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SkyBackground top="#FFE3B3" bottom="#FFF9EE" hills={false}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <H1 style={{ textAlign: 'center' }}>🎨 선생님 공방</H1>
        <MaruSays text={GREETING} size={70} />
        {shelf('teacher', '👩‍🏫 우리 선생님')}
        {shelf('friend', '🧒 내 친구')}
        <BigButton label="마을로 돌아가기" icon="🏡" color={colors.paper} textColor={colors.ink} onPress={() => router.back()} />
      </ScrollView>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, gap: 18, paddingBottom: 40 },
  shelf: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: radius.lg, padding: 14, gap: 12 },
  shelfTitle: { fontFamily: fonts.title, fontSize: 20, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: { width: 146, backgroundColor: colors.paper, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', ...shadow },
  remake: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 4 },
  add: { justifyContent: 'center', minHeight: 180, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 3, borderStyle: 'dashed', borderColor: '#FFD9A8' },
  addText: { fontFamily: fonts.title, fontSize: 16, color: colors.primaryDark, marginTop: 4 },
});
