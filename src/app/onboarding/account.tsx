import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { BigButton, Body, Card, H2 } from '@/components/ui';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

export default function Account() {
  const app = useApp();
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const afterAuth = async () => {
    // 이미 설정을 마친 계정이면 바로 놀이로
    router.replace('/');
  };

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (tab === 'signup') await app.signUp(email.trim(), password);
      else await app.signIn(email.trim(), password);
      await afterAuth();
    } catch (e: any) {
      setMsg(e?.message ?? '다시 시도해 주세요');
    } finally {
      setBusy(false);
    }
  };

  const demo = async () => {
    await app.startDemo();
    router.push('/onboarding/child');
  };

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;

  return (
    <OnboardingFrame
      step={1}
      maru="안녕하세요! 저는 구름 마루예요. 먼저 부모님 계정을 만들어 주세요. 아이의 기록이 안전하게 저장돼요."
      footer={
        <View style={{ gap: 10 }}>
          {app.cloudAvailable && (
            <BigButton
              label={busy ? '잠시만요…' : tab === 'signup' ? '가입하고 계속' : '로그인'}
              icon="🔐"
              disabled={!valid || busy}
              onPress={submit}
            />
          )}
          <BigButton label="로그인 없이 체험해 볼게요" icon="🎈" color={colors.paper} textColor={colors.ink} onPress={demo} />
        </View>
      }
    >
      {app.cloudAvailable ? (
        <Card style={{ gap: 14 }}>
          <View style={styles.tabs}>
            {(['signup', 'login'] as const).map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
                <Text style={[styles.tabText, tab === t && { color: colors.paper }]}>{t === 'signup' ? '처음이에요' : '계정이 있어요'}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholderTextColor={colors.inkMuted}
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 (6자 이상)"
            secureTextEntry
            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
            placeholderTextColor={colors.inkMuted}
            style={styles.input}
          />
          {busy && <ActivityIndicator color={colors.primary} />}
          {msg && <Text style={styles.msg}>{msg}</Text>}
        </Card>
      ) : (
        <Card style={{ gap: 8 }}>
          <H2>☁️ 서버 연결 전이에요</H2>
          <Body muted>
            아직 Supabase 설정(.env)이 없어서 계정 기능이 꺼져 있어요. 체험 모드로 시작하면 이 기기 안에만 저장되고, 나중에 서버를 연결할 수 있어요.
          </Body>
        </Card>
      )}
      <Card style={styles.privacy}>
        <Text style={styles.privacyTitle}>🔒 약속할게요</Text>
        <Body muted style={{ fontSize: 14, lineHeight: 21 }}>
          • 아이의 기록은 부모님 계정에서만 볼 수 있어요{'\n'}• 선생님이나 어린이집에 공유되지 않아요{'\n'}• 언제든 설정에서 모두 지울 수 있어요
        </Body>
      </Card>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#EEF1F6', borderRadius: radius.pill, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
  tabOn: { backgroundColor: colors.sky },
  tabText: { fontFamily: fonts.title, fontSize: 16, color: colors.inkSoft },
  input: {
    backgroundColor: '#F5F7FB',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  msg: { fontFamily: fonts.body, color: colors.signal.talk, fontSize: 14 },
  privacy: { backgroundColor: 'rgba(255,255,255,0.8)', gap: 6 },
  privacyTitle: { fontFamily: fonts.title, fontSize: 17, color: colors.ink },
});
