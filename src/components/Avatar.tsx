import { useId } from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';

import { normalizeAvatar } from '@/lib/avatar';
import { palettes } from '@/theme';
import type { AvatarConfig, Expression } from '@/types';
import { Clothes, Earrings, Face, Glasses, HairBack, HairFront, Head, headGeometry, HeadwearLayer } from './avatar/parts';

interface Props {
  avatar: AvatarConfig;
  expression?: Expression;
  size?: number;
  /** 원형 배경 */
  bg?: string;
}

/** 파츠를 조합해 그리는 아바타 (선생님·친구·아이 공용). 예전 데이터도 normalizeAvatar 로 그린다. */
export function Avatar({ avatar, expression = 'calm', size = 120, bg }: Props) {
  const a = normalizeAvatar(avatar);
  const skin = palettes.skins[a.skin];
  const clipId = `body${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { halfW } = headGeometry(a.faceShape);
  return (
    <Svg width={size} height={size * (140 / 120)} viewBox="0 0 120 140">
      {bg ? <Circle cx={60} cy={70} r={60} fill={bg} /> : null}
      <HairBack style={a.hair} color={a.hairColor} />
      <Clothes top={a.top} pattern={a.pattern} color={a.shirt} skin={skin} clipId={clipId} />
      {/* 목 */}
      <Rect x={52} y={88} width={16} height={14} rx={6} fill={skin} />
      {/* 귀 */}
      <Circle cx={60 - (halfW - 1)} cy={64} r={7} fill={skin} />
      <Circle cx={60 + (halfW - 1)} cy={64} r={7} fill={skin} />
      <Head shape={a.faceShape} skin={skin} />
      <HairFront style={a.hair} color={a.hairColor} />
      <Face expression={expression} eyes={a.eyes} brows={a.brows} cheeks={a.cheeks} />
      <Glasses style={a.glasses} />
      {a.earrings && <Earrings halfW={halfW} />}
      <HeadwearLayer kind={a.headwear} />
    </Svg>
  );
}
