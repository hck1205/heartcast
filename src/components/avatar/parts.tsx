/**
 * 일상툰(웹툰) 스타일 아바타 파츠.
 * 진갈색 외곽선 + 평면 채색, 눈·코·입이 있는 얼굴, 한국에서 흔한 머리 모양과 원복 차림.
 * 좌표계: viewBox 0 0 120 140 (얼굴 중심 약 60,58 · 눈 y=60 · 입 y≈80 · 몸통 y≥104)
 */
import { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { palettes } from '@/theme';
import type {
  BrowStyle,
  CheekStyle,
  Earrings,
  EyeColor,
  EyeStyle,
  Expression,
  FaceShape,
  FacialHair,
  GlassesStyle,
  HairStyle,
  Headwear,
  MouthStyle,
  Neckwear,
  NoseStyle,
  Pattern,
  TopStyle,
} from '@/types';

export const OL = '#3B2F2F'; // 외곽선
const SW = 2.2; // 외곽선 두께
const L = 47; // 왼쪽 눈 x
const R = 73; // 오른쪽 눈 x
const EY = 60; // 눈 y

/** hex 색을 어둡게(양수)/밝게(음수) */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const c = (n >> s) & 255;
    return Math.max(0, Math.min(255, Math.round(amount >= 0 ? c * (1 - amount) : c + (255 - c) * -amount)));
  };
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

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

/* ─────────── 옷 ─────────── */

const BODY = 'M27 140 C27 116 41 104 60 104 C79 104 93 116 93 140 Z';
const APRON = 'M38 114 L82 114 L87 140 L33 140 Z';
const BIB = 'M42 116 L78 116 L80 140 L40 140 Z';
const VEST_L = 'M27 140 C27 116 41 104 52 104 L58 126 L58 140 Z';
const VEST_R = 'M93 140 C93 116 79 104 68 104 L62 126 L62 140 Z';

function mainPath(top: TopStyle) {
  if (top === 'apron') return APRON;
  if (top === 'overalls') return BIB;
  return BODY;
}

function StarAt({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  const pts = Array.from({ length: 10 })
    .map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r : r * 0.45;
      return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
    })
    .join(' L');
  return <Path d={`M${pts} Z`} fill="#FFF3A8" />;
}

function PatternLayer({ pattern, clipId }: { pattern: Pattern; clipId: string }) {
  if (pattern === 'none') return null;
  const grid: [number, number][] = [];
  for (let row = 0; row < 4; row++) for (let x = 30; x <= 92; x += 12) grid.push([x + (row % 2) * 6, 112 + row * 9]);
  return (
    <G clipPath={`url(#${clipId})`}>
      {pattern === 'stripe' && [110, 118, 126, 134].map((y) => <Rect key={y} x={10} y={y} width={100} height={3.2} fill="#FFFFFF" opacity={0.55} />)}
      {pattern === 'dots' && grid.map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill="#FFFFFF" opacity={0.75} />)}
      {pattern === 'check' && (
        <G stroke="#FFFFFF" strokeWidth={2} opacity={0.45}>
          {[108, 116, 124, 132].map((y) => (
            <Line key={`h${y}`} x1={10} y1={y} x2={110} y2={y} />
          ))}
          {[34, 42, 50, 58, 66, 74, 82, 90].map((x) => (
            <Line key={`v${x}`} x1={x} y1={100} x2={x} y2={140} />
          ))}
        </G>
      )}
      {pattern === 'flower' &&
        grid
          .filter((_, i) => i % 2 === 0)
          .map(([x, y]) => (
            <G key={`${x}-${y}`}>
              {[0, 72, 144, 216, 288].map((a) => {
                const r = (a * Math.PI) / 180;
                return <Circle key={a} cx={x + Math.cos(r) * 2.2} cy={y + Math.sin(r) * 2.2} r={1.6} fill="#FFFFFF" opacity={0.85} />;
              })}
              <Circle cx={x} cy={y} r={1.1} fill="#FFD58A" />
            </G>
          ))}
      {pattern === 'star' &&
        grid
          .filter((_, i) => i % 2 === 1)
          .map(([x, y]) => <StarAt key={`${x}-${y}`} x={x} y={y} />)}
    </G>
  );
}

export function Clothes({ top, pattern, color, skin, clipId, nameTag }: { top: TopStyle; pattern: Pattern; color: string; skin: string; clipId: string; nameTag: boolean }) {
  const dark = shade(color, 0.18);
  const whiteInside = top === 'apron' || top === 'cardigan' || top === 'vest' || top === 'overalls';
  const olStroke = { stroke: OL, strokeWidth: SW, strokeLinejoin: 'round' as const };
  return (
    <G>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={mainPath(top)} />
        </ClipPath>
      </Defs>
      {top === 'hoodie' && <Path d="M34 112 C32 96 88 96 86 112 C80 105 40 105 34 112 Z" fill={dark} {...olStroke} />}
      {/* 몸통: 앞치마·카디건·조끼·멜빵은 안에 흰 티 */}
      <Path d={BODY} fill={whiteInside ? '#FFFFFF' : color} {...olStroke} />
      {top === 'cardigan' && (
        <G>
          <Path d="M27 140 C27 116 41 104 54 104 L57 140 Z" fill={color} {...olStroke} />
          <Path d="M93 140 C93 116 79 104 66 104 L63 140 Z" fill={color} {...olStroke} />
        </G>
      )}
      {top === 'vest' && (
        <G>
          <Path d={VEST_L} fill={color} {...olStroke} />
          <Path d={VEST_R} fill={color} {...olStroke} />
        </G>
      )}
      {top === 'apron' && (
        <G>
          <Path d={APRON} fill={color} {...olStroke} />
          <Line x1={42} y1={114} x2={49} y2={104} stroke={color} strokeWidth={4} strokeLinecap="round" />
          <Line x1={78} y1={114} x2={71} y2={104} stroke={color} strokeWidth={4} strokeLinecap="round" />
          <Rect x={51} y={124} width={18} height={10} rx={3} fill="none" stroke={OL} strokeWidth={1.4} opacity={0.6} />
        </G>
      )}
      {top === 'overalls' && (
        <G>
          <Path d={BIB} fill={color} {...olStroke} />
          <Line x1={45} y1={117} x2={43} y2={105} stroke={color} strokeWidth={5} strokeLinecap="round" />
          <Line x1={75} y1={117} x2={77} y2={105} stroke={color} strokeWidth={5} strokeLinecap="round" />
          <Circle cx={46} cy={119} r={1.8} fill="#FFD58A" stroke={OL} strokeWidth={1} />
          <Circle cx={74} cy={119} r={1.8} fill="#FFD58A" stroke={OL} strokeWidth={1} />
        </G>
      )}
      <PatternLayer pattern={pattern} clipId={clipId} />
      {top === 'cardigan' && (
        <G fill="#FFFFFF" stroke={OL} strokeWidth={1}>
          <Circle cx={53} cy={120} r={1.8} />
          <Circle cx={53} cy={130} r={1.8} />
        </G>
      )}
      {top === 'vest' && (
        <G fill={dark}>
          <Circle cx={55} cy={130} r={1.6} />
          <Circle cx={55} cy={136} r={1.6} />
        </G>
      )}
      {top === 'track' && (
        <G>
          <Line x1={60} y1={106} x2={60} y2={140} stroke={dark} strokeWidth={2} />
          <Path d="M30 128 C31 116 40 108 48 106" stroke="#FFFFFF" strokeWidth={2.4} fill="none" opacity={0.9} />
          <Path d="M90 128 C89 116 80 108 72 106" stroke="#FFFFFF" strokeWidth={2.4} fill="none" opacity={0.9} />
          <Path d="M51 104 L60 112 L69 104" fill="none" stroke={dark} strokeWidth={3} />
        </G>
      )}
      {/* 목선 */}
      {top === 'sweatshirt' && <Path d="M50 104 Q60 112 70 104" stroke={dark} strokeWidth={3} fill={skin} />}
      {top === 'hoodie' && (
        <G>
          <Path d="M50 104 Q60 111 70 104" fill={skin} stroke={OL} strokeWidth={1.4} />
          <Path d="M55 107 L54 121 M65 107 L66 121" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
        </G>
      )}
      {(top === 'apron' || top === 'cardigan' || top === 'vest' || top === 'overalls') && <Path d="M51 104 Q60 111 69 104" fill={skin} stroke={OL} strokeWidth={1.4} />}
      {top === 'dress' && (
        <G>
          <Path d="M50 104 Q60 111 70 104" fill={skin} />
          <Path d="M46 104 Q52 114 60 110 Q68 114 74 104 Q66 108 60 106 Q54 108 46 104 Z" fill="#FFFFFF" stroke={OL} strokeWidth={1.3} strokeLinejoin="round" />
          <Circle cx={60} cy={120} r={1.4} fill={OL} opacity={0.5} />
        </G>
      )}
      {top === 'shirt' && (
        <G>
          <Path d="M52 104 L60 113 L68 104 Z" fill={skin} />
          <Path d="M49 103 L60 113 L52 118 Z" fill="#FFFFFF" stroke={OL} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M71 103 L60 113 L68 118 Z" fill="#FFFFFF" stroke={OL} strokeWidth={1.4} strokeLinejoin="round" />
          <Circle cx={60} cy={124} r={1.4} fill={OL} opacity={0.6} />
          <Circle cx={60} cy={132} r={1.4} fill={OL} opacity={0.6} />
        </G>
      )}
      {nameTag && (
        <G>
          <Rect x={67} y={117} width={17} height={10} rx={2.5} fill="#FFFFFF" stroke={OL} strokeWidth={1.3} />
          <Rect x={67} y={117} width={17} height={3} rx={1.5} fill="#FF7A59" />
          <Line x1={70} y1={123.5} x2={81} y2={123.5} stroke={OL} strokeWidth={1.1} opacity={0.6} />
        </G>
      )}
    </G>
  );
}

/** 목 위에 그리는 층: 목폴라 칼라와 목 장식 */
export function NeckLayer({ top, color, neckwear }: { top: TopStyle; color: string; neckwear: Neckwear }) {
  const dark = shade(color, 0.18);
  return (
    <G>
      {top === 'turtleneck' && (
        <G>
          <Rect x={50} y={92} width={20} height={16} rx={4} fill={color} stroke={OL} strokeWidth={1.8} />
          {[54, 58, 62, 66].map((x) => (
            <Line key={x} x1={x} y1={95} x2={x} y2={105} stroke={dark} strokeWidth={1} />
          ))}
        </G>
      )}
      {neckwear === 'necklace' && (
        <G>
          <Path d="M52 102 Q60 112 68 102" stroke="#C9A24A" strokeWidth={1.4} fill="none" />
          <Circle cx={60} cy={108.5} r={2} fill="#F4A6A0" stroke="#C9A24A" strokeWidth={1} />
        </G>
      )}
      {neckwear === 'scarf' && (
        <G stroke={OL} strokeWidth={1.4} strokeLinejoin="round">
          <Path d="M47 100 Q60 110 73 100 L74 107 Q60 116 46 107 Z" fill="#F4A6A0" />
          <Path d="M64 108 L70 126 L64 127 L60 111 Z" fill="#E88E86" />
        </G>
      )}
      {neckwear === 'tie' && (
        <G stroke={OL} strokeWidth={1.3} strokeLinejoin="round">
          <Path d="M57 104 L63 104 L62 109 L58 109 Z" fill="#34466B" />
          <Path d="M58 109 L62 109 L65 128 L60 133 L55 128 Z" fill="#34466B" />
          <Line x1={57} y1={116} x2={63} y2={118} stroke="#FFD58A" strokeWidth={1.2} />
        </G>
      )}
      {neckwear === 'bowtie' && (
        <G stroke={OL} strokeWidth={1.3} strokeLinejoin="round" fill="#E4676B">
          <Path d="M60 107 L51 102 L51 112 Z" />
          <Path d="M60 107 L69 102 L69 112 Z" />
          <Circle cx={60} cy={107} r={2.2} />
        </G>
      )}
      {neckwear === 'whistle' && (
        <G>
          <Path d="M52 102 L58 120 M68 102 L62 120" stroke="#FF7A59" strokeWidth={1.4} fill="none" />
          <Rect x={55} y={119} width={12} height={6} rx={3} fill="#C0C4CC" stroke={OL} strokeWidth={1.2} />
          <Circle cx={57.5} cy={122} r={1.6} fill="#8A8F99" />
        </G>
      )}
      {neckwear === 'lanyard' && (
        <G>
          <Path d="M51 102 L57 118 M69 102 L63 118" stroke="#4F8EF7" strokeWidth={1.8} fill="none" />
          <Rect x={53} y={117} width={14} height={17} rx={2} fill="#FFFFFF" stroke={OL} strokeWidth={1.2} />
          <Circle cx={60} cy={123} r={2.6} fill="#EBCDB0" />
          <Line x1={56} y1={129.5} x2={64} y2={129.5} stroke={OL} strokeWidth={1} opacity={0.6} />
        </G>
      )}
    </G>
  );
}

/* ─────────── 얼굴 ─────────── */

function Brows({ style, expression, color }: { style: BrowStyle; expression: Expression; color: string }) {
  const w = style === 'thick' ? 3.6 : style === 'thin' ? 1.6 : 2.4;
  const c = shade(color, 0.1);
  const common = { stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, fill: 'none', strokeLinejoin: 'round' as const };
  if (expression === 'angry')
    return (
      <G {...common} strokeWidth={w + 0.8}>
        <Path d="M39 47 L54 53" />
        <Path d="M81 47 L66 53" />
      </G>
    );
  if (expression === 'sad' || expression === 'scared')
    return (
      <G {...common}>
        <Path d="M40 51 Q46 46 53 46" />
        <Path d="M80 51 Q74 46 67 46" />
      </G>
    );
  const D: Record<BrowStyle, [string, string]> = {
    straight: ['M40 49 Q47 47 54 48.5', 'M80 49 Q73 47 66 48.5'],
    thick: ['M40 49 Q47 47 54 48.5', 'M80 49 Q73 47 66 48.5'],
    thin: ['M40 49 Q47 46.5 54 48.5', 'M80 49 Q73 46.5 66 48.5'],
    arched: ['M40 50 Q47 44 54 48', 'M80 50 Q73 44 66 48'],
    short: ['M44 48.5 Q48.5 47 53 48', 'M76 48.5 Q71.5 47 67 48'],
    angled: ['M40 50 L49 46.5 L54 48', 'M80 50 L71 46.5 L66 48'],
    droopy: ['M41 51 Q46 46 54 47', 'M79 51 Q74 46 66 47'],
  };
  return (
    <G {...common} opacity={0.9}>
      <Path d={D[style][0]} />
      <Path d={D[style][1]} />
    </G>
  );
}

/** 뜬 눈 하나. side: -1 = 왼쪽 눈(바깥쪽이 -x), 1 = 오른쪽 눈 */
function OpenEye({ x, y, style, iris, side }: { x: number; y: number; style: EyeStyle; iris: string; side: -1 | 1 }) {
  const out = x + side * 6; // 눈꼬리 쪽
  const inn = x - side * 5.5; // 눈 앞머리 쪽
  const lid = (outY: number, inY: number, peak = -6.8, w = 2) => (
    <Path d={`M${inn} ${y + inY} Q${x} ${y + peak} ${out} ${y + outY}`} stroke={OL} strokeWidth={w} fill="none" strokeLinecap="round" />
  );
  const pupil = (rx = 3.4, ry = 4.3, dy = 0.5) => (
    <G>
      <Ellipse cx={x} cy={y + dy} rx={rx} ry={ry} fill={iris} />
      <Ellipse cx={x} cy={y + dy + 0.4} rx={rx * 0.5} ry={ry * 0.5} fill="#15100E" />
      <Circle cx={x - 1.1} cy={y - 1.2} r={1.3} fill="#FFFFFF" />
    </G>
  );
  switch (style) {
    case 'dot':
      return <Circle cx={x} cy={y + 0.5} r={2.6} fill={OL} />;
    case 'narrow':
      return (
        <G>
          <Path d={`M${x - 5} ${y} Q${x} ${y - 3} ${x + 5} ${y} Q${x} ${y + 2} ${x - 5} ${y} Z`} fill={iris} />
          <Path d={`M${x - 6} ${y - 1} Q${x} ${y - 4} ${x + 6} ${y - 1}`} stroke={OL} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <Path d={`M${x - 3.6} ${y} A3.6 3.6 0 0 0 ${x + 3.6} ${y} Z`} fill={iris} />
          <Path d={`M${x - 6} ${y} Q${x} ${y - 1.5} ${x + 6} ${y}`} stroke={OL} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'round':
      return (
        <G>
          <Circle cx={x} cy={y} r={5.6} fill="#FFFFFF" stroke={OL} strokeWidth={1.6} />
          <Circle cx={x} cy={y + 0.4} r={3} fill={iris} />
          <Circle cx={x - 1} cy={y - 0.8} r={1.1} fill="#FFFFFF" />
        </G>
      );
    case 'big':
    case 'sparkle':
      return (
        <G>
          <Ellipse cx={x} cy={y} rx={5.6} ry={6.4} fill="#FFFFFF" stroke={OL} strokeWidth={1.6} />
          <Circle cx={x} cy={y + 0.8} r={4} fill={iris} />
          <Circle cx={x} cy={y + 0.8} r={2} fill="#15100E" />
          <Circle cx={x - 1.6} cy={y - 1.2} r={style === 'sparkle' ? 1.9 : 1.5} fill="#FFFFFF" />
          <Circle cx={x + 1.6} cy={y + 2.4} r={style === 'sparkle' ? 1.1 : 0.7} fill="#FFFFFF" />
          {style === 'sparkle' && <Path d={`M${x + 1.8} ${y - 2.6} l0.6 1.2 l1.2 0.6 l-1.2 0.6 l-0.6 1.2 l-0.6 -1.2 l-1.2 -0.6 l1.2 -0.6 Z`} fill="#FFFFFF" />}
          <Path d={`M${x - 6.5} ${y - 4} Q${x} ${y - 9} ${x + 6.5} ${y - 4}`} stroke={OL} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'droopy':
      return (
        <G>
          {pupil()}
          {lid(-1, -4.5, -7)}
        </G>
      );
    case 'cat':
      return (
        <G>
          {pupil(3.2, 4)}
          {lid(-5.5, -2.5, -6.2, 2.2)}
          <Path d={`M${out} ${y - 5.5} L${out + side * 2.5} ${y - 7.5}`} stroke={OL} strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    case 'lashes':
      return (
        <G>
          {pupil()}
          {lid(-3.2, -3.2)}
          <G stroke={OL} strokeWidth={1.6} strokeLinecap="round">
            <Line x1={out} y1={y - 3} x2={out + side * 3} y2={y - 5.5} />
            <Line x1={x + side * 3} y1={y - 5.5} x2={x + side * 4.5} y2={y - 8.5} />
          </G>
        </G>
      );
    default:
      // basic / double
      return (
        <G>
          {pupil()}
          {lid(-3.2, -3.2)}
          {style === 'double' && <Path d={`M${x - 5} ${y - 6.2} Q${x} ${y - 9.2} ${x + 5} ${y - 6.2}`} stroke={OL} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7} />}
        </G>
      );
  }
}

function Eyes({ style, expression, eyeColor }: { style: EyeStyle; expression: Expression; eyeColor: EyeColor }) {
  const iris = palettes.eyeColors[eyeColor];
  // 웃는 얼굴이나 눈웃음 스타일(편안한 표정)은 반달 눈
  if (expression === 'happy' || (style === 'smile' && expression === 'calm'))
    return (
      <G stroke={OL} strokeWidth={2.6} fill="none" strokeLinecap="round">
        <Path d={`M${L - 5.5} ${EY + 1} Q${L} ${EY - 5} ${L + 5.5} ${EY + 1}`} />
        <Path d={`M${R - 5.5} ${EY + 1} Q${R} ${EY - 5} ${R + 5.5} ${EY + 1}`} />
      </G>
    );
  if (expression === 'scared')
    return (
      <G>
        {[L, R].map((x) => (
          <G key={x}>
            <Ellipse cx={x} cy={EY} rx={5.8} ry={6.6} fill="#FFFFFF" stroke={OL} strokeWidth={1.8} />
            <Circle cx={x} cy={EY + 0.5} r={1.8} fill={OL} />
          </G>
        ))}
      </G>
    );
  const s: EyeStyle = expression === 'angry' ? 'narrow' : style === 'smile' ? 'basic' : style;
  const y = expression === 'sad' ? EY + 1 : EY;
  return (
    <G>
      <OpenEye x={L} y={y} style={s} iris={iris} side={-1} />
      <OpenEye x={R} y={y} style={s} iris={iris} side={1} />
    </G>
  );
}

function Nose({ style }: { style: NoseStyle }) {
  const common = { stroke: OL, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, opacity: 0.7 };
  switch (style) {
    case 'dot':
      return <Circle cx={60} cy={69} r={1.4} fill={OL} opacity={0.6} />;
    case 'round':
      return (
        <G {...common}>
          <Path d="M57 70 Q55.5 66 60 65.5 Q64.5 66 63 70" />
          <Circle cx={58.3} cy={70.3} r={0.6} fill={OL} />
          <Circle cx={61.7} cy={70.3} r={0.6} fill={OL} />
        </G>
      );
    case 'tall':
      return <Path d="M61 57 L59 69 Q60 71.5 63.5 70" {...common} />;
    case 'tiny':
      return <Path d="M58.8 69.5 Q60.5 71 62.2 69.5" {...common} />;
    default:
      return <Path d="M60.5 65 Q58 70.5 61.5 71.5" {...common} />;
  }
}

function Mouth({ expression, style }: { expression: Expression; style: MouthStyle }) {
  switch (expression) {
    case 'happy':
      return (
        <G>
          <Path d="M50 77 Q60 90 70 77 Z" fill="#E4676B" stroke={OL} strokeWidth={2} strokeLinejoin="round" />
          {style === 'teeth' ? <Rect x={56.5} y={77.5} width={7} height={3.6} fill="#FFFFFF" /> : <Path d="M54 84 Q60 87.5 66 84" fill="#FF9EA0" />}
        </G>
      );
    case 'neutral':
      return style === 'lips' ? (
        <Path d="M54 80 Q60 78.5 66 80 Q60 82.5 54 80 Z" fill="#E4676B" stroke={OL} strokeWidth={1.2} />
      ) : (
        <Path d="M54 80.5 L66 80.5" stroke={OL} strokeWidth={2.2} strokeLinecap="round" />
      );
    case 'sad':
      return <Path d="M53 83 Q60 78 67 83" stroke={OL} strokeWidth={2.2} fill="none" strokeLinecap="round" />;
    case 'angry':
      return (
        <G>
          <Path d="M50 84 Q60 76 70 84 Z" fill="#FFFFFF" stroke={OL} strokeWidth={2} strokeLinejoin="round" />
          <Line x1={52} y1={82} x2={68} y2={82} stroke={OL} strokeWidth={1} opacity={0.6} />
        </G>
      );
    case 'scared':
      return <Path d="M53 83 Q56 79 59 82 Q62 85 65 81 Q66 80 67 81" stroke={OL} strokeWidth={2} fill="none" strokeLinecap="round" />;
  }
  // calm: 평소 입 모양
  const line = { stroke: OL, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (style) {
    case 'small':
      return <Path d="M56 80 Q60 82.8 64 80" {...line} />;
    case 'lips':
      return (
        <G stroke={OL} strokeWidth={1.2} strokeLinejoin="round">
          <Path d="M52 79.5 Q56 76.8 60 78.3 Q64 76.8 68 79.5 Q60 81 52 79.5 Z" fill="#E4676B" />
          <Path d="M52 79.5 Q60 86.5 68 79.5 Q60 81 52 79.5 Z" fill="#EC8A8C" />
        </G>
      );
    case 'teeth':
      return (
        <G>
          <Path d="M51 78 Q60 88 69 78 Z" fill="#E4676B" stroke={OL} strokeWidth={1.8} strokeLinejoin="round" />
          <Rect x={56.5} y={78.2} width={7} height={3.8} fill="#FFFFFF" />
          <Line x1={60} y1={78.2} x2={60} y2={82} stroke={OL} strokeWidth={0.8} opacity={0.6} />
        </G>
      );
    case 'cat':
      return <Path d="M53 79 Q56.5 82.8 60 79 Q63.5 82.8 67 79" {...line} />;
    case 'flat':
      return <Path d="M55 80.5 L65 80.5" {...line} />;
    default:
      return <Path d="M53 79 Q60 84 67 79" {...line} />;
  }
}

function Cheeks({ style, expression }: { style: CheekStyle; expression: Expression }) {
  if (expression === 'angry')
    return (
      <G fill="#FF6B6B" opacity={0.3}>
        <Ellipse cx={39} cy={71} rx={7} ry={4} />
        <Ellipse cx={81} cy={71} rx={7} ry={4} />
      </G>
    );
  if (style === 'none' || expression === 'scared') return null;
  if (style === 'freckles')
    return (
      <G fill="#A0652D" opacity={0.55}>
        {[
          [36, 69],
          [40, 72],
          [43, 68.5],
          [84, 69],
          [80, 72],
          [77, 68.5],
        ].map(([x, y]) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} />
        ))}
      </G>
    );
  if (style === 'mole') return <Circle cx={77} cy={76} r={1.2} fill={OL} opacity={0.8} />;
  const lines = (
    <G stroke="#F07A7A" strokeWidth={1.1} strokeLinecap="round" opacity={0.6}>
      {[35, 39, 43].map((x) => (
        <Line key={`l${x}`} x1={x} y1={72.5} x2={x + 2} y2={69.5} />
      ))}
      {[77, 81, 85].map((x) => (
        <Line key={`r${x}`} x1={x} y1={72.5} x2={x + 2} y2={69.5} />
      ))}
    </G>
  );
  if (style === 'lines') return lines;
  // blush: 옅은 원 + 사선 세 줄
  return (
    <G>
      <G fill="#FF9C9C" opacity={0.35}>
        <Ellipse cx={39} cy={71} rx={6.5} ry={3.8} />
        <Ellipse cx={81} cy={71} rx={6.5} ry={3.8} />
      </G>
      {lines}
    </G>
  );
}

export function FacialHairLayer({ kind, color }: { kind: FacialHair; color: string }) {
  if (kind === 'none') return null;
  const mustache = <Path d="M50.5 77 Q55 72.5 60 75 Q65 72.5 69.5 77 Q65 76 60 77.5 Q55 76 50.5 77 Z" fill={color} stroke={OL} strokeWidth={1} strokeLinejoin="round" />;
  if (kind === 'mustache') return mustache;
  if (kind === 'beard')
    return (
      <G>
        <Path d="M31 72 Q34 92 60 96 Q86 92 89 72 Q84 86 70 86 Q60 90 50 86 Q36 86 31 72 Z" fill={color} stroke={OL} strokeWidth={1.4} strokeLinejoin="round" />
        {mustache}
      </G>
    );
  // stubble: 짧은 수염 점
  const dots: [number, number][] = [];
  for (let y = 80; y <= 92; y += 3) for (let x = 42; x <= 78; x += 3.2) if (((x - 60) / 18) ** 2 + ((y - 86) / 8) ** 2 < 1 && !(y < 84 && x > 50 && x < 70)) dots.push([x, y]);
  return (
    <G fill={shade(color, 0.1)} opacity={0.45}>
      {dots.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={0.7} />
      ))}
    </G>
  );
}

/** 웹툰식 감정 기호: 핏대(화남), 눈물(슬픔), 식은땀·그늘선(무서움) */
export function EmotionMarks({ expression }: { expression: Expression }) {
  if (expression === 'angry')
    return (
      <G stroke="#E0484E" strokeWidth={2.2} strokeLinecap="round" fill="none">
        <Path d="M84 30 Q87 33 90 30" />
        <Path d="M84 38 Q87 35 90 38" />
        <Path d="M82 32 Q85 34 82 36" />
        <Path d="M92 32 Q89 34 92 36" />
      </G>
    );
  if (expression === 'sad')
    return <Path d={`M${L - 1} ${EY + 5} Q${L - 3} ${EY + 12} ${L - 1} ${EY + 18}`} stroke="#6EC3FF" strokeWidth={2.6} fill="none" strokeLinecap="round" />;
  if (expression === 'scared')
    return (
      <G>
        <G stroke="#8FA2C8" strokeWidth={1.5} strokeLinecap="round" opacity={0.8}>
          {[48, 54, 60, 66, 72].map((x) => (
            <Line key={x} x1={x} y1={31} x2={x} y2={40} />
          ))}
        </G>
        <Path d="M91 42 Q87 50 91 54 Q95 50 91 42 Z" fill="#9ED8FF" stroke={OL} strokeWidth={1} />
      </G>
    );
  return null;
}

export function Face({
  expression,
  eyes,
  eyeColor,
  brows,
  nose,
  mouth,
  cheeks,
  hairColor,
}: {
  expression: Expression;
  eyes: EyeStyle;
  eyeColor: EyeColor;
  brows: BrowStyle;
  nose: NoseStyle;
  mouth: MouthStyle;
  cheeks: CheekStyle;
  hairColor: string;
}) {
  return (
    <G>
      <Cheeks style={cheeks} expression={expression} />
      <Brows style={brows} expression={expression} color={hairColor} />
      <Eyes style={eyes} expression={expression} eyeColor={eyeColor} />
      <Nose style={nose} />
      <Mouth expression={expression} style={mouth} />
    </G>
  );
}

/* ─────────── 소품 ─────────── */

export function Glasses({ style }: { style: GlassesStyle }) {
  switch (style) {
    case 'none':
      return null;
    case 'round':
    case 'gold': {
      const c = style === 'gold' ? '#B8913A' : OL;
      return (
        <G stroke={c} strokeWidth={style === 'gold' ? 1.4 : 1.8} fill="rgba(255,255,255,0.2)">
          <Circle cx={L} cy={EY} r={9} />
          <Circle cx={R} cy={EY} r={9} />
          <Path d="M56 59 Q60 57 64 59" fill="none" />
        </G>
      );
    }
    case 'square':
      return (
        <G stroke={OL} strokeWidth={1.4} fill="rgba(255,255,255,0.15)">
          <Rect x={37} y={53.5} width={20} height={13} rx={2} />
          <Rect x={63} y={53.5} width={20} height={13} rx={2} />
          <Path d="M57 58 L63 58" fill="none" />
        </G>
      );
    case 'half':
      return (
        <G stroke="#2B1F1C" fill="none" strokeLinecap="round">
          <Path d="M37 55 Q47 52 57 55" strokeWidth={3.2} />
          <Path d="M63 55 Q73 52 83 55" strokeWidth={3.2} />
          <Path d="M37 55 Q37 66 47 67 Q56 66 57 55" strokeWidth={1} opacity={0.5} />
          <Path d="M63 55 Q63 66 73 67 Q82 66 83 55" strokeWidth={1} opacity={0.5} />
          <Path d="M57 56 L63 56" strokeWidth={2} />
        </G>
      );
    default:
      // 뿔테
      return (
        <G stroke="#2B1F1C" strokeWidth={3.4} fill="rgba(255,255,255,0.15)" strokeLinejoin="round">
          <Rect x={36.5} y={52.5} width={21} height={15} rx={5} />
          <Rect x={62.5} y={52.5} width={21} height={15} rx={5} />
          <Path d="M57.5 58 L62.5 58" fill="none" strokeWidth={2.4} />
        </G>
      );
  }
}

export function HeadwearLayer({ kind, hair }: { kind: Headwear; hair: HairStyle }) {
  const s = { stroke: OL, strokeWidth: 1.4, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'headband':
      return <Path d="M26 44 C30 22 90 22 94 44" stroke="#F4A6A0" strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    case 'wideband':
      return (
        <G>
          <Path d="M25 42 C30 18 90 18 95 42" stroke={OL} strokeWidth={11} fill="none" strokeLinecap="round" />
          <Path d="M25 42 C30 18 90 18 95 42" stroke="#C9B8F0" strokeWidth={8.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'pin':
      return (
        <G stroke={OL} strokeWidth={1.2}>
          <Rect x={30} y={36} width={14} height={4.5} rx={2.2} fill="#FFD58A" transform="rotate(-25 37 38)" />
          <Rect x={33} y={43} width={14} height={4.5} rx={2.2} fill="#A8CFF2" transform="rotate(-25 40 45)" />
        </G>
      );
    case 'claw':
      return (
        <G {...s} fill="#8A6A5A">
          <Path d="M78 22 Q86 16 94 22 L92 30 Q86 26 80 30 Z" />
          {[82, 86, 90].map((x) => (
            <Line key={x} x1={x} y1={27} x2={x} y2={32} stroke={OL} strokeWidth={1.2} />
          ))}
        </G>
      );
    case 'flower':
      return (
        <G>
          {[0, 72, 144, 216, 288].map((a) => {
            const r = (a * Math.PI) / 180;
            return <Circle key={a} cx={34 + Math.cos(r) * 5} cy={34 + Math.sin(r) * 5} r={4} fill="#FFB3D1" stroke={OL} strokeWidth={1} />;
          })}
          <Circle cx={34} cy={34} r={3} fill="#FFD84D" stroke={OL} strokeWidth={1} />
        </G>
      );
    case 'scrunchie': {
      const tied = hair === 'ponytail' || hair === 'bun' || hair === 'halfUp';
      const [cx, cy] = hair === 'ponytail' ? [84, 31] : hair === 'lowPony' ? [80, 82] : tied ? [60, hair === 'bun' ? 23 : 20] : [88, 36];
      return (
        <G fill="#C9B8F0" stroke={OL} strokeWidth={1.2}>
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const r = (a * Math.PI) / 180;
            return <Circle key={a} cx={cx + Math.cos(r) * 4.5} cy={cy + Math.sin(r) * 3} r={3.2} />;
          })}
        </G>
      );
    }
    case 'ribbon':
      return (
        <G fill="#F4A6A0" {...s}>
          <Path d="M78 24 L66 17 L67 32 Z" />
          <Path d="M78 24 L90 17 L89 32 Z" />
          <Circle cx={78} cy={24} r={3.6} fill="#E4676B" />
        </G>
      );
    case 'bigBow':
      return (
        <G fill="#E4676B" {...s}>
          <Path d="M60 16 L40 4 L42 28 Z" />
          <Path d="M60 16 L80 4 L78 28 Z" />
          <Path d="M58 18 L52 34 L57 32 L60 20 Z" />
          <Path d="M62 18 L68 34 L63 32 L60 20 Z" />
          <Circle cx={60} cy={16} r={5} fill="#C94F55" />
        </G>
      );
    case 'cap':
      return (
        <G stroke={OL} strokeWidth={SW} strokeLinejoin="round">
          <Path d="M24 46 C24 16 96 16 96 46 Z" fill="#8FA7C9" />
          <Path d="M58 46 L106 46 C106 52 98 54 86 52 L58 49 Z" fill="#6D86AA" />
          <Circle cx={60} cy={18} r={3.4} fill="#6D86AA" />
        </G>
      );
    case 'beanie':
      return (
        <G stroke={OL} strokeWidth={SW} strokeLinejoin="round">
          <Path d="M24 44 C23 12 97 12 96 44 Z" fill="#F4A6A0" />
          <Rect x={22} y={36} width={76} height={11} rx={5.5} fill="#E88E86" />
          <Circle cx={60} cy={10} r={6.5} fill="#FFF3E6" />
        </G>
      );
    case 'bucket':
      return (
        <G stroke={OL} strokeWidth={SW} strokeLinejoin="round">
          <Path d="M14 46 Q60 36 106 46 L100 52 Q60 44 20 52 Z" fill="#EBCDB0" />
          <Path d="M28 44 C28 16 92 16 92 44 Q60 38 28 44 Z" fill="#EBCDB0" />
          <Path d="M29 40 Q60 34 91 40" stroke={shade('#EBCDB0', 0.25)} strokeWidth={2} fill="none" />
        </G>
      );
    default:
      return null;
  }
}

export function EarringsLayer({ kind, halfW }: { kind: Earrings; halfW: number }) {
  if (kind === 'none') return null;
  const xs = [60 - halfW, 60 + halfW];
  return (
    <G>
      {xs.map((x) => (
        <G key={x}>
          {kind === 'stud' && <Circle cx={x} cy={68.5} r={2.2} fill="#FFD84D" stroke={OL} strokeWidth={1} />}
          {kind === 'hoop' && <Circle cx={x} cy={72} r={3.8} fill="none" stroke="#D4A63A" strokeWidth={1.6} />}
          {kind === 'drop' && (
            <G>
              <Line x1={x} y1={68} x2={x} y2={72} stroke="#D4A63A" strokeWidth={1.2} />
              <Path d={`M${x} ${72} Q${x - 2.6} ${76} ${x} ${78} Q${x + 2.6} ${76} ${x} ${72} Z`} fill="#A8CFF2" stroke={OL} strokeWidth={0.9} />
            </G>
          )}
        </G>
      ))}
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
