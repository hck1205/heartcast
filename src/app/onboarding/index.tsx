import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Floating, Maru } from '@/components/Mascot';
import { BigButton, Body, H1, SkyBackground } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { colors, fonts, radius, shadow } from '@/theme';

const SLIDES = [
  {
    key: 'kid',
    title: '아이에게는\n신나는 날씨 놀이',
    body: '선생님, 친구 아바타 머리 위에\n해님·구름·비 스티커를 붙이며 놀아요.',
    art: 'kid' as const,
  },
  {
    key: 'report',
    title: '부모에게는\n마음날씨 리포트',
    body: '아이가 어린이집을 어떻게 느끼는지\n날씨 그림과 흐름으로 한눈에 보여드려요.',
    art: 'report' as const,
  },
  {
    key: 'talk',
    title: '"그랬구나"\n공감 대화 카드',
    body: '왜 그렇게 느꼈는지 부드럽게 묻고\n아이 마음을 안아주는 말을 추천해요.',
    art: 'talk' as const,
  },
];

function Art({ kind }: { kind: 'kid' | 'report' | 'talk' }) {
  if (kind === 'kid')
    return (
      <View style={styles.artRow}>
        <View style={{ alignItems: 'center' }}>
          <Floating>
            <WeatherIcon code="sunny" size={70} />
          </Floating>
          <Avatar avatar={{ skin: 'peach', hair: 'long', hairColor: '#6B4226', shirt: '#FF9EC4', headwear: 'flower', eyes: 'lashes', top: 'apron' }} expression="happy" size={110} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Floating duration={2200}>
            <WeatherIcon code="partly" size={70} />
          </Floating>
          <Avatar avatar={{ skin: 'tan', hair: 'spiky', hairColor: '#3B2A20', shirt: '#7BD389', headwear: 'cap', top: 'hoodie', pattern: 'stripe' }} expression="calm" size={110} />
        </View>
      </View>
    );
  if (kind === 'report')
    return (
      <View style={[styles.reportArt]}>
        {(['sunny', 'partly', 'sunny', 'cloudy', 'rainy', 'partly', 'sunny'] as const).map((w, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 4 }}>
            <WeatherIcon code={w} size={38} />
            <Text style={styles.day}>{'월화수목금토일'[i]}</Text>
          </View>
        ))}
      </View>
    );
  return (
    <View style={styles.artRow}>
      <Floating>
        <Maru size={130} mood="wink" />
      </Floating>
      <View style={styles.talkBubble}>
        <Text style={styles.talkText}>{'“그랬구나~\n말해줘서 고마워”'}</Text>
      </View>
    </View>
  );
}

export default function Welcome() {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <SkyBackground>
      <View style={styles.wrap}>
        <View style={styles.logoRow}>
          <WeatherIcon code="partly" size={44} />
          <Text style={styles.logo}>마음날씨</Text>
        </View>
        <View style={styles.art}>
          <Art kind={slide.art} />
        </View>
        <H1 style={styles.title}>{slide.title}</H1>
        <Body muted style={styles.body}>
          {slide.body}
        </Body>
        <View style={styles.dots}>
          {SLIDES.map((s, idx) => (
            <View key={s.key} style={[styles.dot, idx === i && styles.dotOn]} />
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <BigButton
          label={last ? '시작하기' : '다음'}
          icon={last ? '🌈' : '👉'}
          onPress={() => (last ? router.push('/onboarding/account') : setI(i + 1))}
        />
        {!last && (
          <Text style={styles.skip} onPress={() => router.push('/onboarding/account')}>
            건너뛰기
          </Text>
        )}
      </View>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, alignItems: 'stretch' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8 },
  logo: { fontFamily: fonts.title, fontSize: 28, color: colors.ink },
  art: { height: 250, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  artRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  reportArt: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow,
  },
  day: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  talkBubble: { backgroundColor: colors.paper, borderRadius: 24, padding: 16, ...shadow },
  talkText: { fontFamily: fonts.title, fontSize: 20, color: colors.primaryDark, lineHeight: 28 },
  title: { textAlign: 'center', marginTop: 8 },
  body: { textAlign: 'center', marginTop: 10, fontSize: 17, lineHeight: 26 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 18 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(46,58,89,0.2)' },
  dotOn: { width: 26, backgroundColor: colors.primary },
  skip: { textAlign: 'center', fontFamily: fonts.body, color: colors.inkSoft, marginTop: 14, fontSize: 15, padding: 6 },
});
