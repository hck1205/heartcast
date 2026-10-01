import { useEffect, useRef } from 'react';

/**
 * 잠시 뒤에 한 번 실행하기. 새로 예약하면 이전 예약은 취소되고, 화면을 떠나면 자동으로 정리된다.
 * `later` 는 이벤트 핸들러에서만 부른다.
 */
export function useLater() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (fn: () => void, ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };
}
