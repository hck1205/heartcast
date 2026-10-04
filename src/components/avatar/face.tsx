/** 일상툰 아바타 파츠: 눈 · 눈썹 · 코 · 입 · 볼 · 수염 · 감정 기호 */
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { palettes } from '@/theme';
import type { BrowStyle, CheekStyle, EyeColor, EyeStyle, Expression, FacialHair, MouthStyle, NoseStyle } from '@/types';
import { EY, L, OL, R, shade } from './shared';

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
