import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Floating, MaruSays } from '@/components/Mascot';
import { BigButton, Body, Card, Confetti, H1, SkyBackground, SkyProgress } from '@/components/ui';
import { celebrate } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';

export default function Done() {
  const app = useApp();
  const [loading, setLoading] = useState(false);
  useEffect(() => celebrate(), []);
  if (!app.profile) return null;
  const { child, people } = app.profile;

  const fillDemo = async () => {
    setLoading(true);
    try {
      await app.loadDemoData();
      app.setParentUnlocked(true);
      router.replace('/parent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SkyBackground>
      <SkyProgress step={6} total={6} />
      <ScrollView contentContainerStyle={styles.wrap}>
        <H1 style={{ textAlign: 'center' }}>준비 완료! 🎉</H1>
        <View style={styles.parade}>
          <Floating>
            <Avatar avatar={child.avatar} expression="happy" size={110} />
            <Text style={styles.name}>{child.name}</Text>
          </Floating>
          {people.slice(0, 4).map((p, i) => (
            <Floating key={p.id} duration={1600 + i * 300}>
              <Avatar avatar={p.avatar} expression="happy" size={72} />
              <Text style={styles.small}>{p.name}</Text>
            </Floating>
          ))}
        </View>
        <MaruSays text={`${child.name}의 마음날씨 마을이 만들어졌어요! 이제 휴대폰을 아이에게 건네주세요.`} mood="wow" size={80} />
        <Card style={{ gap: 6 }}>
          <Text style={styles.tipTitle}>👨‍👩‍👧 이렇게 쓰면 좋아요</Text>
          <Body muted style={{ fontSize: 15 }}>
            • 하원 후 하루 한 번, 5분이면 충분해요{'\n'}• 옆에서 지켜보되 답을 고르게 도와주지는 마세요{'\n'}• 리포트는 아이가 없을 때 PIN으로 열어 보세요
          </Body>
        </Card>
        <BigButton label={`${josa(child.name, '이랑/랑')} 놀러 가기`} icon="🌤️" onPress={() => router.replace('/play')} />
        {app.mode === 'demo' && (
          <BigButton
            label={loading ? '만드는 중…' : '예시 기록으로 리포트 미리보기'}
            icon="📊"
            color={colors.paper}
            textColor={colors.ink}
            disabled={loading}
            onPress={fillDemo}
          />
        )}
      </ScrollView>
      <Confetti />
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 18, paddingBottom: 60 },
  parade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 6 },
  name: { fontFamily: fonts.title, fontSize: 18, color: colors.ink, textAlign: 'center' },
  small: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, textAlign: 'center' },
  tipTitle: { fontFamily: fonts.title, fontSize: 17, color: colors.ink },
});
