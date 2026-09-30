import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { PersonCard } from '@/components/studio/PersonCard';
import { BigButton, Confetti, Screen, SkyProgress } from '@/components/ui';
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
    <Screen>
      <SkyProgress step={7} total={7} />
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>준비 완료!</Text>
        <Text style={styles.sub}>이제 휴대폰을 {child.name}에게 건네주세요.{'\n'}하원 후 하루 한 번, 5분이면 충분해요.</Text>
        <View style={styles.parade}>
          <View style={{ alignItems: 'center' }}>
            <Avatar avatar={child.avatar} expression="happy" size={110} />
            <Text style={styles.name}>{child.name}</Text>
          </View>
          {people.slice(0, 4).map((p) => (
            <PersonCard key={p.id} person={p} size={66} showTraits={false} />
          ))}
        </View>
        <Text style={styles.tip}>리포트는 아이가 없을 때 비밀번호로 열어 보세요. 아이가 고를 때 답을 도와주지는 마세요.</Text>
      </ScrollView>
      <View style={styles.footer}>
        <BigButton label={`${josa(child.name, '이랑/랑')} 놀러 가기`} onPress={() => router.replace('/play')} />
        {app.mode === 'demo' && (
          <BigButton variant="ghost" label={loading ? '만드는 중…' : '예시 기록으로 리포트 미리보기'} disabled={loading} onPress={fillDemo} />
        )}
      </View>
      <Confetti />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, gap: 16 },
  title: { fontFamily: fonts.title, fontSize: 30, color: colors.ink, marginTop: 8 },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  parade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: 16,
    backgroundColor: colors.skySoft,
    borderRadius: 24,
  },
  name: { fontFamily: fonts.title, fontSize: 16, color: colors.ink, textAlign: 'center' },
  tip: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.inkMuted },
  footer: { padding: 20, gap: 4 },
});
