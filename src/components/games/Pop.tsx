import { useEffect, useState, type ReactNode } from 'react';
import { Animated } from 'react-native';

/** 고른 순간 '뿅' 커졌다 돌아오는 효과 */
export function Pop({ active, children }: { active: boolean; children: ReactNode }) {
  const [v] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!active) return;
    v.setValue(1);
    Animated.sequence([
      Animated.timing(v, { toValue: 1.18, duration: 110, useNativeDriver: true }),
      Animated.spring(v, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }),
    ]).start();
  }, [active, v]);
  return <Animated.View style={{ transform: [{ scale: v }] }}>{children}</Animated.View>;
}
