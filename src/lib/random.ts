/** 무작위 도우미: 하나 고르기 · 섞기 · 시드 난수 (테스트·데모에서 결정적으로 돌리기 위함) */

export const pick = <T,>(xs: readonly T[], rand: () => number = Math.random): T => xs[Math.floor(rand() * xs.length)];

/** 섞은 복사본 (원본은 그대로) */
export function shuffle<T>(xs: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 작은 시드 난수 */
export function seededRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
