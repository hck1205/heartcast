/** 일상툰 아바타 파츠: 안경 · 머리 장식 · 귀걸이 */
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Earrings, GlassesStyle, HairStyle, Headwear } from '@/types';
import { EY, L, OL, R, shade, SW } from './shared';

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
    case 'kingCrown':
      return (
        <G stroke={OL} strokeWidth={1.6} strokeLinejoin="round">
          <Path d="M36 24 L40 6 L50 17 L60 2 L70 17 L80 6 L84 24 Z" fill="#FFD23F" />
          <Rect x={35} y={21} width={50} height={6} rx={2} fill="#F5B83D" />
          <Circle cx={60} cy={14} r={3} fill="#E5484D" />
          <Circle cx={45} cy={17} r={2.2} fill="#4F8EF7" />
          <Circle cx={75} cy={17} r={2.2} fill="#5BBF8A" />
        </G>
      );
    case 'wizard':
      return (
        <G stroke={OL} strokeWidth={1.6} strokeLinejoin="round">
          <Path d="M28 32 C42 26 80 26 92 32 L66 0 Z" fill="#7B5CD6" />
          <Ellipse cx={60} cy={32} rx={40} ry={6} fill="#5E43B5" />
          <Path d="M58 16 l2 -4 l2 4 l4 1 l-4 2 l-2 4 l-2 -4 l-4 -2 Z" fill="#FFE27A" strokeWidth={0.8} />
          <Circle cx={72} cy={22} r={1.8} fill="#FFE27A" strokeWidth={0.6} />
        </G>
      );
    case 'tiara':
      return (
        <G stroke={OL} strokeWidth={1.2} strokeLinejoin="round">
          <Path d="M34 26 Q60 12 86 26" stroke="#C9CED6" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M50 18 L54 8 L58 16 L60 4 L62 16 L66 8 L70 18" fill="#E8ECF2" />
          <Circle cx={60} cy={13} r={3} fill="#FF8FB1" />
        </G>
      );
    case 'dinoHood':
      return (
        <G stroke={OL} strokeWidth={SW} strokeLinejoin="round">
          {[
            [38, 20],
            [50, 13],
            [63, 11],
            [76, 14],
          ].map(([x, y]) => (
            <Path key={x} d={`M${x - 6} ${y + 6} L${x} ${y - 6} L${x + 6} ${y + 6} Z`} fill="#FFB547" />
          ))}
          <Path d="M23 46 C21 12 99 12 97 46 Z" fill="#7BD389" />
          <Path d="M23 46 Q60 38 97 46" stroke="#5BBF8A" strokeWidth={4} fill="none" />
        </G>
      );
    case 'spaceHelmet':
      return (
        <G>
          <Circle cx={60} cy={54} r={47} fill="rgba(190, 225, 255, 0.22)" stroke="#9FB7D6" strokeWidth={5} />
          <Path d="M30 34 Q40 18 58 14" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
          <Rect x={50} y={98} width={20} height={6} rx={3} fill="#9FB7D6" stroke={OL} strokeWidth={1.2} />
        </G>
      );
    case 'bunnyEars':
      return (
        <G stroke={OL} strokeWidth={1.6}>
          <Ellipse cx={44} cy={12} rx={7} ry={17} fill="#FFFFFF" transform="rotate(-14 44 12)" />
          <Ellipse cx={44} cy={13} rx={3.4} ry={11} fill="#FFC7D9" stroke="none" transform="rotate(-14 44 13)" />
          <Ellipse cx={76} cy={12} rx={7} ry={17} fill="#FFFFFF" transform="rotate(14 76 12)" />
          <Ellipse cx={76} cy={13} rx={3.4} ry={11} fill="#FFC7D9" stroke="none" transform="rotate(14 76 13)" />
          <Path d="M30 30 C40 18 80 18 90 30" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />
        </G>
      );
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
