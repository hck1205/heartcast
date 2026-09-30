import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { SkyBackground, SkyProgress } from './ui';

export const ONBOARDING_STEPS = 7;

export function OnboardingFrame({
  step,
  maru,
  sub,
  children,
  footer,
  back = true,
}: {
  step: number;
  /** 화면 제목 (짧게) */
  maru: string;
  /** 제목 아래 한 줄 설명 */
  sub?: string;
  /** @deprecated 마스코트 표정 (더는 쓰지 않음) */
  mood?: 'happy' | 'wink' | 'wow';
  children: ReactNode;
  footer: ReactNode;
  back?: boolean;
}) {
  return (
    <SkyBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          {back && router.canGoBack() ? (
            <Pressable accessibilityLabel="뒤로" onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <View style={{ flex: 1 }}>
            <SkyProgress step={step} total={ONBOARDING_STEPS} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 6 }}>
            <Text style={styles.title}>{maru}</Text>
            {sub ? <Text style={styles.sub}>{sub}</Text> : null}
          </View>
          {children}
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 6 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 32, color: colors.ink, marginTop: -4 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  title: { fontFamily: fonts.title, fontSize: 26, lineHeight: 34, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
});
