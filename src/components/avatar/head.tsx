/** 일상툰 아바타 파츠: 얼굴형 · 귀 · 주름 */
import { Ellipse, G, Path } from 'react-native-svg';

import type { FaceShape } from '@/types';
import { EY, L, OL, R, shade, SW } from './shared';

/* ─────────── 얼굴형 ─────────── */

const FACE: Record<FaceShape, { d: string; halfW: number }> = {
  round: { d: 'M24 56 C24 32 40 20 60 20 C80 20 96 32 96 56 C96 79 80 95 60 95 C40 95 24 79 24 56 Z', halfW: 36 },
  oval: { d: 'M26 54 C26 31 42 20 60 20 C78 20 94 31 94 54 C94 76 77 96 60 97 C43 96 26 76 26 54 Z', halfW: 34 },
  square: { d: 'M25 52 C25 30 40 20 60 20 C80 20 95 30 95 52 L94 72 C92 86 77 95 60 95 C43 95 28 86 26 72 Z', halfW: 35 },
  heart: { d: 'M24 52 C24 30 40 20 60 20 C80 20 96 30 96 52 C96 71 79 91 60 98 C41 91 24 71 24 52 Z', halfW: 36 },
  long: { d: 'M28 52 C28 28 42 18 60 18 C78 18 92 28 92 52 C92 76 76 98 60 99 C44 98 28 76 28 52 Z', halfW: 32 },
  chubby: { d: 'M22 54 C22 30 40 20 60 20 C80 20 98 30 98 54 C99 80 82 96 60 96 C38 96 21 80 22 54 Z', halfW: 38 },
  diamond: { d: 'M29 48 C31 29 45 20 60 20 C75 20 89 29 91 48 L96 60 C94 80 76 96 60 98 C44 96 26 80 24 60 Z', halfW: 36 },
  pear: { d: 'M29 52 C29 30 43 21 60 21 C77 21 91 30 91 52 C97 70 91 90 60 95 C29 90 23 70 29 52 Z', halfW: 34 },
  baby: { d: 'M22 58 C22 30 40 20 60 20 C80 20 98 30 98 58 C98 78 82 92 60 92 C38 92 22 78 22 58 Z', halfW: 38 },
};

export function headGeometry(shape: FaceShape) {
  return { halfW: FACE[shape].halfW };
}

export function Head({ shape, skin }: { shape: FaceShape; skin: string }) {
  return <Path d={FACE[shape].d} fill={skin} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />;
}

export function Ears({ halfW, skin }: { halfW: number; skin: string }) {
  return (
    <G fill={skin} stroke={OL} strokeWidth={SW}>
      <Ellipse cx={60 - halfW} cy={61} rx={6} ry={7.5} />
      <Ellipse cx={60 + halfW} cy={61} rx={6} ry={7.5} />
    </G>
  );
}

/** 할머니·할아버지: 눈가 주름과 팔자 주름 (피부보다 조금 진한 선) */
export function Wrinkles({ skin }: { skin: string }) {
  const line = shade(skin, 0.3);
  return (
    <G stroke={line} strokeWidth={1.3} strokeLinecap="round" fill="none">
      <Path d={`M${L - 12} ${EY - 3} L${L - 15.5} ${EY - 5}`} />
      <Path d={`M${L - 12} ${EY + 1} L${L - 15.5} ${EY + 2}`} />
      <Path d={`M${R + 12} ${EY - 3} L${R + 15.5} ${EY - 5}`} />
      <Path d={`M${R + 12} ${EY + 1} L${R + 15.5} ${EY + 2}`} />
      <Path d="M50 70 Q47 75 50.5 80" />
      <Path d="M70 70 Q73 75 69.5 80" />
    </G>
  );
}
