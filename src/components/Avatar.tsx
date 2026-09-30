import { useId } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

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
  Wrinkles,
} from './avatar/parts';

/**
 * 나이대별 비율: 어린이는 몸을 작게, 머리를 조금 크게 그려 한눈에 아이로 보이게 한다.
 * (몸은 아래 가운데(60,140) 기준, 머리는 얼굴 가운데 기준으로 늘리고 줄인다)
 */
const KID_BODY = 'translate(60 140) scale(0.8 0.8) translate(-60 -140)';
const KID_HEAD = 'translate(0 9) translate(60 60) scale(1.04) translate(-60 -60)';

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
  const kid = a.age === 'kid';
  return (
    <Svg width={size} height={size * (140 / 120)} viewBox="0 0 120 140">
      {bg ? <Circle cx={60} cy={70} r={60} fill={bg} /> : null}
      <G transform={kid ? KID_HEAD : undefined}>
        <HairBack style={a.hair} color={a.hairColor} />
      </G>
      <G transform={kid ? KID_BODY : undefined}>
        <Clothes top={a.top} pattern={a.pattern} color={a.shirt} skin={skin} clipId={clipId} nameTag={a.nameTag} />
        {/* 목 */}
        <Path d="M53 88 L53 104 Q60 108 67 104 L67 88 Z" fill={skin} stroke={OL} strokeWidth={2} strokeLinejoin="round" />
        <NeckLayer top={a.top} color={a.shirt} neckwear={a.neckwear} />
      </G>
      <G transform={kid ? KID_HEAD : undefined}>
        <Ears halfW={halfW} skin={skin} />
        <Head shape={a.faceShape} skin={skin} />
        <EarringsLayer kind={a.earrings} halfW={halfW} />
        {a.age === 'senior' && <Wrinkles skin={skin} />}
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
      </G>
    </Svg>
  );
}
