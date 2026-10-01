import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BigButton, Screen } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { say } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

function playedToday(dates: string[]) {
  const today = new Date().toDateString();
  return dates.some((d) => new Date(d).toDateString() === today);
}

/** 아이 홈: 인사 한 줄 · 우리 반 모습 · 큰 버튼 하나 · 작은 타일 둘 */
export default function PlayHome() {
  const { profile, responses, setParentUnlocked } = useApp();
  const done = playedToday(responses.map((r) => r.createdAt));
  const name = profile?.child.name ?? '';
  const greeting = done ? `${josa(name, '아/야')}, 한 번 더 할까?` : `${josa(name, '아/야')}, 안녕!`;

  useEffect(() => {
    setParentUnlocked(false);
    const t = setTimeout(() => say(done ? greeting : `${greeting} 오늘 마음 날씨 놀이 하러 가자!`), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) return null;
  const others = [...profile.people.filter((p) => p.kind === 'teacher').slice(0, 2), ...profile.people.filter((p) => p.kind === 'friend').slice(0, 2)];

  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.stars}>⭐ {profile.stars}</Text>
        <Pressable accessibilityLabel="부모님 화면" onPress={() => router.push('/parent/gate')} style={styles.lock} hitSlop={10}>
          <Text style={styles.lockText}>🔒</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View>
          <Text style={styles.hello}>{greeting}</Text>
          <Text style={styles.helloSub}>{done ? '오늘 놀이는 다 했어요 ☀️' : '오늘 어린이집 날씨는 어땠어?'}</Text>
        </View>

        {/* 우리 반 모습 */}
        <View style={styles.scene}>
          <View style={styles.sun}>
            <WeatherIcon code="sunny" size={64} />
          </View>
          <View style={styles.backRow}>
            {others.map((p) => (
              <Avatar key={p.id} avatar={p.avatar} size={72} expression={p.kind === 'teacher' ? 'calm' : 'happy'} />
            ))}
          </View>
          <View style={{ marginTop: -26 }}>
            <Avatar avatar={profile.child.avatar} size={140} expression="happy" />
          </View>
        </View>

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
  lock: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  lockText: { fontSize: 16 },
  body: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, gap: 18 },
  hello: { fontFamily: fonts.title, fontSize: 30, color: colors.ink, marginTop: 8 },
  helloSub: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft, marginTop: 4 },
  scene: { flex: 1, maxHeight: 360, alignItems: 'center', justifyContent: 'flex-end', minHeight: 240, backgroundColor: colors.skySoft, borderRadius: 28, overflow: 'hidden' },
  sun: { position: 'absolute', top: 16, right: 16 },
  backRow: { flexDirection: 'row', gap: 6 },
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
