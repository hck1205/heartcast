import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import type { PetId } from '@/games/rewards';

const OL = '#3B2F2F';

/** 반려 친구 (별 상점). 아바타와 같은 웹툰 선 · 평면 채색, viewBox 0 0 60 60 */
export function Pet({ id, size = 56 }: { id: PetId | string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Ellipse cx={30} cy={56} rx={18} ry={3} fill="rgba(0,0,0,0.08)" />
      {PETS[id as PetId] ?? PETS.chick}
    </Svg>
  );
}

const eyes = (y = 30, gap = 7) => (
  <G>
    <Circle cx={30 - gap} cy={y} r={2.2} fill={OL} />
    <Circle cx={30 + gap} cy={y} r={2.2} fill={OL} />
    <Circle cx={30 - gap + 0.8} cy={y - 0.8} r={0.7} fill="#FFFFFF" />
    <Circle cx={30 + gap + 0.8} cy={y - 0.8} r={0.7} fill="#FFFFFF" />
  </G>
);
const blush = (y = 35) => (
  <G fill="#FF9EB5" opacity={0.7}>
    <Ellipse cx={18} cy={y} rx={3} ry={1.8} />
    <Ellipse cx={42} cy={y} rx={3} ry={1.8} />
  </G>
);
const s = { stroke: OL, strokeWidth: 1.8, strokeLinejoin: 'round' as const };

const PETS: Record<PetId, React.ReactNode> = {
  chick: (
    <G {...s}>
      <Path d="M30 10 L28 4 L32 6 L34 2" fill="none" />
      <Ellipse cx={30} cy={34} rx={18} ry={19} fill="#FFE066" />
      <Path d="M27 36 L33 36 L30 40 Z" fill="#FF9F43" />
      <Path d="M12 38 Q6 34 10 30" fill="#FFE066" />
      <Path d="M48 38 Q54 34 50 30" fill="#FFE066" />
      {eyes(30)}
      {blush(37)}
    </G>
  ),
  puppy: (
    <G {...s}>
      <Ellipse cx={14} cy={26} rx={6} ry={11} fill="#B07A52" transform="rotate(18 14 26)" />
      <Ellipse cx={46} cy={26} rx={6} ry={11} fill="#B07A52" transform="rotate(-18 46 26)" />
      <Ellipse cx={30} cy={33} rx={17} ry={17} fill="#E8C49A" />
      <Ellipse cx={30} cy={39} rx={8} ry={6} fill="#FFF3E2" />
      <Ellipse cx={30} cy={36} rx={3} ry={2.2} fill={OL} />
      <Path d="M27 41 Q30 44 33 41" fill="none" />
      {eyes(30)}
      {blush(37)}
    </G>
  ),
  kitty: (
    <G {...s}>
      <Path d="M14 22 L16 8 L26 18 Z" fill="#B9B9C9" />
      <Path d="M46 22 L44 8 L34 18 Z" fill="#B9B9C9" />
      <Ellipse cx={30} cy={34} rx={18} ry={16} fill="#D6D6E2" />
      <Path d="M28 37 L32 37 L30 39 Z" fill="#FF9EB5" />
      <Path d="M30 39 Q27 42 25 40 M30 39 Q33 42 35 40" fill="none" />
      <Path d="M8 34 L18 35 M8 38 L18 37 M52 34 L42 35 M52 38 L42 37" strokeWidth={1.2} />
      {eyes(31)}
    </G>
  ),
  dino: (
    <G {...s}>
      {[
        [22, 12],
        [30, 9],
        [38, 12],
      ].map(([x, y]) => (
        <Path key={x} d={`M${x - 4} ${y + 6} L${x} ${y - 3} L${x + 4} ${y + 6} Z`} fill="#FFB547" />
      ))}
      <Ellipse cx={30} cy={34} rx={18} ry={18} fill="#7BD389" />
      <Ellipse cx={30} cy={41} rx={10} ry={6} fill="#B8EFC2" />
      <Path d="M24 41 Q30 46 36 41" fill="none" />
      <Path d="M26 41 L27 43 L28 41 M32 41 L33 43 L34 41" fill="#FFFFFF" strokeWidth={1} />
      {eyes(29)}
      {blush(36)}
    </G>
  ),
  unicorn: (
    <G {...s}>
      <Path d="M30 4 L26 18 L34 18 Z" fill="#FFD23F" />
      <Path d="M14 20 Q10 34 18 44 Q12 30 22 22 Z" fill="#B79CFF" />
      <Ellipse cx={31} cy={34} rx={17} ry={17} fill="#FFFFFF" />
      <Path d="M18 22 Q24 14 34 18 Q26 20 24 26 Z" fill="#FF9EC4" />
      <Ellipse cx={33} cy={41} rx={8} ry={5} fill="#FFE3EE" />
      <Circle cx={30} cy={41} r={1} fill={OL} />
      <Circle cx={36} cy={41} r={1} fill={OL} />
      {eyes(31)}
      {blush(37)}
    </G>
  ),
};
