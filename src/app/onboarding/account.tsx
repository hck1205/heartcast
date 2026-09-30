import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { OnboardingFrame } from '@/components/OnboardingFrame';
import { BigButton, Body, Card, Tabs } from '@/components/ui';
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
      maru="부모님 계정"
      sub="아이의 기록은 부모님만 볼 수 있어요. 어린이집에 공유되지 않아요."
      footer={
        <View style={{ gap: 10 }}>
          {app.cloudAvailable && (
            <BigButton
              label={busy ? '잠시만요…' : tab === 'signup' ? '가입하고 계속' : '로그인'}
              disabled={!valid || busy}
              onPress={submit}
            />
          )}
          <BigButton label="로그인 없이 체험하기" variant={app.cloudAvailable ? 'ghost' : 'primary'} onPress={demo} />
        </View>
      }
    >
      {app.cloudAvailable ? (
        <Card style={{ gap: 14 }}>
          <Tabs
            items={[
              { id: 'signup', label: '처음이에요' },
              { id: 'login', label: '계정이 있어요' },
            ]}
            value={tab}
            onChange={setTab}
          />
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
        <Card>
          <Body muted>서버(.env)가 아직 연결되지 않아 체험 모드로 시작해요. 기록은 이 기기에만 저장돼요.</Body>
        </Card>
      )}
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  msg: { fontFamily: fonts.body, color: colors.signal.talk, fontSize: 14 },
});
