import { palettes } from '@/theme';
import type {
  AgeGroup,
  AvatarConfig,
  BrowStyle,
  EyeStyle,
  FullAvatar,
  GlassesStyle,
  HairStyle,
  Headwear,
  Pattern,
  PersonKind,
  Profile,
  SkinTone,
  TopStyle,
} from '@/types';
import {
  type Option,
  AGES,
  BROWS,
  CAPES,
  CHEEKS,
  EARRINGS,
  EYE_COLORS,
  EYES,
  FACE_SHAPES,
  FACIAL_HAIR,
  GLASSES,
  HAIRS,
  HEADWEAR,
  MOUTHS,
  NECKWEAR,
  NOSES,
  optionIds,
  PATTERNS,
  SKINS,
  SPECIAL_HEADWEAR,
  TOPS,
} from './avatarOptions';

/** 아바타 데이터 도우미: 예전 형식 변환 · 랜덤 얼굴 · 나이 기본값. 선택지 목록은 avatarOptions 에 있다 */
export * from './avatarOptions';

const DEFAULTS: FullAvatar = {
  skin: 'light',
  age: 'adult',
  faceShape: 'round',
  eyes: 'basic',
  eyeColor: 'black',
  brows: 'straight',
  nose: 'hook',
  mouth: 'smile',
  cheeks: 'blush',
  facialHair: 'none',
  hair: 'bobBangs',
  hairColor: palettes.hairColors[1],
  top: 'apron',
  pattern: 'none',
  shirt: palettes.shirts[3],
  glasses: 'none',
  headwear: 'none',
  neckwear: 'none',
  earrings: 'none',
  cape: 'none',
  nameTag: false,
};

// ── 예전 버전 데이터 → 새 형식 ──
const LEGACY_SKIN: Record<string, SkinTone> = { fair: 'porcelain', peach: 'light', olive: 'tan', brown: 'tan' };
const LEGACY_EYES: Record<string, EyeStyle> = {};
const LEGACY_BROWS: Record<string, BrowStyle> = { none: 'thin' };
const LEGACY_HAIR: Record<string, HairStyle> = {
  short: 'dandy',
  spiky: 'twoblock',
  afro: 'shortPerm',
  curly: 'shortPerm',
  bob: 'bobBangs',
  long: 'longBangs',
  wavy: 'wave',
};
const LEGACY_TOP: Record<string, TopStyle> = { tshirt: 'sweatshirt', collar: 'shirt' };
const LEGACY_PATTERN: Record<string, Pattern> = { stars: 'star', hearts: 'dots' };
const LEGACY_GLASSES: Record<string, GlassesStyle> = { sun: 'horn' };
const LEGACY_HEADWEAR: Record<string, Headwear> = { crown: 'ribbon' };

function pickValid<T extends string>(v: unknown, valid: readonly (Option<T> | T)[], legacy: Record<string, T>, fallback: T): T {
  if (typeof v !== 'string') return fallback;
  if (optionIds(valid).includes(v)) return v as T;
  return legacy[v] ?? fallback;
}

const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);

/** 어떤 버전의 아바타 데이터든 완전한 새 형식으로 바꾼다 */
export function normalizeAvatar(a: Partial<AvatarConfig> | Record<string, unknown> | null | undefined): FullAvatar {
  const src = (a ?? {}) as Record<string, unknown>;
  const legacyAccessory = typeof src.accessory === 'string' ? src.accessory : 'none';
  // 2차 버전은 earrings 가 true/false 였다
  const earrings = src.earrings === true ? 'stud' : src.earrings;
  return {
    skin: pickValid(src.skin, SKINS, LEGACY_SKIN, DEFAULTS.skin),
    age: pickValid(src.age, AGES, {}, DEFAULTS.age),
    faceShape: pickValid(src.faceShape, FACE_SHAPES, {}, DEFAULTS.faceShape),
    eyes: pickValid(src.eyes, EYES, LEGACY_EYES, DEFAULTS.eyes),
    eyeColor: pickValid(src.eyeColor, EYE_COLORS, {}, DEFAULTS.eyeColor),
    brows: pickValid(src.brows, BROWS, LEGACY_BROWS, DEFAULTS.brows),
    nose: pickValid(src.nose, NOSES, {}, DEFAULTS.nose),
    mouth: pickValid(src.mouth, MOUTHS, {}, DEFAULTS.mouth),
    cheeks: pickValid(src.cheeks, CHEEKS, {}, DEFAULTS.cheeks),
    facialHair: pickValid(src.facialHair, FACIAL_HAIR, {}, 'none'),
    hair: pickValid(src.hair, HAIRS, LEGACY_HAIR, DEFAULTS.hair),
    hairColor: isHex(src.hairColor) ? src.hairColor : DEFAULTS.hairColor,
    top: pickValid(src.top, TOPS, LEGACY_TOP, src.top === undefined ? 'sweatshirt' : DEFAULTS.top),
    pattern: pickValid(src.pattern, PATTERNS, LEGACY_PATTERN, 'none'),
    shirt: isHex(src.shirt) ? src.shirt : DEFAULTS.shirt,
    glasses: pickValid(src.glasses ?? (legacyAccessory === 'glasses' ? 'round' : undefined), GLASSES, LEGACY_GLASSES, 'none'),
    headwear: pickValid(src.headwear ?? (legacyAccessory !== 'glasses' ? legacyAccessory : undefined), [...HEADWEAR, ...SPECIAL_HEADWEAR], LEGACY_HEADWEAR, 'none'),
    cape: pickValid(src.cape, CAPES, {}, 'none'),
    neckwear: pickValid(src.neckwear, NECKWEAR, {}, 'none'),
    earrings: pickValid(earrings, EARRINGS, {}, 'none'),
    nameTag: typeof src.nameTag === 'boolean' ? src.nameTag : false,
  };
}

/** 표정 카드처럼 얼굴을 크게 보여줄 때 머리 장식을 뺀다 */
export function withoutHeadwear(a: AvatarConfig): FullAvatar {
  return { ...normalizeAvatar(a), headwear: 'none' };
}

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const maybe = <T,>(p: number, xs: readonly Option<T>[], none: T) => (Math.random() < p ? pick(xs.slice(1)).id : none);

export function randomAvatar(age: AgeGroup = 'adult'): FullAvatar {
  const grown = age !== 'kid';
  return {
    skin: pick(SKINS.slice(0, 6)),
    age,
    faceShape: pick(FACE_SHAPES).id,
    eyes: pick(EYES).id,
    eyeColor: pick(EYE_COLORS.slice(0, 3)).id,
    brows: pick(BROWS).id,
    nose: pick(NOSES).id,
    mouth: pick(MOUTHS).id,
    cheeks: pick(CHEEKS).id,
    facialHair: grown ? maybe(0.12, FACIAL_HAIR, 'none') : 'none',
    hair: pick(HAIRS).id,
    hairColor: pick(palettes.hairColors.slice(0, 8)),
    top: pick(TOPS).id,
    pattern: Math.random() < 0.55 ? 'none' : pick(PATTERNS).id,
    shirt: pick(palettes.shirts),
    glasses: maybe(0.3, GLASSES, 'none'),
    headwear: maybe(0.45, HEADWEAR, 'none'),
    neckwear: maybe(0.3, NECKWEAR, 'none'),
    earrings: grown ? maybe(0.25, EARRINGS, 'none') : 'none',
    cape: 'none',
    nameTag: false,
  };
}

/** 사람 종류에 맞는 기본 나이대 (나이를 고르기 전의 예전 데이터용) */
export function defaultAge(kind: PersonKind | 'child'): AgeGroup {
  return kind === 'child' || kind === 'friend' ? 'kid' : 'adult';
}

/** 나이가 없는 예전 아바타에 종류별 기본 나이를 채운다 (아이·친구는 어린이) */
function withAge<T extends { avatar: AvatarConfig }>(x: T, kind: PersonKind | 'child'): T {
  return x.avatar.age ? x : { ...x, avatar: { ...x.avatar, age: defaultAge(kind) } };
}

/** 불러온 프로필의 예전 아바타에 나이를 채운다 (아이·친구 → 어린이, 선생님·어른 → 어른) */
export function withAgeDefaults(p: Profile): Profile {
  return { ...p, child: withAge(p.child, 'child'), people: p.people.map((x) => withAge(x, x.kind)) };
}
