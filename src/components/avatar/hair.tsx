/** 일상툰 아바타 파츠: 머리카락 (뒷머리 / 앞머리) */
import { Circle, Ellipse, G, Path } from 'react-native-svg';

import type { HairStyle } from '@/types';
import { OL, shade } from './shared';

/* ─────────── 머리카락 ─────────── */

const hairStroke = { stroke: OL, strokeWidth: 2, strokeLinejoin: 'round' as const };

// 앞머리 모양들
const BANGS = 'M23 52 C22 27 40 14 60 14 C80 14 98 27 97 52 C96 49 95 47 94 46 C80 42 70 44 60 43 C48 44 36 42 26 46 C25 48 24 50 23 52 Z';
const SIDE_PART = 'M23 56 C21 27 41 13 58 14 L62 20 C68 13 99 23 97 56 C93 42 82 31 65 28 C55 36 39 45 23 56 Z';
const CENTER_PART = 'M23 58 C21 27 40 13 60 13 C80 13 99 27 97 58 C94 44 84 32 62 28 L60 24 L58 28 C36 32 26 44 23 58 Z';
const SLEEK = 'M24 52 C24 27 42 15 60 15 C78 15 96 27 96 52 C88 37 75 29 60 29 C45 29 32 37 24 52 Z';
const DANDY = 'M23 54 C21 27 40 14 60 14 C82 14 99 27 97 54 C93 45 85 39 74 36 C66 43 48 45 34 42 C30 46 26 50 23 54 Z';
const BOB_BACK = 'M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L101 88 C95 94 25 94 19 88 Z';
const LONG_BACK = 'M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L104 120 C92 126 28 126 16 120 Z';

function braidChain(points: [number, number][], color: string) {
  return (
    <G fill={color} {...hairStroke}>
      {points.map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={6.5} ry={6} />
      ))}
    </G>
  );
}

export function HairBack({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'bobBangs':
    case 'bobPart':
      return <Path d={BOB_BACK} fill={color} {...hairStroke} />;
    case 'blunt':
      return <Path d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L100 84 L20 84 Z" fill={color} {...hairStroke} />;
    case 'hush':
      return (
        <Path
          d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L102 82 L108 94 L97 89 L95 97 L86 88 L34 88 L25 97 L23 89 L12 94 L18 82 Z"
          fill={color}
          {...hairStroke}
        />
      );
    case 'pixie':
      return <Path d="M22 58 C20 28 40 14 60 14 C80 14 100 28 98 58 L97 74 C93 79 88 75 88 68 L32 68 C32 75 27 79 23 74 Z" fill={color} {...hairStroke} />;
    case 'longBangs':
    case 'longPart':
      return <Path d={LONG_BACK} fill={color} {...hairStroke} />;
    case 'wave':
      return (
        <Path
          d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 C106 70 96 80 104 92 C110 104 98 118 88 114 L32 114 C22 118 10 104 16 92 C24 80 14 70 20 56 Z"
          fill={color}
          {...hairStroke}
        />
      );
    case 'hippie':
      return (
        <Path
          d="M18 56 C14 26 40 12 60 12 C80 12 106 26 102 56 Q111 64 103 72 Q111 80 103 88 Q111 96 103 104 Q109 115 96 117 L24 117 Q11 115 17 104 Q9 96 17 88 Q9 80 17 72 Q9 64 18 56 Z"
          fill={color}
          {...hairStroke}
        />
      );
    case 'halfUp':
      return (
        <G>
          <Path d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L102 104 C92 110 28 110 18 104 Z" fill={color} {...hairStroke} />
          <Circle cx={60} cy={13} r={8} fill={color} {...hairStroke} />
        </G>
      );
    case 'ponytail':
      return <Path d="M82 28 C106 30 112 64 104 96 C100 104 90 102 91 93 C97 70 94 46 78 38 Z" fill={color} {...hairStroke} />;
    case 'lowPony':
      return (
        <G>
          <Path d="M80 78 C98 82 102 104 96 124 C92 130 85 126 87 119 C91 104 87 92 74 88 Z" fill={color} {...hairStroke} />
          <Circle cx={80} cy={82} r={3.6} fill="#F4A6A0" stroke={OL} strokeWidth={1.2} />
        </G>
      );
    case 'bun':
      return <Circle cx={60} cy={13} r={12} fill={color} {...hairStroke} />;
    case 'doubleBun':
      return (
        <G fill={color} {...hairStroke}>
          <Circle cx={33} cy={21} r={11} />
          <Circle cx={87} cy={21} r={11} />
        </G>
      );
    case 'pigtails':
      return (
        <G fill={color} {...hairStroke}>
          <Path d="M24 62 C10 64 8 92 16 104 C20 108 26 104 24 98 C20 88 24 74 30 68 Z" />
          <Path d="M96 62 C110 64 112 92 104 104 C100 108 94 104 96 98 C100 88 96 74 90 68 Z" />
        </G>
      );
    case 'braids':
      return (
        <G>
          {braidChain(
            [
              [21, 70],
              [20, 81],
              [20, 92],
              [21, 103],
            ],
            color,
          )}
          {braidChain(
            [
              [99, 70],
              [100, 81],
              [100, 92],
              [99, 103],
            ],
            color,
          )}
          <Circle cx={21} cy={111} r={3.2} fill="#FFD58A" stroke={OL} strokeWidth={1} />
          <Circle cx={99} cy={111} r={3.2} fill="#FFD58A" stroke={OL} strokeWidth={1} />
        </G>
      );
    case 'sideBraid':
      return (
        <G>
          <Path d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L98 76 L22 76 Z" fill={color} {...hairStroke} />
          {braidChain(
            [
              [95, 76],
              [94, 87],
              [92, 98],
              [90, 109],
            ],
            color,
          )}
          <Circle cx={89} cy={117} r={3.2} fill="#A8CFF2" stroke={OL} strokeWidth={1} />
        </G>
      );
    case 'shortPerm':
      return (
        <G fill={color} {...hairStroke}>
          {[
            [26, 44],
            [30, 30],
            [42, 20],
            [56, 16],
            [70, 17],
            [83, 22],
            [92, 33],
            [95, 47],
          ].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={10} />
          ))}
        </G>
      );
    case 'twoblock':
    case 'gail':
    case 'comma':
      // 옆·뒤는 짧게 친 느낌: 머리 윤곽을 따라 얇은 층
      return <Path d="M23 60 C20 30 40 16 60 16 C80 16 100 30 97 60 C94 44 84 34 60 32 C36 34 26 44 23 60 Z" fill={shade(color, -0.2)} opacity={0.9} {...hairStroke} />;
    default:
      return null;
  }
}

export function HairFront({ style, color }: { style: HairStyle; color: string }) {
  let d: string;
  let extra: React.ReactNode = null;
  switch (style) {
    case 'dandy':
      d = DANDY;
      break;
    case 'comma':
      d = DANDY;
      extra = <Path d="M70 36 Q80 42 74 50 Q71 45 66 46" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />;
      break;
    case 'twoblock':
      d = 'M28 46 C26 24 44 12 63 12 C83 12 97 24 95 46 C88 38 78 32 66 33 C54 39 41 39 31 37 C30 40 29 43 28 46 Z';
      break;
    case 'gail':
      d = 'M23 54 C21 26 40 13 60 13 C80 13 99 26 97 54 C94 44 86 38 76 36 Q66 34 62 44 Q60 36 58 44 Q54 34 44 36 C34 38 26 44 23 54 Z';
      break;
    case 'slick':
      d = 'M26 44 C26 20 42 11 60 11 C78 11 94 20 94 44 C88 32 76 26 60 26 C44 26 32 32 26 44 Z';
      extra = (
        <G stroke={shade(color, 0.25)} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7}>
          <Path d="M40 24 Q50 16 62 16" />
          <Path d="M50 25 Q60 19 72 19" />
        </G>
      );
      break;
    case 'buzz':
      return <Path d="M27 50 C28 22 92 22 93 50 C82 37 38 37 27 50 Z" fill={color} opacity={0.85} {...hairStroke} />;
    case 'shortPerm':
      return (
        <G fill={color} {...hairStroke}>
          {[
            [32, 38],
            [44, 32],
            [57, 30],
            [70, 31],
            [82, 36],
          ].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={8} />
          ))}
        </G>
      );
    case 'pixie':
      d = 'M23 54 C21 26 42 13 62 14 C84 15 99 28 97 50 C90 40 78 36 66 38 C54 42 40 50 23 54 Z';
      break;
    case 'hush':
      d = 'M23 54 C21 26 40 13 60 13 C80 13 99 26 97 54 C92 46 84 40 72 40 Q64 40 61 34 Q56 40 48 40 C36 40 28 46 23 54 Z';
      break;
    case 'bobBangs':
    case 'blunt':
    case 'longBangs':
    case 'pigtails':
    case 'doubleBun':
      d = BANGS;
      break;
    case 'bobPart':
    case 'longPart':
    case 'wave':
    case 'halfUp':
    case 'sideBraid':
      d = SIDE_PART;
      break;
    case 'hippie':
    case 'braids':
      d = CENTER_PART;
      break;
    case 'ponytail':
    case 'lowPony':
    case 'bun':
      d = SLEEK;
      break;
    default:
      return null;
  }
  return (
    <G>
      <Path d={d} fill={color} {...hairStroke} />
      {extra}
      {/* 웹툰식 머리 윤기 */}
      <Path d="M40 24 Q50 19 60 20" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.35} />
    </G>
  );
}
