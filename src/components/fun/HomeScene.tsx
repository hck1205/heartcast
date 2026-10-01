import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { nameOf } from '@/games/persona';
import { selfWeatherOn } from '@/games/rewards';
import { say, tap } from '@/lib/feedback';
import { useJump } from '@/lib/motion';
import { josa } from '@/lib/josa';
import { colors, fonts } from '@/theme';
import type { AvatarConfig, Expression, PlayResponse, Profile } from '@/types';
import { Avatar } from '../Avatar';
import { Floating, Maru } from '../Mascot';
import { WeatherIcon } from '../WeatherIcon';
import { Pet } from './Pet';

const PET_SOUND: Record<string, string> = { puppy: '멍멍!', kitty: '야옹~', dino: '크앙!', unicorn: '히힝~', chick: '삐약삐약!' };
const MARU_LINES = [
  '오늘 기분은 어떤 날씨야?',
  '그림 놀이에서 선생님을 그려 봐!',
  '별을 모으면 상점에서 선물을 열 수 있어!',
  '친구들을 눌러 봐! 인사해 줄 거야',
  '관계도에서 누가 누구랑 친한지 알려 줘!',
  '나는 구름 마루야! 둥실둥실~',
];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** 시간대별 하늘 */
function skyOf(hour: number) {
  if (hour >= 20 || hour < 6) return { bg: '#2E3A5C', night: true };
  if (hour >= 17) return { bg: '#FFE1CC', night: false };
  if (hour < 10) return { bg: '#FFF1D6', night: false };
  return { bg: colors.skySoft, night: false };
}

/** 캐릭터 위 말풍선 */
function SpeechBubble({ text }: { text: string | null }) {
  return text ? <Text style={styles.bubble}>{text}</Text> : null;
}

/** 누르면 통 튀어 오르며 말풍선으로 인사하는 캐릭터 */
function Jumper({ children, line, onSay }: { children: React.ReactNode; line: () => string; onSay: (text: string) => void }) {
  const { value: y, jump } = useJump();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        const text = line();
        onSay(text);
        say(text);
        jump();
      }}
    >
      <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * 살아 있는 홈 장면: 시간대·오늘 날씨에 따라 하늘이 바뀌고,
 * 선생님·친구·나·반려 친구·마루를 누르면 통 튀어 오르며 인사한다.
 */
export function HomeScene({ profile, responses }: { profile: Profile; responses: PlayResponse[] }) {
  const [hour] = useState(() => new Date().getHours());
  const [bubble, setBubble] = useState<{ key: string; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const show = (key: string) => (text: string) => {
    setBubble({ key, text });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(null), 1800);
  };

  const sky = skyOf(hour);
  // 오늘 고른 "내 마음 날씨" (없으면 맑음)
  const weather = selfWeatherOn(responses) ?? 'sunny';
  const child = profile.child;
  const others = [...profile.people.filter((p) => p.kind === 'teacher').slice(0, 2), ...profile.people.filter((p) => p.kind === 'friend').slice(0, 2)];
  const greet = (who: string, kind: string) => () =>
    kind === 'teacher'
      ? pick([`${josa(child.name, '아/야')}, 안녕!`, '오늘도 반가워!', `${josa(child.name, '이/가')} 왔구나!`])
      : pick([`${josa(child.name, '아/야')}, 같이 놀자!`, '안녕! 나 여기 있어!', `나는 ${who}!`]);

  return (
    <View style={[styles.scene, { backgroundColor: sky.bg }]}>
      {sky.night && (
        <>
          {[
            [30, 30],
            [120, 18],
            [210, 44],
            [70, 70],
          ].map(([x, y]) => (
            <Text key={x} style={[styles.star, { left: x, top: y }]}>
              ✦
            </Text>
          ))}
        </>
      )}
      <View style={styles.sun}>
        {sky.night ? <Text style={{ fontSize: 48 }}>🌙</Text> : <WeatherIcon code={weather} size={64} />}
      </View>
      <View style={styles.maru}>
        <Jumper line={() => pick(MARU_LINES)} onSay={show('maru')}>
          <Floating distance={6} duration={1600}>
            <Maru size={54} mood={bubble?.key === 'maru' ? 'wink' : 'happy'} />
          </Floating>
        </Jumper>
        <SpeechBubble text={bubble?.key === 'maru' ? bubble.text : null} />
      </View>

      <View style={styles.backRow}>
        {others.map((p) => (
          <View key={p.id} style={{ alignItems: 'center' }}>
            <SpeechBubble text={bubble?.key === p.id ? bubble.text : null} />
            <Jumper line={greet(nameOf(p), p.kind)} onSay={show(p.id)}>
              <Avatar avatar={p.avatar} size={72} expression={bubble?.key === p.id ? 'happy' : p.kind === 'teacher' ? 'calm' : 'happy'} />
            </Jumper>
          </View>
        ))}
      </View>
      <View style={styles.front}>
        <View style={{ alignItems: 'center' }}>
          <SpeechBubble text={bubble?.key === 'me' ? bubble.text : null} />
          <Jumper line={() => pick([`나는 ${child.name}!`, '오늘도 신나게 놀자!', '야호!'])} onSay={show('me')}>
            <Avatar avatar={child.avatar as AvatarConfig} size={140} expression={'happy' as Expression} />
          </Jumper>
        </View>
        {profile.pet && (
          <View style={styles.pet}>
            <SpeechBubble text={bubble?.key === 'pet' ? bubble.text : null} />
            <Jumper line={() => PET_SOUND[profile.pet!] ?? '안녕!'} onSay={show('pet')}>
              <Floating distance={4} duration={900}>
                <Pet id={profile.pet} size={58} />
              </Floating>
            </Jumper>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, maxHeight: 360, alignItems: 'center', justifyContent: 'flex-end', minHeight: 240, borderRadius: 28, overflow: 'hidden' },
  sun: { position: 'absolute', top: 16, right: 16 },
  maru: { position: 'absolute', top: 10, left: 12, alignItems: 'flex-start' },
  star: { position: 'absolute', color: '#FFF6D0', fontSize: 14 },
  backRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end' },
  front: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -26 },
  pet: { position: 'absolute', right: -58, bottom: 4, alignItems: 'center' },
  bubble: {
    fontFamily: fonts.title,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
    marginBottom: 2,
    maxWidth: 150,
  },
});
