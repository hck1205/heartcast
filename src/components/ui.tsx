import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tap } from '@/lib/feedback';
import { colors, fonts, radius, selectedLook } from '@/theme';

/**
 * 화면 바탕: 단색 한 가지 (기본은 따뜻한 흰색, top 을 주면 그 색).
 * (예전의 흘러가는 구름·언덕 장식은 없앴다)
 */
export function SkyBackground({
  children,
  top,
  bottom,
  style,
}: {
  children: ReactNode;
  top?: string;
  bottom?: string;
  /** @deprecated 장식을 없애 더는 쓰지 않는다 */
  hills?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flex: 1, backgroundColor: top ?? bottom ?? colors.bg }, style]}>
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </View>
  );
}

export const Screen = SkyBackground;

type Variant = 'primary' | 'secondary' | 'ghost';

/** 평평한 버튼. 한 화면에 primary 는 하나만 쓰는 것을 원칙으로 한다. */
export function BigButton({
  label,
  onPress,
  variant,
  color,
  textColor,
  icon,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** 직접 색을 줄 때 (없으면 variant 색) */
  color?: string;
  textColor?: string;
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  // 예전 호출(color=흰색)은 secondary 로 본다
  const v: Variant = variant ?? (color === colors.paper || color === '#EEF1F6' ? 'secondary' : 'primary');
  const bg = v === 'primary' ? (color ?? colors.primary) : v === 'secondary' ? colors.paper : 'transparent';
  const fg = textColor && v === 'primary' ? textColor : v === 'primary' ? '#FFFFFF' : v === 'secondary' ? colors.ink : colors.inkSoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        v === 'secondary' && styles.btnSecondary,
        style,
      ]}
    >
      {icon ? <Text style={[styles.btnIcon, small && { fontSize: 17 }]}>{icon}</Text> : null}
      <Text style={[styles.btnText, small && { fontSize: 16 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Body({ children, style, muted }: { children: ReactNode; style?: StyleProp<TextStyle>; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.inkSoft }, style]}>{children}</Text>;
}

/** 얇은 진행 막대 */
export function SkyProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.min(1, step / total);
  return (
    <View style={styles.progressTrack} accessibilityLabel={`${total}단계 중 ${step}단계`}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}
export const ProgressBar = SkyProgress;

/** 점 진행 표시 ●●○○ */
export function Dots({ index, total }: { index: number; total: number }) {
  return (
    <View style={styles.dots} accessibilityLabel={`${total}단계 중 ${index + 1}단계`}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < index && styles.dotDone, i === index && styles.dotNow]} />
      ))}
    </View>
  );
}

/** 색종이 축하 효과 (완성·보상 화면에서만) */
export function Confetti({ count = 24 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const [pieces] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * width,
      delay: Math.random() * 500,
      rot: Math.random() * 360,
      color: [colors.primary, colors.mint, colors.lemon, colors.lilac, colors.pink, colors.sky][i % 6],
      // 종이 조각 사이사이에 별·하트
      shape: i % 4 === 1 ? '★' : i % 4 === 3 ? '♥' : null,
      v: new Animated.Value(0),
    })),
  );
  useEffect(() => {
    Animated.parallel(
      pieces.map((p) =>
        Animated.timing(p.v, { toValue: 1, duration: 2000, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ),
    ).start();
  }, [pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const motion = {
          position: 'absolute' as const,
          left: p.x,
          top: -20,
          opacity: p.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.7] }) },
            { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: [`${p.rot}deg`, `${p.rot + 540}deg`] }) },
          ],
        };
        return p.shape ? (
          <Animated.Text key={i} style={[motion, { color: p.color, fontSize: 18 }]}>
            {p.shape}
          </Animated.Text>
        ) : (
          <Animated.View key={i} style={[motion, { width: 8, height: 14, borderRadius: 3, backgroundColor: p.color }]} />
        );
      })}
    </View>
  );
}

/** 선택 칩 */
export function Chip({
  selected,
  onPress,
  children,
  style,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.chip, selected && styles.chipOn, style]}
    >
      {children}
    </Pressable>
  );
}

/** 작은 탭(세그먼트). 탭이 5개를 넘으면 가로로 스크롤되는 칩 탭이 된다. */
export function Tabs<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const scroll = items.length > 4;
  const tabs = items.map((t) => (
    <Pressable
      key={t.id}
      accessibilityRole="tab"
      accessibilityState={{ selected: value === t.id }}
      onPress={() => {
        tap();
        onChange(t.id);
      }}
      style={[scroll ? styles.chipTab : styles.tab, value === t.id && (scroll ? styles.chipTabOn : styles.tabOn)]}
    >
      <Text style={[styles.tabText, value === t.id && (scroll ? styles.chipTabTextOn : styles.tabTextOn)]}>{t.label}</Text>
    </Pressable>
  ));
  if (!scroll) return <View style={styles.tabs}>{tabs}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipTabs} style={{ flexGrow: 0 }}>
      {tabs}
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  btn: {
    minHeight: 56,
    borderRadius: radius.md,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSmall: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14 },
  btnSecondary: { borderWidth: 1, borderColor: colors.line },
  btnIcon: { fontSize: 20 },
  btnText: { fontFamily: fonts.title, fontSize: 19 },
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.line, marginHorizontal: 12, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotDone: { backgroundColor: '#FFC3B2' },
  dotNow: { width: 20, backgroundColor: colors.primary },
  chip: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  chipOn: selectedLook,
  tabs: { flexDirection: 'row', backgroundColor: '#F1ECE4', borderRadius: 12, padding: 3, gap: 3 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabOn: { backgroundColor: colors.paper },
  tabText: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, fontWeight: '600' },
  tabTextOn: { color: colors.ink },
  chipTabs: { gap: 6, paddingRight: 8 },
  chipTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#F1ECE4' },
  chipTabOn: { backgroundColor: colors.ink },
  chipTabTextOn: { color: '#FFFFFF' },
});
