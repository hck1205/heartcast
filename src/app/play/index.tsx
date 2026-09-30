import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Floating, MaruSays } from '@/components/Mascot';
import { BigButton, SkyBackground } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { say } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius, shadow } from '@/theme';

function playedToday(dates: string[]) {
  const today = new Date().toDateString();
  return dates.some((d) => new Date(d).toDateString() === today);
}

export default function PlayHome() {
  const { profile, responses, setParentUnlocked } = useApp();
  const done = playedToday(responses.map((r) => r.createdAt));
  const name = profile?.child.name ?? '';
  const greeting = done
    ? `${josa(name, '아/야')}, 오늘도 날씨 놀이 해줘서 고마워! 한 번 더 할래?`
    : `${josa(name, '아/야')}, 안녕! 오늘 마음날씨 마을에 놀러 갈까?`;

  useEffect(() => {
    setParentUnlocked(false);
    const t = setTimeout(() => say(greeting), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) return null;
  const teachers = profile.people.filter((p) => p.kind === 'teacher');
  const friends = profile.people.filter((p) => p.kind === 'friend');

  return (
    <SkyBackground>
      <View style={styles.top}>
        <View style={styles.stars}>
          <Text style={styles.starsText}>⭐ {profile.stars}</Text>
        </View>
        <Pressable accessibilityLabel="부모님 화면" onLongPress={() => router.push('/parent/gate')} onPress={() => router.push('/parent/gate')} style={styles.lock}>
          <Text style={{ fontSize: 16 }}>🔒</Text>
          <Text style={styles.lockText}>부모님</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <MaruSays text={greeting} size={80} />

        <View style={styles.village}>
          <View style={styles.sunSpot}>
            <Floating distance={10}>
              <WeatherIcon code="sunny" size={96} />
            </Floating>
          </View>
          {/* 뒷줄: 선생님·친구, 앞줄: 우리 아이 — 단체 사진처럼 */}
          <View style={styles.people}>
            {[...teachers.slice(0, 2), ...friends.slice(0, 3)].map((p, i) => (
              <Floating key={p.id} duration={1700 + i * 350} distance={4}>
                <Avatar avatar={p.avatar} size={72} expression={p.kind === 'teacher' ? 'calm' : 'happy'} />
              </Floating>
            ))}
          </View>
          <View style={styles.front}>
            <Floating duration={1500} distance={6}>
              <Avatar avatar={profile.child.avatar} size={150} expression="happy" />
            </Floating>
          </View>
        </View>

        <BigButton label={done ? '한 번 더 놀기' : '날씨 모험 시작!'} icon="🌈" onPress={() => router.push('/play/session')} />
        <View style={styles.row}>
          <Pressable onPress={() => router.push('/play/stickers')} style={styles.tile}>
            <Text style={{ fontSize: 34 }}>📒</Text>
            <Text style={styles.tileText}>스티커북</Text>
            <Text style={styles.tileSub}>{profile.stickers.length}개 모았어요</Text>
          </Pressable>
          <View style={[styles.tile, { backgroundColor: '#FFF6D6' }]}>
            <Text style={{ fontSize: 34 }}>{done ? '✅' : '🗓️'}</Text>
            <Text style={styles.tileText}>{done ? '오늘 완료!' : '오늘의 놀이'}</Text>
            <Text style={styles.tileSub}>{done ? '내일 또 만나요' : '5분이면 끝나요'}</Text>
          </View>
        </View>
      </View>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  stars: { backgroundColor: colors.paper, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6, ...shadow },
  starsText: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lockText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  body: { flex: 1, padding: 20, gap: 18, justifyContent: 'space-between' },
  village: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', minHeight: 220 },
  sunSpot: { position: 'absolute', top: 0, right: 10 },
  people: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 4 },
  front: { marginTop: -36 },
  row: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, backgroundColor: colors.paper, borderRadius: radius.lg, padding: 14, alignItems: 'center', ...shadow },
  tileText: { fontFamily: fonts.title, fontSize: 17, color: colors.ink, marginTop: 4 },
  tileSub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
});
