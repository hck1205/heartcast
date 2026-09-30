import { palettes } from '@/theme';
import type {
  AvatarConfig,
  BrowStyle,
  CheekStyle,
  EyeStyle,
  FaceShape,
  FullAvatar,
  GlassesStyle,
  HairStyle,
  Headwear,
  Pattern,
  SkinTone,
  TopStyle,
} from '@/types';

export interface Option<T> {
  id: T;
  label: string;
}

export const SKINS = Object.keys(palettes.skins) as SkinTone[];

export const FACE_SHAPES: Option<FaceShape>[] = [
  { id: 'round', label: '동글' },
  { id: 'oval', label: '달걀' },
  { id: 'square', label: '네모' },
  { id: 'heart', label: '하트' },
  { id: 'long', label: '갸름' },
];

export const EYES: Option<EyeStyle>[] = [
  { id: 'dot', label: '콩알 눈' },
  { id: 'round', label: '초롱초롱' },
  { id: 'sparkle', label: '반짝 눈' },
  { id: 'lashes', label: '속눈썹' },
  { id: 'sleepy', label: '졸린 눈' },
];

export const BROWS: Option<BrowStyle>[] = [
  { id: 'thin', label: '얇은' },
  { id: 'thick', label: '두꺼운' },
  { id: 'arched', label: '둥근' },
  { id: 'none', label: '없음' },
];

export const CHEEKS: Option<CheekStyle>[] = [
  { id: 'blush', label: '발그레' },
  { id: 'freckles', label: '주근깨' },
  { id: 'none', label: '없음' },
];

export const HAIRS: Option<HairStyle>[] = [
  { id: 'short', label: '짧은 머리' },
  { id: 'spiky', label: '삐죽 머리' },
  { id: 'buzz', label: '까까 머리' },
  { id: 'bob', label: '단발' },
  { id: 'long', label: '긴 생머리' },
  { id: 'wavy', label: '웨이브' },
  { id: 'ponytail', label: '포니테일' },
  { id: 'pigtails', label: '양갈래' },
  { id: 'braids', label: '땋은 머리' },
  { id: 'bun', label: '똥머리' },
  { id: 'curly', label: '곱슬' },
  { id: 'afro', label: '뽀글뽀글' },
];

export const TOPS: Option<TopStyle>[] = [
  { id: 'tshirt', label: '티셔츠' },
  { id: 'apron', label: '앞치마' },
  { id: 'cardigan', label: '가디건' },
  { id: 'hoodie', label: '후드티' },
  { id: 'collar', label: '셔츠' },
];

export const PATTERNS: Option<Pattern>[] = [
  { id: 'none', label: '민무늬' },
  { id: 'stripe', label: '줄무늬' },
  { id: 'dots', label: '물방울' },
  { id: 'stars', label: '별' },
  { id: 'hearts', label: '하트' },
];

export const GLASSES: Option<GlassesStyle>[] = [
  { id: 'none', label: '없음' },
  { id: 'round', label: '동그란' },
  { id: 'square', label: '네모난' },
  { id: 'sun', label: '선글라스' },
];

export const HEADWEAR: Option<Headwear>[] = [
  { id: 'none', label: '없음' },
  { id: 'ribbon', label: '리본' },
  { id: 'flower', label: '꽃핀' },
  { id: 'headband', label: '머리띠' },
  { id: 'cap', label: '모자' },
  { id: 'beanie', label: '털모자' },
  { id: 'crown', label: '왕관' },
];

const DEFAULTS: FullAvatar = {
  skin: 'peach',
  faceShape: 'round',
  eyes: 'dot',
  brows: 'thin',
  cheeks: 'blush',
  hair: 'short',
  hairColor: '#3B2A20',
  top: 'tshirt',
  pattern: 'none',
  shirt: '#FF8A5B',
  glasses: 'none',
  headwear: 'none',
  earrings: false,
};

/** 예전 버전(accessory 하나) 데이터나 빠진 항목을 채워 완전한 아바타로 만든다 */
export function normalizeAvatar(a: Partial<AvatarConfig> | null | undefined): FullAvatar {
  const src = a ?? {};
  const out: FullAvatar = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS) as (keyof FullAvatar)[]) {
    const v = src[k];
    if (v !== undefined && v !== null) (out as any)[k] = v;
  }
  if (!(src.skin && src.skin in palettes.skins)) out.skin = DEFAULTS.skin;
  if (src.accessory && src.accessory !== 'none') {
    if (src.accessory === 'glasses') {
      if (!src.glasses) out.glasses = 'round';
    } else if (!src.headwear) {
      out.headwear = src.accessory;
    }
  }
  return out;
}

/** 표정 카드처럼 얼굴을 크게 보여줄 때 머리 장식을 뺀다 */
export function withoutHeadwear(a: AvatarConfig): FullAvatar {
  return { ...normalizeAvatar(a), headwear: 'none' };
}

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

export function randomAvatar(): FullAvatar {
  return {
    skin: pick(SKINS),
    faceShape: pick(FACE_SHAPES).id,
    eyes: pick(EYES).id,
    brows: pick(BROWS.slice(0, 3)).id,
    cheeks: pick(CHEEKS).id,
    hair: pick(HAIRS).id,
    hairColor: pick(palettes.hairColors.slice(0, 7)),
    top: pick(TOPS).id,
    pattern: Math.random() < 0.5 ? 'none' : pick(PATTERNS).id,
    shirt: pick(palettes.shirts),
    glasses: Math.random() < 0.6 ? 'none' : pick(GLASSES.slice(1, 3)).id,
    headwear: Math.random() < 0.5 ? 'none' : pick(HEADWEAR).id,
    earrings: Math.random() < 0.3,
  };
}

/** 부분만 랜덤: 공방의 각 단계에서 🎲 를 누르면 그 단계 항목만 섞는다 */
export function randomize(a: AvatarConfig, keys: (keyof FullAvatar)[]): FullAvatar {
  const r = randomAvatar();
  const out = normalizeAvatar(a);
  for (const k of keys) (out as any)[k] = r[k];
  return out;
}
