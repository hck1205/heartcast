import { useState } from 'react';
import { Animated } from 'react-native';

/** 아이 화면의 작은 움직임 모음: 흔들기 · 스프링 등장 · 뿅 · 통통 · 점프 */

const timing = (v: Animated.Value, toValue: number, duration: number) => Animated.timing(v, { toValue, duration, useNativeDriver: true });
const spring = (v: Animated.Value, toValue: number, friction: number, tension: number) => Animated.spring(v, { toValue, friction, tension, useNativeDriver: true });

/** 좌우로 흔들기 (값 -1~1). steps 마다 ms(하나 또는 단계별)씩, 끝나면 done */
export function useShake() {
  const [value] = useState(() => new Animated.Value(0));
  const shake = (steps: number[] = [1, -1, 1, -1, 0], ms: number | number[] = 110, done?: () => void) => {
    value.setValue(0);
    Animated.sequence(steps.map((s, i) => timing(value, s, Array.isArray(ms) ? ms[i] : ms))).start(done && (() => done()));
  };
  const rotate = (deg: number) => value.interpolate({ inputRange: [-1, 1], outputRange: [`-${deg}deg`, `${deg}deg`] });
  return { value, shake, rotate };
}

/** 0 → 1 스프링으로 나타나기 (scale 등에 쓴다) */
export function useSpringIn(friction = 4, tension = 120) {
  const [value] = useState(() => new Animated.Value(0));
  const play = () => {
    value.setValue(0);
    spring(value, 1, friction, tension).start();
  };
  return { value, play };
}

/** 고른 순간 '뿅' 커졌다 돌아오기 (scale) */
export function usePulse(peak = 1.18) {
  const [value] = useState(() => new Animated.Value(1));
  const pulse = () => {
    value.setValue(1);
    Animated.sequence([timing(value, peak, 110), spring(value, 1, 3, 160)]).start();
  };
  return { value, pulse };
}

/** 살짝 눌렸다 통 돌아오기 (scale) — 공방 미리보기 */
export function useBounce(from = 0.94) {
  const [value] = useState(() => new Animated.Value(1));
  const bounce = () => {
    value.setValue(from);
    spring(value, 1, 4, 160).start();
  };
  return { value, bounce };
}

/** 통 튀어 올랐다 내려오기 (translateY) */
export function useJump(height = 22) {
  const [value] = useState(() => new Animated.Value(0));
  const jump = () => {
    value.setValue(0);
    Animated.sequence([timing(value, -height, 160), spring(value, 0, 3, 140)]).start();
  };
  return { value, jump };
}
