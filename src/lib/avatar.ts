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
  { id: 'oval', label: '계란형' },
  { id: 'square', label: '각진' },
  { id: 'heart', label: '브이라인' },
  { id: 'long', label: '갸름' },
];

export const EYES: Option<EyeStyle>[] = [
  { id: 'basic', label: '기본' },
  { id: 'double', label: '쌍꺼풀' },
  { id: 'big', label: '큰 눈' },
  { id: 'narrow', label: '가는 눈' },
  { id: 'smile', label: '눈웃음' },
];

export const BROWS: Option<BrowStyle>[] = [
  { id: 'straight', label: '일자' },
  { id: 'arched', label: '둥근' },
  { id: 'thick', label: '진한' },
];

export const CHEEKS: Option<CheekStyle>[] = [
  { id: 'blush', label: '발그레' },
  { id: 'none', label: '없음' },
];

export const HAIRS: Option<HairStyle>[] = [
  { id: 'dandy', label: '댄디컷' },
  { id: 'twoblock', label: '투블럭' },
  { id: 'shortPerm', label: '뽀글 파마' },
  { id: 'bobBangs', label: '단발' },
  { id: 'bobPart', label: '가르마 단발' },
  { id: 'longBangs', label: '긴 생머리' },
  { id: 'longPart', label: '긴 가르마' },
  { id: 'wave', label: '웨이브' },
  { id: 'halfUp', label: '반묶음' },
  { id: 'ponytail', label: '포니테일' },
  { id: 'bun', label: '똥머리' },
  { id: 'pigtails', label: '양갈래' },
];

export const HAIR_COLOR_LABELS = ['흑발', '흑갈색', '짙은 갈색', '밝은 갈색', '애쉬', '와인', '회색'];

export const TOPS: Option<TopStyle>[] = [
  { id: 'apron', label: '앞치마' },
  { id: 'cardigan', label: '카디건' },
  { id: 'sweatshirt', label: '맨투맨' },
  { id: 'shirt', label: '셔츠' },
  { id: 'hoodie', label: '후드티' },
];

export const PATTERNS: Option<Pattern>[] = [
  { id: 'none', label: '민무늬' },
  { id: 'stripe', label: '줄무늬' },
  { id: 'dots', label: '도트' },
];

export const GLASSES: Option<GlassesStyle>[] = [
  { id: 'none', label: '없음' },
  { id: 'round', label: '동그란 안경' },
  { id: 'horn', label: '뿔테 안경' },
];

export const HEADWEAR: Option<Headwear>[] = [
  { id: 'none', label: '없음' },
  { id: 'headband', label: '머리띠' },
  { id: 'pin', label: '똑딱핀' },
  { id: 'scrunchie', label: '곱창밴드' },
  { id: 'ribbon', label: '리본' },
  { id: 'cap', label: '모자' },
];

const DEFAULTS: FullAvatar = {
  skin: 'light',
  faceShape: 'round',
  eyes: 'basic',
  brows: 'straight',
  cheeks: 'blush',
  hair: 'bobBangs',
  hairColor: palettes.hairColors[1],
  top: 'apron',
  pattern: 'none',
  shirt: palettes.shirts[3],
  glasses: 'none',
  headwear: 'none',
  nameTag: false,
};

// ── 예전 버전 데이터 → 새 형식 ──
const LEGACY_SKIN: Record<string, SkinTone> = { fair: 'porcelain', peach: 'light', olive: 'tan', brown: 'tan' };
const LEGACY_EYES: Record<string, EyeStyle> = { dot: 'basic', round: 'big', sparkle: 'big', lashes: 'double', sleepy: 'narrow' };
const LEGACY_BROWS: Record<string, BrowStyle> = { thin: 'straight', none: 'straight' };
const LEGACY_CHEEKS: Record<string, CheekStyle> = { freckles: 'blush' };
const LEGACY_HAIR: Record<string, HairStyle> = {
  short: 'dandy',
  spiky: 'twoblock',
  buzz: 'dandy',
  afro: 'shortPerm',
  curly: 'shortPerm',
  bob: 'bobBangs',
  long: 'longBangs',
  wavy: 'wave',
  braids: 'pigtails',
};
const LEGACY_TOP: Record<string, TopStyle> = { tshirt: 'sweatshirt', collar: 'shirt' };
const LEGACY_PATTERN: Record<string, Pattern> = { stars: 'dots', hearts: 'dots' };
const LEGACY_GLASSES: Record<string, GlassesStyle> = { square: 'horn', sun: 'horn' };
const LEGACY_HEADWEAR: Record<string, Headwear> = { flower: 'pin', crown: 'ribbon', beanie: 'cap' };

function pickValid<T extends string>(v: unknown, valid: readonly Option<T>[] | readonly T[], legacy: Record<string, T>, fallback: T): T {
  if (typeof v !== 'string') return fallback;
  const ids = (valid as readonly (Option<T> | T)[]).map((x) => (typeof x === 'string' ? x : x.id));
  if (ids.includes(v as T)) return v as T;
  return legacy[v] ?? fallback;
}

/** 어떤 버전의 아바타 데이터든 완전한 새 형식으로 바꾼다 */
export function normalizeAvatar(a: Partial<AvatarConfig> | Record<string, unknown> | null | undefined): FullAvatar {
  const src = (a ?? {}) as Record<string, unknown>;
  const legacyAccessory = typeof src.accessory === 'string' ? src.accessory : 'none';
  const hairColor = typeof src.hairColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(src.hairColor) ? src.hairColor : DEFAULTS.hairColor;
  const shirt = typeof src.shirt === 'string' && /^#[0-9a-fA-F]{6}$/.test(src.shirt) ? src.shirt : DEFAULTS.shirt;
  return {
    skin: pickValid(src.skin, SKINS, LEGACY_SKIN, DEFAULTS.skin),
    faceShape: pickValid(src.faceShape, FACE_SHAPES, {}, DEFAULTS.faceShape),
    eyes: pickValid(src.eyes, EYES, LEGACY_EYES, DEFAULTS.eyes),
    brows: pickValid(src.brows, BROWS, LEGACY_BROWS, DEFAULTS.brows),
    cheeks: pickValid(src.cheeks, CHEEKS, LEGACY_CHEEKS, DEFAULTS.cheeks),
    hair: pickValid(src.hair, HAIRS, LEGACY_HAIR, DEFAULTS.hair),
    hairColor,
    top: pickValid(src.top, TOPS, LEGACY_TOP, src.top === undefined ? 'sweatshirt' : DEFAULTS.top),
    pattern: pickValid(src.pattern, PATTERNS, LEGACY_PATTERN, 'none'),
    shirt,
    glasses: pickValid(src.glasses ?? (legacyAccessory === 'glasses' ? 'round' : undefined), GLASSES, LEGACY_GLASSES, 'none'),
    headwear: pickValid(
      src.headwear ?? (legacyAccessory !== 'glasses' ? legacyAccessory : undefined),
      HEADWEAR,
      { ...LEGACY_HEADWEAR, cap: 'cap', ribbon: 'ribbon' },
      'none',
    ),
    nameTag: typeof src.nameTag === 'boolean' ? src.nameTag : false,
  };
}

/** 표정 카드처럼 얼굴을 크게 보여줄 때 머리 장식을 뺀다 */
export function withoutHeadwear(a: AvatarConfig): FullAvatar {
  return { ...normalizeAvatar(a), headwear: 'none' };
}

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

export function randomAvatar(): FullAvatar {
  return {
    skin: pick(SKINS.slice(0, 4)),
    faceShape: pick(FACE_SHAPES).id,
    eyes: pick(EYES).id,
    brows: pick(BROWS).id,
    cheeks: Math.random() < 0.7 ? 'blush' : 'none',
    hair: pick(HAIRS).id,
    hairColor: pick(palettes.hairColors.slice(0, 5)),
    top: pick(TOPS).id,
    pattern: Math.random() < 0.6 ? 'none' : pick(PATTERNS).id,
    shirt: pick(palettes.shirts),
    glasses: Math.random() < 0.7 ? 'none' : pick(GLASSES.slice(1)).id,
    headwear: Math.random() < 0.5 ? 'none' : pick(HEADWEAR).id,
    nameTag: false,
  };
}

/** 부분만 랜덤: 공방의 각 단계에서 🎲 를 누르면 그 단계 항목만 섞는다 */
export function randomize(a: AvatarConfig, keys: (keyof FullAvatar)[]): FullAvatar {
  const r = randomAvatar();
  const out = normalizeAvatar(a);
  for (const k of keys) (out as any)[k] = r[k];
  return out;
}
