import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { MaruSays } from './Mascot';
import { SkyBackground, SkyProgress } from './ui';

export const ONBOARDING_STEPS = 6;

export function OnboardingFrame({
  step,
  maru,
  mood,
  children,
  footer,
  back = true,
}: {
  step: number;
  maru: string;
  mood?: 'happy' | 'wink' | 'wow';
  children: ReactNode;
  footer: ReactNode;
  back?: boolean;
}) {
  return (
    <SkyBackground hills={false}>
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
          <MaruSays text={maru} mood={mood} size={84} />
          {children}
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 36, color: colors.ink, fontFamily: fonts.title, marginTop: -4 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  footer: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
});
