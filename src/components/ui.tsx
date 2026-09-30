import { type ReactNode, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { tap } from '@/lib/feedback';
import { colors, fonts, radius, shadow } from '@/theme';
import { Cloud } from './WeatherIcon';

/** 하늘 그라디언트 + 흘러가는 구름 + 언덕 배경 */
export function SkyBackground({
  children,
  top = colors.skyTop,
  bottom = colors.skyBottom,
  hills = true,
  style,
}: {
  children: ReactNode;
  top?: string;
  bottom?: string;
  hills?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={[{ flex: 1, backgroundColor: bottom }, style]}>
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#sky)" />
        {hills && (
          <>
            <Path
              d={`M0 ${height - 90} Q${width * 0.3} ${height - 150} ${width * 0.6} ${height - 95} T${width} ${height - 110} L${width} ${height} L0 ${height} Z`}
              fill="#BDEBC4"
            />
            <Path
              d={`M0 ${height - 55} Q${width * 0.4} ${height - 100} ${width * 0.75} ${height - 60} T${width} ${height - 70} L${width} ${height} L0 ${height} Z`}
              fill="#9EDFAA"
            />
          </>
        )}
      </Svg>
      <DriftingCloud y={70} delay={0} scale={0.9} />
      <DriftingCloud y={170} delay={6000} scale={0.6} />
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </View>
  );
}

function DriftingCloud({ y, delay, scale }: { y: number; delay: number; scale: number }) {
  const { width } = useWindowDimensions();
  const x = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 26000, delay, easing: Easing.linear, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [x, delay]);
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-120, width + 20] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: y, opacity: 0.85, transform: [{ translateX }, { scale }] }}>
      <Svg width={100} height={80} viewBox="0 20 100 60">
        <Cloud stroke="rgba(255,255,255,0)" />
      </Svg>
    </Animated.View>
  );
}

/** 통통 튀는 큰 버튼 */
export function BigButton({
  label,
  onPress,
  color = colors.primary,
  textColor = '#fff',
  icon,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  icon?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const s = useState(() => new Animated.Value(1))[0];
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 12 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: s }], opacity: disabled ? 0.45 : 1 }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        onPressIn={() => to(0.94)}
        onPressOut={() => to(1)}
        onPress={() => {
          tap();
          onPress();
        }}
        style={[
          styles.btn,
          small && styles.btnSmall,
          { backgroundColor: color, borderBottomColor: 'rgba(0,0,0,0.15)' },
        ]}
      >
        {icon ? <Text style={[styles.btnIcon, small && { fontSize: 20 }]}>{icon}</Text> : null}
        <Text style={[styles.btnText, small && { fontSize: 17 }, { color: textColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}
export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}
export function Body({ children, style, muted }: { children: ReactNode; style?: StyleProp<TextStyle>; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.inkSoft }, style]}>{children}</Text>;
}

/** 온보딩 진행: 해님이 하늘을 건너간다 */
export function SkyProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.min(1, step / total);
  return (
    <View style={styles.progressTrack} accessibilityLabel={`${total}단계 중 ${step}단계`}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      <Text style={[styles.progressSun, { left: `${pct * 100}%` }]}>☀️</Text>
    </View>
  );
}

/** 색종이 축하 효과 */
export function Confetti({ count = 28 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const [pieces] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      x: Math.random() * width,
      delay: Math.random() * 600,
      rot: Math.random() * 360,
      color: [colors.primary, colors.mint, colors.lemon, colors.lilac, colors.pink, colors.sky][i % 6],
      v: new Animated.Value(0),
    })),
  );
  useEffect(() => {
    Animated.parallel(
      pieces.map((p) =>
        Animated.timing(p.v, { toValue: 1, duration: 2200, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ),
    ).start();
  }, [pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: 10,
            height: 16,
            borderRadius: 3,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.8] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: [`${p.rot}deg`, `${p.rot + 540}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** 선택 칩 (색·스타일 고르기) */
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

export const styles = StyleSheet.create({
  btn: {
    minHeight: 64,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderBottomWidth: 5,
    ...shadow,
  },
  btnSmall: { minHeight: 48, paddingHorizontal: 18, borderBottomWidth: 3 },
  btnIcon: { fontSize: 26 },
  btnText: { fontFamily: fonts.title, fontSize: 22 },
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: 18, ...shadow },
  h1: { fontFamily: fonts.title, fontSize: 30, color: colors.ink, lineHeight: 40 },
  h2: { fontFamily: fonts.title, fontSize: 21, color: colors.ink, lineHeight: 29 },
  body: { fontFamily: fonts.body, fontSize: 16, color: colors.ink, lineHeight: 24 },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 6,
    overflow: 'visible',
  },
  progressFill: { height: 14, borderRadius: 7, backgroundColor: colors.lemon },
  progressSun: { position: 'absolute', top: -12, marginLeft: -16, fontSize: 28 },
  chip: {
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: '#FFF1EA' },
});
