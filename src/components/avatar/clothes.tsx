/** 일상툰 아바타 파츠: 옷 · 무늬 · 이름표 · 목 장식 */
import { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Neckwear, Pattern, TopStyle } from '@/types';
import { OL, shade, SW } from './shared';

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
