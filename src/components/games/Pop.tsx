import { useEffect, type ReactNode } from 'react';
import { Animated } from 'react-native';

import { usePulse } from '@/lib/motion';

/** 고른 순간 '뿅' 커졌다 돌아오는 효과 */
export function Pop({ active, children }: { active: boolean; children: ReactNode }) {
  const { value, pulse } = usePulse();
  useEffect(() => {
    if (active) pulse();
    // active 가 켜질 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return <Animated.View style={{ transform: [{ scale: value }] }}>{children}</Animated.View>;
}
