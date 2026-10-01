/** 아바타 파츠 공용: 외곽선 색·두께, 눈 위치, 색 밝기 조절. 좌표계는 viewBox 0 0 120 140 */
export const OL = '#3B2F2F'; // 외곽선
export const SW = 2.2; // 외곽선 두께
export const L = 47; // 왼쪽 눈 x
export const R = 73; // 오른쪽 눈 x
export const EY = 60; // 눈 y

/** hex 색을 어둡게(양수)/밝게(음수) */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const c = (n >> s) & 255;
    return Math.max(0, Math.min(255, Math.round(amount >= 0 ? c * (1 - amount) : c + (255 - c) * -amount)));
  };
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}
