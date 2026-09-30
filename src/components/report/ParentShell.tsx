import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '@/theme';

/** 부모 화면 공통 틀: 차분한 크림색 바탕 + 상단 바 */
export function ParentShell({ title, children, right, back = true }: { title: string; children: ReactNode; right?: ReactNode; back?: boolean }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.bar}>
        {back ? (
          <Pressable accessibilityLabel="뒤로" onPress={() => (router.canGoBack() ? router.back() : router.replace('/parent'))} style={styles.icon}>
            <Text style={styles.iconText}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.icon} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.icon, { width: undefined, minWidth: 40 }]}>{right}</View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 34, color: colors.ink, marginTop: -4 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.body, fontWeight: '700', fontSize: 17, color: colors.ink },
  content: { padding: 16, gap: 24, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontFamily: fonts.body, fontSize: 17, fontWeight: '700', color: colors.ink },
  sectionSub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  panel: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.line },
});
