import { useRef } from 'react';
import type { GestureResponderEvent, View } from 'react-native';

/**
 * 판(View) 위의 터치 좌표: 화면 좌표(pageX/Y)에서 판 위치를 빼서 구한다 (웹·안드로이드 모두 같은 방식).
 * `ref`·`measure` 를 판에 달고, 이벤트 핸들러에서만 `point`/`ratio` 를 부른다.
 */
export function usePagePoint() {
  const ref = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const measure = () => ref.current?.measureInWindow((x, y, w, h) => (origin.current = { x, y, w, h }));
  /** 판 왼쪽 위 기준 픽셀 좌표 */
  const point = (e: GestureResponderEvent) => ({ x: e.nativeEvent.pageX - origin.current.x, y: e.nativeEvent.pageY - origin.current.y });
  /** 판 크기 기준 0~1 비율 좌표 */
  const ratio = (e: GestureResponderEvent) => {
    const p = point(e);
    return { x: p.x / origin.current.w, y: p.y / origin.current.h };
  };
  return { ref, measure, point, ratio };
}
