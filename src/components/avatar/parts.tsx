/**
 * 일상툰(웹툰) 스타일 아바타 파츠.
 * 진갈색 외곽선 + 평면 채색, 눈·코·입이 있는 얼굴, 한국에서 흔한 머리 모양과 원복 차림.
 * 좌표계: viewBox 0 0 120 140 (얼굴 중심 약 60,58)
 */
import { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { BrowStyle, CheekStyle, EyeStyle, Expression, FaceShape, GlassesStyle, HairStyle, Headwear, Pattern, TopStyle } from '@/types';

export const OL = '#3B2F2F'; // 외곽선
const SW = 2.2; // 외곽선 두께
const L = 47; // 왼쪽 눈 x
const R = 73; // 오른쪽 눈 x
const EY = 60; // 눈 y

/** hex 색을 어둡게 (눈썹·그림자용) */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.round(((n >> s) & 255) * (1 - amount)));
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/* ─────────── 얼굴형 ─────────── */

const FACE_PATH: Record<FaceShape, string> = {
  round: 'M24 56 C24 32 40 20 60 20 C80 20 96 32 96 56 C96 79 80 95 60 95 C40 95 24 79 24 56 Z',
  oval: 'M26 54 C26 31 42 20 60 20 C78 20 94 31 94 54 C94 76 77 96 60 97 C43 96 26 76 26 54 Z',
  square: 'M25 52 C25 30 40 20 60 20 C80 20 95 30 95 52 L94 72 C92 86 77 95 60 95 C43 95 28 86 26 72 Z',
  heart: 'M24 52 C24 30 40 20 60 20 C80 20 96 30 96 52 C96 71 79 91 60 98 C41 91 24 71 24 52 Z',
  long: 'M28 52 C28 28 42 18 60 18 C78 18 92 28 92 52 C92 76 76 98 60 99 C44 98 28 76 28 52 Z',
};

export function headGeometry(shape: FaceShape) {
  return { halfW: shape === 'long' ? 32 : shape === 'oval' ? 34 : shape === 'square' ? 35 : 36 };
}

export function Head({ shape, skin }: { shape: FaceShape; skin: string }) {
  return <Path d={FACE_PATH[shape]} fill={skin} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />;
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
const SLEEK = 'M24 52 C24 27 42 15 60 15 C78 15 96 27 96 52 C88 37 75 29 60 29 C45 29 32 37 24 52 Z';

export function HairBack({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'bobBangs':
    case 'bobPart':
      return <Path d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L101 88 C95 94 25 94 19 88 Z" fill={color} {...hairStroke} />;
    case 'longBangs':
    case 'longPart':
      return <Path d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 L104 120 C92 126 28 126 16 120 Z" fill={color} {...hairStroke} />;
    case 'wave':
      return (
        <Path
          d="M20 56 C18 26 40 13 60 13 C80 13 102 26 100 56 C106 70 96 80 104 92 C110 104 98 118 88 114 L32 114 C22 118 10 104 16 92 C24 80 14 70 20 56 Z"
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
    case 'bun':
      return <Circle cx={60} cy={13} r={12} fill={color} {...hairStroke} />;
    case 'pigtails':
      return (
        <G fill={color} {...hairStroke}>
          <Path d="M24 62 C10 64 8 92 16 104 C20 108 26 104 24 98 C20 88 24 74 30 68 Z" />
          <Path d="M96 62 C110 64 112 92 104 104 C100 108 94 104 96 98 C100 88 96 74 90 68 Z" />
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
      // 옆·뒤는 짧게 친 느낌: 머리 윤곽을 따라 얇은 층
      return <Path d="M23 60 C20 30 40 16 60 16 C80 16 100 30 97 60 C94 44 84 34 60 32 C36 34 26 44 23 60 Z" fill={shade(color, -0.25)} opacity={0.9} {...hairStroke} />;
    default:
      return null;
  }
}

export function HairFront({ style, color }: { style: HairStyle; color: string }) {
  let d: string;
  switch (style) {
    case 'dandy':
      d = 'M23 54 C21 27 40 14 60 14 C82 14 99 27 97 54 C93 45 85 39 74 36 C66 43 48 45 34 42 C30 46 26 50 23 54 Z';
      break;
    case 'twoblock':
      d = 'M28 46 C26 24 44 12 63 12 C83 12 97 24 95 46 C88 38 78 32 66 33 C54 39 41 39 31 37 C30 40 29 43 28 46 Z';
      break;
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
    case 'bobBangs':
    case 'longBangs':
    case 'pigtails':
      d = BANGS;
      break;
    case 'bobPart':
    case 'longPart':
    case 'wave':
    case 'halfUp':
      d = SIDE_PART;
      break;
    case 'ponytail':
    case 'bun':
      d = SLEEK;
      break;
    default:
      return null;
  }
  return (
    <G>
      <Path d={d} fill={color} {...hairStroke} />
      {/* 웹툰식 머리 윤기 */}
      <Path d="M40 24 Q50 19 60 20" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" fill="none" opacity={0.35} />
    </G>
  );
}

/* ─────────── 옷 ─────────── */

const BODY = 'M27 140 C27 116 41 104 60 104 C79 104 93 116 93 140 Z';
const APRON = 'M38 114 L82 114 L87 140 L33 140 Z';

function PatternLayer({ pattern, clipId }: { pattern: Pattern; clipId: string }) {
  if (pattern === 'none') return null;
  return (
    <G clipPath={`url(#${clipId})`}>
      {pattern === 'stripe' &&
        [110, 118, 126, 134].map((y) => <Rect key={y} x={10} y={y} width={100} height={3.2} fill="#FFFFFF" opacity={0.55} />)}
      {pattern === 'dots' &&
        [112, 121, 130, 139].flatMap((y, row) =>
          [30, 40, 50, 60, 70, 80, 90].map((x) => <Circle key={`${x}-${y}`} cx={x + (row % 2) * 5} cy={y} r={1.8} fill="#FFFFFF" opacity={0.75} />),
        )}
    </G>
  );
}

export function Clothes({ top, pattern, color, skin, clipId, nameTag }: { top: TopStyle; pattern: Pattern; color: string; skin: string; clipId: string; nameTag: boolean }) {
  const main = top === 'apron' ? APRON : BODY;
  const dark = shade(color, 0.18);
  return (
    <G>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={main} />
        </ClipPath>
      </Defs>
      {top === 'hoodie' && <Path d="M34 112 C32 96 88 96 86 112 C80 105 40 105 34 112 Z" fill={dark} stroke={OL} strokeWidth={SW} />}
      {/* 몸통: 앞치마·카디건은 안에 흰 티 */}
      <Path d={BODY} fill={top === 'apron' || top === 'cardigan' ? '#FFFFFF' : color} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
      {top === 'cardigan' && (
        <G>
          <Path d="M27 140 C27 116 41 104 54 104 L57 140 Z" fill={color} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <Path d="M93 140 C93 116 79 104 66 104 L63 140 Z" fill={color} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
        </G>
      )}
      {top === 'apron' && (
        <G>
          <Path d={APRON} fill={color} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
          <Line x1={42} y1={114} x2={49} y2={104} stroke={color} strokeWidth={4} strokeLinecap="round" />
          <Line x1={78} y1={114} x2={71} y2={104} stroke={color} strokeWidth={4} strokeLinecap="round" />
          <Rect x={51} y={124} width={18} height={10} rx={3} fill="none" stroke={OL} strokeWidth={1.4} opacity={0.6} />
        </G>
      )}
      <PatternLayer pattern={pattern} clipId={clipId} />
      {top === 'cardigan' && (
        <G fill="#FFFFFF" stroke={OL} strokeWidth={1}>
          <Circle cx={53} cy={120} r={1.8} />
          <Circle cx={53} cy={130} r={1.8} />
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
      {(top === 'apron' || top === 'cardigan') && <Path d="M51 104 Q60 111 69 104" fill={skin} stroke={OL} strokeWidth={1.4} />}
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

/* ─────────── 얼굴 ─────────── */

function Brows({ style, expression, color }: { style: BrowStyle; expression: Expression; color: string }) {
  const w = style === 'thick' ? 3.6 : 2.4;
  const c = shade(color, 0.1);
  const common = { stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, fill: 'none' };
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
  if (style === 'arched')
    return (
      <G {...common}>
        <Path d="M40 50 Q47 44 54 48" />
        <Path d="M80 50 Q73 44 66 48" />
      </G>
    );
  return (
    <G {...common}>
      <Path d="M40 49 Q47 47 54 48.5" />
      <Path d="M80 49 Q73 47 66 48.5" />
    </G>
  );
}

function OpenEye({ x, y, style }: { x: number; y: number; style: EyeStyle }) {
  if (style === 'narrow')
    return (
      <G>
        <Path d={`M${x - 5} ${y} Q${x} ${y - 3} ${x + 5} ${y} Q${x} ${y + 2} ${x - 5} ${y} Z`} fill={OL} />
        <Path d={`M${x - 6} ${y - 1} Q${x} ${y - 4} ${x + 6} ${y - 1}`} stroke={OL} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </G>
    );
  if (style === 'big')
    return (
      <G>
        <Ellipse cx={x} cy={y} rx={5.6} ry={6.4} fill="#FFFFFF" stroke={OL} strokeWidth={1.6} />
        <Circle cx={x} cy={y + 0.8} r={4} fill="#4A3228" />
        <Circle cx={x} cy={y + 0.8} r={2} fill="#1E1715" />
        <Circle cx={x - 1.6} cy={y - 1.2} r={1.5} fill="#FFFFFF" />
        <Circle cx={x + 1.6} cy={y + 2.4} r={0.7} fill="#FFFFFF" />
        <Path d={`M${x - 6.5} ${y - 4} Q${x} ${y - 9} ${x + 6.5} ${y - 4}`} stroke={OL} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      </G>
    );
  // basic / double: 까만 타원 눈동자 + 윗눈꺼풀 선
  return (
    <G>
      <Ellipse cx={x} cy={y + 0.5} rx={3.4} ry={4.3} fill={OL} />
      <Circle cx={x - 1.1} cy={y - 1.2} r={1.3} fill="#FFFFFF" />
      <Path d={`M${x - 5.5} ${y - 3.2} Q${x} ${y - 6.8} ${x + 5.5} ${y - 3.2}`} stroke={OL} strokeWidth={2} fill="none" strokeLinecap="round" />
      {style === 'double' && <Path d={`M${x - 5} ${y - 6.2} Q${x} ${y - 9.2} ${x + 5} ${y - 6.2}`} stroke={OL} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7} />}
    </G>
  );
}

function Eyes({ style, expression }: { style: EyeStyle; expression: Expression }) {
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
      <OpenEye x={L} y={y} style={s} />
      <OpenEye x={R} y={y} style={s} />
    </G>
  );
}

function Nose() {
  return <Path d="M60.5 65 Q58 70.5 61.5 71.5" stroke={OL} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.7} />;
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'happy':
      return (
        <G>
          <Path d="M50 77 Q60 90 70 77 Z" fill="#E4676B" stroke={OL} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M54 84 Q60 87.5 66 84" fill="#FF9EA0" />
        </G>
      );
    case 'calm':
      return <Path d="M53 79 Q60 84 67 79" stroke={OL} strokeWidth={2.2} fill="none" strokeLinecap="round" />;
    case 'neutral':
      return <Path d="M54 80.5 L66 80.5" stroke={OL} strokeWidth={2.2} strokeLinecap="round" />;
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
  // 웹툰식 볼터치: 옅은 원 + 사선 세 줄
  return (
    <G>
      <G fill="#FF9C9C" opacity={0.35}>
        <Ellipse cx={39} cy={71} rx={6.5} ry={3.8} />
        <Ellipse cx={81} cy={71} rx={6.5} ry={3.8} />
      </G>
      <G stroke="#F07A7A" strokeWidth={1.1} strokeLinecap="round" opacity={0.6}>
        {[35, 39, 43].map((x) => (
          <Line key={`l${x}`} x1={x} y1={72.5} x2={x + 2} y2={69.5} />
        ))}
        {[77, 81, 85].map((x) => (
          <Line key={`r${x}`} x1={x} y1={72.5} x2={x + 2} y2={69.5} />
        ))}
      </G>
    </G>
  );
}

/** 웹툰식 감정 기호: 핏대(화남), 눈물(슬픔), 식은땀·그늘선(무서움) */
function Marks({ expression }: { expression: Expression }) {
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
          <Line x1={48} y1={32} x2={48} y2={40} />
          <Line x1={54} y1={31} x2={54} y2={40} />
          <Line x1={60} y1={31} x2={60} y2={40} />
          <Line x1={66} y1={31} x2={66} y2={40} />
          <Line x1={72} y1={32} x2={72} y2={40} />
        </G>
        <Path d="M91 42 Q87 50 91 54 Q95 50 91 42 Z" fill="#9ED8FF" stroke={OL} strokeWidth={1} />
      </G>
    );
  return null;
}

export function Face({
  expression,
  eyes,
  brows,
  cheeks,
  hairColor,
}: {
  expression: Expression;
  eyes: EyeStyle;
  brows: BrowStyle;
  cheeks: CheekStyle;
  hairColor: string;
}) {
  return (
    <G>
      <Cheeks style={cheeks} expression={expression} />
      <Brows style={brows} expression={expression} color={hairColor} />
      <Eyes style={eyes} expression={expression} />
      <Nose />
      <Mouth expression={expression} />
    </G>
  );
}

export function EmotionMarks({ expression }: { expression: Expression }) {
  return <Marks expression={expression} />;
}

/* ─────────── 소품 ─────────── */

export function Glasses({ style }: { style: GlassesStyle }) {
  if (style === 'none') return null;
  if (style === 'round')
    return (
      <G stroke={OL} strokeWidth={1.8} fill="rgba(255,255,255,0.2)">
        <Circle cx={L} cy={EY} r={9} />
        <Circle cx={R} cy={EY} r={9} />
        <Path d="M56 59 Q60 57 64 59" fill="none" />
      </G>
    );
  return (
    <G stroke="#2B1F1C" strokeWidth={3.4} fill="rgba(255,255,255,0.15)" strokeLinejoin="round">
      <Rect x={36.5} y={52.5} width={21} height={15} rx={5} />
      <Rect x={62.5} y={52.5} width={21} height={15} rx={5} />
      <Path d="M57.5 58 L62.5 58" fill="none" strokeWidth={2.4} />
    </G>
  );
}

export function HeadwearLayer({ kind, hair }: { kind: Headwear; hair: HairStyle }) {
  switch (kind) {
    case 'headband':
      return <Path d="M26 44 C30 22 90 22 94 44" stroke="#F4A6A0" strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    case 'pin':
      // 똑딱핀 두 개
      return (
        <G stroke={OL} strokeWidth={1.2}>
          <Rect x={30} y={36} width={14} height={4.5} rx={2.2} fill="#FFD58A" transform="rotate(-25 37 38)" />
          <Rect x={33} y={43} width={14} height={4.5} rx={2.2} fill="#A8CFF2" transform="rotate(-25 40 45)" />
        </G>
      );
    case 'scrunchie': {
      const tied = hair === 'ponytail' || hair === 'bun' || hair === 'halfUp';
      const [cx, cy] = hair === 'ponytail' ? [84, 31] : tied ? [60, hair === 'bun' ? 23 : 20] : [88, 36];
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
        <G fill="#F4A6A0" stroke={OL} strokeWidth={1.4} strokeLinejoin="round">
          <Path d="M78 24 L66 17 L67 32 Z" />
          <Path d="M78 24 L90 17 L89 32 Z" />
          <Circle cx={78} cy={24} r={3.6} fill="#E4676B" />
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
    default:
      return null;
  }
}
