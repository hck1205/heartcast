import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton, Screen } from '@/components/ui';
import { HomeScene } from '@/components/fun/HomeScene';
import { WeekStamps } from '@/components/fun/WeekStamps';
import { playedOn, streak, weekStamps } from '@/games/rewards';
import { say } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

/** 아이 홈: 인사 한 줄 · 우리 반 모습 · 큰 버튼 하나 · 작은 타일 둘 */
export default function PlayHome() {
  const { profile, responses, setParentUnlocked } = useApp();
  const done = playedOn(responses);
  const name = profile?.child.name ?? '';
  const greeting = done ? `${josa(name, '아/야')}, 한 번 더 할까?` : `${josa(name, '아/야')}, 안녕!`;

  useEffect(() => {
    setParentUnlocked(false);
    const t = setTimeout(() => say(done ? greeting : `${greeting} 오늘 마음 날씨 놀이 하러 가자!`), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) return null;

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable accessibilityLabel="별 상점" onPress={() => router.push('/play/shop')} style={styles.shop} hitSlop={6}>
          <Text style={styles.stars}>⭐ {profile.stars}</Text>
          <Text style={styles.shopText}>상점</Text>
        </Pressable>
        <Pressable accessibilityLabel="부모님 화면" onPress={() => router.push('/parent/gate')} style={styles.lock} hitSlop={10}>
          <Text style={styles.lockText}>🔒</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View>
          <Text style={styles.hello}>{greeting}</Text>
          <Text style={styles.helloSub}>{done ? '오늘 놀이는 다 했어요 ☀️' : '오늘 어린이집 날씨는 어땠어?'}</Text>
        </View>

        <WeekStamps days={weekStamps(responses)} streak={streak(responses)} />

        {/* 살아 있는 우리 반 모습: 누르면 인사해요 */}
        <HomeScene profile={profile} responses={responses} />

        <BigButton label={done ? '한 번 더 놀기' : '날씨 놀이 시작'} onPress={() => router.push('/play/session')} style={styles.main} />

        <View style={styles.row}>
          <Pressable onPress={() => router.push('/play/art')} style={styles.tile}>
            <Text style={styles.tileIcon}>🖍️</Text>
            <Text style={styles.tileText}>그림</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/play/workshop')} style={styles.tile}>
            <Text style={styles.tileIcon}>🎨</Text>
            <Text style={styles.tileText}>공방</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/play/relations')} style={styles.tile}>
            <Text style={styles.tileIcon}>🕸️</Text>
            <Text style={styles.tileText}>관계도</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/play/diary')} style={styles.tile}>
            <Text style={styles.tileIcon}>📔</Text>
            <Text style={styles.tileText}>일기</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/play/stickers')} style={styles.tile}>
            <Text style={styles.tileIcon}>📒</Text>
            <Text style={styles.tileText}>스티커</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  stars: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  shop: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.paper, borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 4 },
  shopText: { fontFamily: fonts.title, fontSize: 14, color: colors.primaryDark },
  lock: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  lockText: { fontSize: 16 },
  body: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  hello: { fontFamily: fonts.title, fontSize: 30, color: colors.ink, marginTop: 8 },
  helloSub: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft, marginTop: 4 },
  main: { minHeight: 64 },
  row: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tileIcon: { fontSize: 34 },
  tileText: { fontFamily: fonts.title, fontSize: 16, color: colors.ink },
});
