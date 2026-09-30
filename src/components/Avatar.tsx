import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { palettes } from '@/theme';
import type { AvatarConfig, Expression } from '@/types';

interface Props {
  avatar: AvatarConfig;
  expression?: Expression;
  size?: number;
  /** 원형 배경 */
  bg?: string;
}

const INK = '#2E3A59';

/** 파츠를 조합해 그리는 아바타 (선생님·친구·아이 공용) */
export function Avatar({ avatar, expression = 'calm', size = 120, bg }: Props) {
  const skin = palettes.skins[avatar.skin];
  const hair = avatar.hairColor;
  return (
    <Svg width={size} height={size * (140 / 120)} viewBox="0 0 120 140">
      {bg ? <Circle cx={60} cy={70} r={60} fill={bg} /> : null}
      <HairBack style={avatar.hair} color={hair} />
      {/* 몸 */}
      <Path d="M22 140 C22 112 38 100 60 100 C82 100 98 112 98 140 Z" fill={avatar.shirt} />
      <Path d="M50 100 L60 112 L70 100 Z" fill={skin} />
      {/* 목 */}
      <Rect x={52} y={88} width={16} height={14} rx={6} fill={skin} />
      {/* 귀 */}
      <Circle cx={27} cy={64} r={7} fill={skin} />
      <Circle cx={93} cy={64} r={7} fill={skin} />
      {/* 얼굴 */}
      <Circle cx={60} cy={60} r={34} fill={skin} />
      <HairFront style={avatar.hair} color={hair} />
      <Face expression={expression} />
      <AccessoryLayer kind={avatar.accessory} />
    </Svg>
  );
}

function HairBack({ style, color }: { style: AvatarConfig['hair']; color: string }) {
  switch (style) {
    case 'long':
      return <Path d="M24 58 C24 26 96 26 96 58 L100 112 C88 118 32 118 20 112 Z" fill={color} />;
    case 'bob':
      return <Path d="M22 60 C22 22 98 22 98 60 L98 88 C90 94 30 94 22 88 Z" fill={color} />;
    case 'bun':
      return <Circle cx={60} cy={20} r={15} fill={color} />;
    case 'pigtails':
      return (
        <G fill={color}>
          <Ellipse cx={20} cy={74} rx={10} ry={18} />
          <Ellipse cx={100} cy={74} rx={10} ry={18} />
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
    default:
      return null;
  }
}

function HairFront({ style, color }: { style: AvatarConfig['hair']; color: string }) {
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
    case 'bob':
    case 'long':
    case 'pigtails':
      return <Path d="M26 58 C26 22 94 22 94 58 C88 48 74 42 64 44 C56 36 40 42 26 58 Z" fill={color} />;
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
    default:
      return null;
  }
}

function Face({ expression }: { expression: Expression }) {
  const cheeks = (
    <G fill="#FF8FA3" opacity={0.45}>
      <Ellipse cx={40} cy={72} rx={6} ry={4} />
      <Ellipse cx={80} cy={72} rx={6} ry={4} />
    </G>
  );
  switch (expression) {
    case 'happy':
      return (
        <G>
          <Path d="M40 62 Q46 54 52 62" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M68 62 Q74 54 80 62" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Path d="M46 74 Q60 92 74 74 Z" fill="#E4575F" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          {cheeks}
        </G>
      );
    case 'calm':
      return (
        <G>
          <Circle cx={46} cy={60} r={4} fill={INK} />
          <Circle cx={74} cy={60} r={4} fill={INK} />
          <Path d="M50 76 Q60 84 70 76" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          {cheeks}
        </G>
      );
    case 'neutral':
      return (
        <G>
          <Circle cx={46} cy={60} r={4} fill={INK} />
          <Circle cx={74} cy={60} r={4} fill={INK} />
          <Path d="M50 78 L70 78" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    case 'sad':
      return (
        <G>
          <Path d="M38 50 L50 46" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <Path d="M82 50 L70 46" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={46} cy={60} r={4} fill={INK} />
          <Circle cx={74} cy={60} r={4} fill={INK} />
          <Path d="M50 82 Q60 74 70 82" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M44 66 Q41 72 44 75 Q47 72 44 66 Z" fill="#6EC3FF" />
        </G>
      );
    case 'angry':
      return (
        <G>
          <Path d="M36 48 L52 55" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Path d="M84 48 L68 55" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={46} cy={62} r={4} fill={INK} />
          <Circle cx={74} cy={62} r={4} fill={INK} />
          <Path d="M48 84 Q60 74 72 84" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <G fill="#FF6B6B" opacity={0.35}>
            <Ellipse cx={40} cy={72} rx={7} ry={4} />
            <Ellipse cx={80} cy={72} rx={7} ry={4} />
          </G>
        </G>
      );
    case 'scared':
      return (
        <G>
          <Path d="M38 48 Q46 42 52 46" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M82 48 Q74 42 68 46" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx={46} cy={60} r={7} fill="#fff" stroke={INK} strokeWidth={2} />
          <Circle cx={74} cy={60} r={7} fill="#fff" stroke={INK} strokeWidth={2} />
          <Circle cx={46} cy={60} r={2.5} fill={INK} />
          <Circle cx={74} cy={60} r={2.5} fill={INK} />
          <Ellipse cx={60} cy={80} rx={6} ry={7} fill="#5A2E3A" />
          <Path d="M88 38 Q84 46 88 50 Q92 46 88 38 Z" fill="#6EC3FF" />
        </G>
      );
  }
}

function AccessoryLayer({ kind }: { kind: AvatarConfig['accessory'] }) {
  switch (kind) {
    case 'glasses':
      return (
        <G stroke={INK} strokeWidth={2.5} fill="rgba(255,255,255,0.25)">
          <Circle cx={46} cy={60} r={10} />
          <Circle cx={74} cy={60} r={10} />
          <Path d="M56 60 L64 60" />
        </G>
      );
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
      return (
        <Path d="M38 30 L42 12 L52 24 L60 8 L68 24 L78 12 L82 30 Z" fill="#FFD84D" stroke="#E6B400" strokeWidth={2} />
      );
    default:
      return null;
  }
}
