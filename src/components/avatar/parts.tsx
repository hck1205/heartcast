import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { BrowStyle, CheekStyle, EyeStyle, Expression, FaceShape, GlassesStyle, HairStyle, Headwear, Pattern, TopStyle } from '@/types';

export const INK = '#2E3A59';
const L = 46; // 왼쪽 눈 x
const R = 74; // 오른쪽 눈 x
const EY = 60; // 눈 y

/* ─────────── 얼굴형 ─────────── */

export function headGeometry(shape: FaceShape) {
  switch (shape) {
    case 'oval':
      return { halfW: 31 };
    case 'long':
      return { halfW: 27 };
    case 'square':
      return { halfW: 35 };
    default:
      return { halfW: 34 };
  }
}

export function Head({ shape, skin }: { shape: FaceShape; skin: string }) {
  switch (shape) {
    case 'oval':
      return <Ellipse cx={60} cy={61} rx={31} ry={35} fill={skin} />;
    case 'long':
      return <Ellipse cx={60} cy={62} rx={27} ry={38} fill={skin} />;
    case 'square':
      return <Rect x={25} y={27} width={70} height={66} rx={12} fill={skin} />;
    case 'heart':
      return <Path d="M24 50 C24 26 44 22 60 30 C76 22 96 26 96 50 C96 72 76 90 60 99 C44 90 24 72 24 50 Z" fill={skin} />;
    default:
      return <Circle cx={60} cy={60} r={34} fill={skin} />;
  }
}

/* ─────────── 머리카락 ─────────── */

export function HairBack({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'long':
      return <Path d="M24 58 C24 26 96 26 96 58 L100 112 C88 118 32 118 20 112 Z" fill={color} />;
    case 'wavy':
      return (
        <Path
          d="M22 58 C20 24 100 24 98 58 C104 70 94 78 100 90 C104 102 92 112 84 106 L36 106 C28 112 16 102 20 90 C26 78 16 70 22 58 Z"
          fill={color}
        />
      );
    case 'bob':
      return <Path d="M22 60 C22 22 98 22 98 60 L98 88 C90 94 30 94 22 88 Z" fill={color} />;
    case 'bun':
      return <Circle cx={60} cy={20} r={15} fill={color} />;
    case 'ponytail':
      return (
        <G>
          <Path d="M82 34 C104 34 110 66 102 94 C98 104 88 100 90 90 C96 68 92 48 78 40 Z" fill={color} />
          <Circle cx={84} cy={36} r={5} fill="#FF5C8A" />
        </G>
      );
    case 'pigtails':
      return (
        <G fill={color}>
          <Ellipse cx={20} cy={74} rx={10} ry={18} />
          <Ellipse cx={100} cy={74} rx={10} ry={18} />
        </G>
      );
    case 'braids':
      return (
        <G fill={color}>
          {[22, 98].map((x) =>
            [66, 77, 88, 99].map((y) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={7} />),
          )}
          <Circle cx={22} cy={108} r={3.5} fill="#FFD84D" />
          <Circle cx={98} cy={108} r={3.5} fill="#FFD84D" />
        </G>
      );
    case 'curly':
      return (
        <G fill={color}>
          {[
            [30, 40],
            [44, 28],
            [60, 24],
            [76, 28],
            [90, 40],
            [26, 58],
            [94, 58],
          ].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={14} />
          ))}
        </G>
      );
    case 'afro':
      return (
        <G fill={color}>
          <Circle cx={60} cy={52} r={44} />
          {[
            [22, 40],
            [30, 20],
            [50, 10],
            [70, 10],
            [90, 20],
            [98, 40],
            [100, 62],
            [20, 62],
          ].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={12} />
          ))}
        </G>
      );
    default:
      return null;
  }
}

export function HairFront({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case 'short':
      return <Path d="M26 56 C26 24 94 24 94 56 C84 44 70 40 60 42 C48 40 36 44 26 56 Z" fill={color} />;
    case 'spiky':
      return (
        <Path
          d="M26 56 L28 34 L38 40 L42 24 L52 36 L60 20 L68 36 L78 24 L82 40 L92 34 L94 56 C82 44 38 44 26 56 Z"
          fill={color}
        />
      );
    case 'buzz':
      return <Path d="M27 52 C28 25 92 25 93 52 C80 40 40 40 27 52 Z" fill={color} opacity={0.85} />;
    case 'bob':
    case 'long':
    case 'pigtails':
      return <Path d="M26 58 C26 22 94 22 94 58 C88 48 74 42 64 44 C56 36 40 42 26 58 Z" fill={color} />;
    case 'wavy':
      return <Path d="M26 60 C24 22 96 22 94 56 C80 40 56 40 40 50 C34 54 30 58 26 60 Z" fill={color} />;
    case 'ponytail':
      return <Path d="M26 56 C26 24 94 24 94 56 C84 42 66 38 54 42 C44 44 34 48 26 56 Z" fill={color} />;
    case 'braids':
      return <Path d="M26 58 C26 22 94 22 94 58 C86 46 70 38 60 36 C50 38 34 46 26 58 Z" fill={color} />;
    case 'bun':
      return <Path d="M26 56 C28 26 92 26 94 56 C80 46 40 46 26 56 Z" fill={color} />;
    case 'curly':
      return (
        <G fill={color}>
          <Circle cx={40} cy={36} r={11} />
          <Circle cx={56} cy={32} r={11} />
          <Circle cx={72} cy={34} r={11} />
          <Circle cx={84} cy={42} r={9} />
          <Circle cx={32} cy={46} r={9} />
        </G>
      );
    case 'afro':
      return (
        <G fill={color}>
          <Circle cx={36} cy={40} r={9} />
          <Circle cx={50} cy={34} r={9} />
          <Circle cx={66} cy={33} r={9} />
          <Circle cx={80} cy={38} r={9} />
        </G>
      );
    default:
      return null;
  }
}

/* ─────────── 옷 ─────────── */

const BODY = 'M22 140 C22 112 38 100 60 100 C82 100 98 112 98 140 Z';

function PatternLayer({ pattern, clipId }: { pattern: Pattern; clipId: string }) {
  if (pattern === 'none') return null;
  const cells: [number, number][] = [];
  for (let y = 108; y < 140; y += 10) for (let x = 26 + ((y / 10) % 2) * 5; x < 96; x += 11) cells.push([x, y]);
  return (
    <G clipPath={`url(#${clipId})`}>
      {pattern === 'stripe' &&
        [106, 116, 126, 136].map((y) => <Rect key={y} x={10} y={y} width={100} height={4} fill="#FFFFFF" opacity={0.45} />)}
      {pattern === 'dots' && cells.map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#FFFFFF" opacity={0.65} />)}
      {pattern === 'stars' &&
        cells
          .filter((_, i) => i % 2 === 0)
          .map(([x, y]) => (
            <Path
              key={`${x}-${y}`}
              d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y - 1} L${x + 1.8} ${y + 1} L${x + 2.5} ${y + 4} L${x} ${y + 2.2} L${x - 2.5} ${y + 4} L${x - 1.8} ${y + 1} L${x - 4} ${y - 1} L${x - 1.2} ${y - 1.2} Z`}
              fill="#FFF3A8"
            />
          ))}
      {pattern === 'hearts' &&
        cells
          .filter((_, i) => i % 2 === 1)
          .map(([x, y]) => (
            <Path
              key={`${x}-${y}`}
              d={`M${x} ${y + 3} C${x - 5} ${y - 1} ${x - 3} ${y - 5} ${x} ${y - 2} C${x + 3} ${y - 5} ${x + 5} ${y - 1} ${x} ${y + 3} Z`}
              fill="#FFFFFF"
              opacity={0.8}
            />
          ))}
    </G>
  );
}

export function Clothes({ top, pattern, color, skin, clipId }: { top: TopStyle; pattern: Pattern; color: string; skin: string; clipId: string }) {
  const vNeck = <Path d="M50 100 L60 112 L70 100 Z" fill={skin} />;
  return (
    <G>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={BODY} />
        </ClipPath>
      </Defs>
      {top === 'hoodie' && <Path d="M32 110 C30 92 90 92 88 110 C80 102 40 102 32 110 Z" fill={color} />}
      <Path d={BODY} fill={color} />
      <PatternLayer pattern={pattern} clipId={clipId} />
      {top === 'tshirt' && vNeck}
      {top === 'collar' && (
        <G>
          {vNeck}
          <Path d="M47 100 L60 112 L51 119 Z" fill="#FFFFFF" stroke="#E3E8F2" strokeWidth={1} />
          <Path d="M73 100 L60 112 L69 119 Z" fill="#FFFFFF" stroke="#E3E8F2" strokeWidth={1} />
          <Circle cx={60} cy={124} r={1.8} fill={INK} opacity={0.5} />
          <Circle cx={60} cy={132} r={1.8} fill={INK} opacity={0.5} />
        </G>
      )}
      {top === 'cardigan' && (
        <G>
          <Path d="M52 101 L68 101 L65 140 L55 140 Z" fill="#FFFFFF" />
          <Path d="M52 101 L55 140 M68 101 L65 140" stroke={INK} strokeOpacity={0.15} strokeWidth={2} />
          <Circle cx={50} cy={118} r={2.2} fill="#FFFFFF" />
          <Circle cx={50} cy={128} r={2.2} fill="#FFFFFF" />
          <Path d="M54 101 L60 108 L66 101 Z" fill={skin} />
        </G>
      )}
      {top === 'apron' && (
        <G>
          {vNeck}
          <Path d="M44 112 L50 101 M76 112 L70 101" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
          <Path d="M40 112 L80 112 L84 140 L36 140 Z" fill="#FFFFFF" opacity={0.95} />
          <Rect x={52} y={121} width={16} height={10} rx={3} fill="none" stroke={color} strokeWidth={2} />
        </G>
      )}
      {top === 'hoodie' && (
        <G>
          <Path d="M50 101 Q60 108 70 101 Z" fill={skin} />
          <Path d="M54 104 L53 120 M66 104 L67 120" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={53} cy={121} r={1.8} fill="#FFFFFF" />
          <Circle cx={67} cy={121} r={1.8} fill="#FFFFFF" />
        </G>
      )}
    </G>
  );
}

/* ─────────── 얼굴 ─────────── */

function Brows({ style, expression }: { style: BrowStyle; expression: Expression }) {
  const w = style === 'thick' ? 4.8 : style === 'arched' ? 3.2 : 2.6;
  if (expression === 'angry')
    return (
      <G stroke={INK} strokeWidth={w + 1} strokeLinecap="round">
        <Path d="M36 48 L52 55" />
        <Path d="M84 48 L68 55" />
      </G>
    );
  if (expression === 'sad')
    return (
      <G stroke={INK} strokeWidth={w} strokeLinecap="round">
        <Path d="M38 50 L50 46" />
        <Path d="M82 50 L70 46" />
      </G>
    );
  if (expression === 'scared')
    return (
      <G stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round">
        <Path d="M38 48 Q46 42 52 46" />
        <Path d="M82 48 Q74 42 68 46" />
      </G>
    );
  if (style === 'none') return null;
  const d = style === 'arched' ? ['M39 50 Q46 42 53 49', 'M81 50 Q74 42 67 49'] : ['M40 49 Q46 46 52 49', 'M80 49 Q74 46 68 49'];
  return (
    <G stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" opacity={0.85}>
      <Path d={d[0]} />
      <Path d={d[1]} />
    </G>
  );
}

function Lashes() {
  return (
    <G stroke={INK} strokeWidth={2} strokeLinecap="round">
      <Path d={`M${L - 5} ${EY - 3} L${L - 8} ${EY - 6}`} />
      <Path d={`M${L - 2} ${EY - 5} L${L - 3} ${EY - 9}`} />
      <Path d={`M${R + 5} ${EY - 3} L${R + 8} ${EY - 6}`} />
      <Path d={`M${R + 2} ${EY - 5} L${R + 3} ${EY - 9}`} />
    </G>
  );
}

function Eyes({ style, expression }: { style: EyeStyle; expression: Expression }) {
  if (expression === 'happy')
    return (
      <G>
        <Path d="M40 62 Q46 54 52 62" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <Path d="M68 62 Q74 54 80 62" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {style === 'lashes' && <Lashes />}
      </G>
    );
  if (expression === 'scared')
    return (
      <G>
        <Circle cx={L} cy={EY} r={7} fill="#fff" stroke={INK} strokeWidth={2} />
        <Circle cx={R} cy={EY} r={7} fill="#fff" stroke={INK} strokeWidth={2} />
        <Circle cx={L} cy={EY} r={2.5} fill={INK} />
        <Circle cx={R} cy={EY} r={2.5} fill={INK} />
      </G>
    );
  const y = expression === 'angry' ? EY + 2 : EY;
  if (style === 'sleepy' && (expression === 'calm' || expression === 'neutral'))
    return (
      <G stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round">
        <Path d={`M${L - 6} ${y} Q${L} ${y + 4} ${L + 6} ${y}`} />
        <Path d={`M${R - 6} ${y} Q${R} ${y + 4} ${R + 6} ${y}`} />
      </G>
    );
  if (style === 'round')
    return (
      <G>
        {[L, R].map((x) => (
          <G key={x}>
            <Circle cx={x} cy={y} r={6.5} fill="#fff" stroke={INK} strokeWidth={1.5} />
            <Circle cx={x} cy={y + 0.5} r={3.4} fill={INK} />
            <Circle cx={x - 1.2} cy={y - 1} r={1.2} fill="#fff" />
          </G>
        ))}
      </G>
    );
  if (style === 'sparkle')
    return (
      <G>
        {[L, R].map((x) => (
          <G key={x}>
            <Circle cx={x} cy={y} r={5} fill={INK} />
            <Circle cx={x - 1.7} cy={y - 1.7} r={1.8} fill="#fff" />
            <Circle cx={x + 1.6} cy={y + 1.6} r={0.9} fill="#fff" />
          </G>
        ))}
      </G>
    );
  return (
    <G>
      <Circle cx={L} cy={y} r={4} fill={INK} />
      <Circle cx={R} cy={y} r={4} fill={INK} />
      {style === 'lashes' && <Lashes />}
    </G>
  );
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'happy':
      return <Path d="M46 74 Q60 92 74 74 Z" fill="#E4575F" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />;
    case 'calm':
      return <Path d="M50 76 Q60 84 70 76" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    case 'neutral':
      return <Path d="M50 78 L70 78" stroke={INK} strokeWidth={3} strokeLinecap="round" />;
    case 'sad':
      return (
        <G>
          <Path d="M50 82 Q60 74 70 82" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M44 66 Q41 72 44 75 Q47 72 44 66 Z" fill="#6EC3FF" />
        </G>
      );
    case 'angry':
      return <Path d="M48 84 Q60 74 72 84" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
    case 'scared':
      return (
        <G>
          <Ellipse cx={60} cy={80} rx={6} ry={7} fill="#5A2E3A" />
          <Path d="M88 38 Q84 46 88 50 Q92 46 88 38 Z" fill="#6EC3FF" />
        </G>
      );
  }
}

function Cheeks({ style, expression }: { style: CheekStyle; expression: Expression }) {
  if (expression === 'angry')
    return (
      <G fill="#FF6B6B" opacity={0.35}>
        <Ellipse cx={40} cy={72} rx={7} ry={4} />
        <Ellipse cx={80} cy={72} rx={7} ry={4} />
      </G>
    );
  if (style === 'freckles')
    return (
      <G fill="#A0652D" opacity={0.55}>
        {[
          [37, 70],
          [41, 73],
          [44, 69],
          [83, 70],
          [79, 73],
          [76, 69],
        ].map(([x, y]) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} />
        ))}
      </G>
    );
  if (style === 'none' || expression === 'neutral' || expression === 'scared') return null;
  return (
    <G fill="#FF8FA3" opacity={0.45}>
      <Ellipse cx={40} cy={72} rx={6} ry={4} />
      <Ellipse cx={80} cy={72} rx={6} ry={4} />
    </G>
  );
}

export function Face({ expression, eyes, brows, cheeks }: { expression: Expression; eyes: EyeStyle; brows: BrowStyle; cheeks: CheekStyle }) {
  return (
    <G>
      <Cheeks style={cheeks} expression={expression} />
      <Brows style={brows} expression={expression} />
      <Eyes style={eyes} expression={expression} />
      <Mouth expression={expression} />
    </G>
  );
}

/* ─────────── 꾸미기 ─────────── */

export function Glasses({ style }: { style: GlassesStyle }) {
  if (style === 'none') return null;
  if (style === 'round')
    return (
      <G stroke={INK} strokeWidth={2.5} fill="rgba(255,255,255,0.25)">
        <Circle cx={L} cy={EY} r={10} />
        <Circle cx={R} cy={EY} r={10} />
        <Path d="M56 60 L64 60" />
      </G>
    );
  if (style === 'square')
    return (
      <G stroke={INK} strokeWidth={2.5} fill="rgba(255,255,255,0.25)">
        <Rect x={35} y={52} width={22} height={17} rx={4} />
        <Rect x={63} y={52} width={22} height={17} rx={4} />
        <Path d="M57 59 L63 59" />
      </G>
    );
  return (
    <G>
      <Path d="M34 54 L58 54 L56 66 C54 70 38 70 36 66 Z" fill="#2E3A59" />
      <Path d="M62 54 L86 54 L84 66 C82 70 66 70 64 66 Z" fill="#2E3A59" />
      <Path d="M58 56 L62 56" stroke="#2E3A59" strokeWidth={2.5} />
      <Path d="M40 57 L46 57" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
    </G>
  );
}

export function HeadwearLayer({ kind }: { kind: Headwear }) {
  switch (kind) {
    case 'ribbon':
      return (
        <G fill="#FF5C8A">
          <Path d="M78 26 L66 18 L66 34 Z" />
          <Path d="M78 26 L90 18 L90 34 Z" />
          <Circle cx={78} cy={26} r={4} fill="#E0386A" />
        </G>
      );
    case 'cap':
      return (
        <G>
          <Path d="M26 44 C28 16 92 16 94 44 Z" fill="#4FB3FF" />
          <Path d="M60 44 L104 44 C104 50 96 52 84 50 L60 48 Z" fill="#2F8FE0" />
          <Circle cx={60} cy={20} r={4} fill="#2F8FE0" />
        </G>
      );
    case 'flower':
      return (
        <G>
          {[0, 72, 144, 216, 288].map((a) => {
            const r = (a * Math.PI) / 180;
            return <Circle key={a} cx={32 + Math.cos(r) * 6} cy={30 + Math.sin(r) * 6} r={5} fill="#FFB3D1" />;
          })}
          <Circle cx={32} cy={30} r={4} fill="#FFD84D" />
        </G>
      );
    case 'crown':
      return <Path d="M38 30 L42 12 L52 24 L60 8 L68 24 L78 12 L82 30 Z" fill="#FFD84D" stroke="#E6B400" strokeWidth={2} />;
    case 'headband':
      return (
        <G>
          <Path d="M27 46 C32 22 88 22 93 46" stroke="#B79CFF" strokeWidth={6} fill="none" strokeLinecap="round" />
          <Circle cx={60} cy={27} r={3} fill="#fff" opacity={0.8} />
        </G>
      );
    case 'beanie':
      return (
        <G>
          <Path d="M25 46 C24 14 96 14 95 46 Z" fill="#FF8A5B" />
          <Rect x={23} y={38} width={74} height={11} rx={5.5} fill="#E86A3A" />
          <Path d="M38 26 L38 36 M50 20 L50 36 M62 18 L62 36 M74 20 L74 36 M86 28 L86 36" stroke="#E86A3A" strokeWidth={2} opacity={0.6} />
          <Circle cx={60} cy={14} r={7} fill="#FFF3E6" />
        </G>
      );
    default:
      return null;
  }
}

export function Earrings({ halfW }: { halfW: number }) {
  return (
    <G fill="#FFD84D" stroke="#E6B400" strokeWidth={1}>
      <Circle cx={60 - (halfW - 1)} cy={73} r={3} />
      <Circle cx={60 + (halfW - 1)} cy={73} r={3} />
    </G>
  );
}
