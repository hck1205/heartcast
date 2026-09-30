import { useId } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { normalizeAvatar } from '@/lib/avatar';
import { palettes } from '@/theme';
import type { AvatarConfig, Expression } from '@/types';
import {
  Clothes,
  Ears,
  EarringsLayer,
  EmotionMarks,
  Face,
  FacialHairLayer,
  Glasses,
  HairBack,
  HairFront,
  Head,
  headGeometry,
  HeadwearLayer,
  NeckLayer,
  OL,
} from './avatar/parts';

interface Props {
  avatar: AvatarConfig;
  expression?: Expression;
  size?: number;
  /** 원형 배경 */
  bg?: string;
}

/** 일상툰 스타일 아바타 (선생님·친구·아이 공용). 예전 데이터도 normalizeAvatar 로 그린다. */
export function Avatar({ avatar, expression = 'calm', size = 120, bg }: Props) {
  const a = normalizeAvatar(avatar);
  const skin = palettes.skins[a.skin];
  const clipId = `body${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { halfW } = headGeometry(a.faceShape);
  return (
    <Svg width={size} height={size * (140 / 120)} viewBox="0 0 120 140">
      {bg ? <Circle cx={60} cy={70} r={60} fill={bg} /> : null}
      <HairBack style={a.hair} color={a.hairColor} />
      <Clothes top={a.top} pattern={a.pattern} color={a.shirt} skin={skin} clipId={clipId} nameTag={a.nameTag} />
      {/* 목 */}
      <Path d="M53 88 L53 104 Q60 108 67 104 L67 88 Z" fill={skin} stroke={OL} strokeWidth={2} strokeLinejoin="round" />
      <NeckLayer top={a.top} color={a.shirt} neckwear={a.neckwear} />
      <Ears halfW={halfW} skin={skin} />
      <Head shape={a.faceShape} skin={skin} />
      <EarringsLayer kind={a.earrings} halfW={halfW} />
      <Face
        expression={expression}
        eyes={a.eyes}
        eyeColor={a.eyeColor}
        brows={a.brows}
        nose={a.nose}
        mouth={a.mouth}
        cheeks={a.cheeks}
        hairColor={a.hairColor}
      />
      <FacialHairLayer kind={a.facialHair} color={a.hairColor} />
      <HairFront style={a.hair} color={a.hairColor} />
      <Glasses style={a.glasses} />
      <HeadwearLayer kind={a.headwear} hair={a.hair} />
      <EmotionMarks expression={expression} />
    </Svg>
  );
}
