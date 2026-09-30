import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { colors, fonts, shadow } from '@/theme';

type Mood = 'happy' | 'wink' | 'wow';

/** 앱의 안내 캐릭터: 구름 "마루" */
export function Maru({ size = 120, mood = 'happy' }: { size?: number; mood?: Mood }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 120 96">
      <Ellipse cx={60} cy={90} rx={36} ry={5} fill="#2E3A59" opacity={0.08} />
      <Path
        d="M26 82 C8 82 4 58 22 54 C20 30 46 20 58 36 C66 18 98 22 96 46 C114 46 118 80 96 82 Z"
        fill="#FFFFFF"
        stroke="#BFD9F2"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <G fill="#FF9EB5" opacity={0.6}>
        <Ellipse cx={40} cy={66} rx={7} ry={4} />
        <Ellipse cx={84} cy={66} rx={7} ry={4} />
      </G>
      {mood === 'wink' ? (
        <Path d="M42 56 Q48 51 54 56" stroke="#2E3A59" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      ) : (
        <Circle cx={48} cy={56} r={mood === 'wow' ? 5 : 4} fill="#2E3A59" />
      )}
      <Circle cx={76} cy={56} r={mood === 'wow' ? 5 : 4} fill="#2E3A59" />
      {mood === 'wow' ? (
        <Ellipse cx={62} cy={70} rx={5} ry={6} fill="#E4575F" />
      ) : (
        <Path d="M54 66 Q62 76 70 66" stroke="#2E3A59" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      )}
    </Svg>
  );
}

/** 둥실둥실 떠다니는 래퍼 */
export function Floating({ children, distance = 8, duration = 1800 }: { children: React.ReactNode; distance?: number; duration?: number }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });
  return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
}

/** 마루가 말풍선으로 안내 */
export function MaruSays({ text, mood = 'happy', size = 96 }: { text: string; mood?: Mood; size?: number }) {
  return (
    <View style={styles.row}>
      <Floating>
        <Maru size={size} mood={mood} />
      </Floating>
      <View style={styles.bubble}>
        <View style={styles.tail} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bubble: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadow,
  },
  tail: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    backgroundColor: colors.paper,
    transform: [{ rotate: '45deg' }],
  },
  text: { fontFamily: fonts.body, fontSize: 19, lineHeight: 27, color: colors.ink },
});
