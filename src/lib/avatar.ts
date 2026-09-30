import { palettes } from '@/theme';
import type {
  AgeGroup,
  PersonKind,
  Profile,
  AvatarConfig,
  BrowStyle,
  CheekStyle,
  Earrings,
  EyeColor,
  EyeStyle,
  FaceShape,
  FacialHair,
  FullAvatar,
  GlassesStyle,
  HairStyle,
  Headwear,
  MouthStyle,
  Neckwear,
  NoseStyle,
  Pattern,
  SkinTone,
  TopStyle,
} from '@/types';

export interface Option<T> {
  id: T;
  label: string;
}

export const SKINS = Object.keys(palettes.skins) as SkinTone[];

export const AGES: Option<AgeGroup>[] = [
  { id: 'kid', label: '어린이' },
  { id: 'adult', label: '어른' },
  { id: 'senior', label: '할머니·할아버지' },
];

export const FACE_SHAPES: Option<FaceShape>[] = [
  { id: 'round', label: '동글' },
  { id: 'oval', label: '계란형' },
  { id: 'square', label: '각진' },
  { id: 'heart', label: '브이라인' },
  { id: 'long', label: '갸름' },
  { id: 'chubby', label: '볼살' },
  { id: 'diamond', label: '마름모' },
  { id: 'pear', label: '턱 넓은' },
  { id: 'baby', label: '아기 얼굴' },
];

export const EYES: Option<EyeStyle>[] = [
  { id: 'basic', label: '기본' },
  { id: 'double', label: '쌍꺼풀' },
  { id: 'big', label: '큰 눈' },
  { id: 'round', label: '동글 눈' },
  { id: 'sparkle', label: '반짝 눈' },
  { id: 'lashes', label: '긴 속눈썹' },
  { id: 'narrow', label: '가는 눈' },
  { id: 'droopy', label: '처진 눈' },
  { id: 'cat', label: '고양이 눈' },
  { id: 'smile', label: '눈웃음' },
  { id: 'sleepy', label: '졸린 눈' },
  { id: 'dot', label: '점 눈' },
];

export const EYE_COLORS: Option<EyeColor>[] = [
  { id: 'black', label: '검정' },
  { id: 'brown', label: '갈색' },
  { id: 'hazel', label: '밝은 갈색' },
  { id: 'gray', label: '회갈색' },
];

export const BROWS: Option<BrowStyle>[] = [
  { id: 'straight', label: '일자' },
  { id: 'arched', label: '둥근' },
  { id: 'thick', label: '진한' },
  { id: 'thin', label: '얇은' },
  { id: 'short', label: '짧은' },
  { id: 'angled', label: '각진' },
  { id: 'droopy', label: '처진' },
];

export const NOSES: Option<NoseStyle>[] = [
  { id: 'hook', label: '기본 코' },
  { id: 'dot', label: '점 코' },
  { id: 'round', label: '동그란 코' },
  { id: 'tall', label: '오똑한 코' },
  { id: 'tiny', label: '작은 코' },
];

export const MOUTHS: Option<MouthStyle>[] = [
  { id: 'smile', label: '미소' },
  { id: 'small', label: '작은 입' },
  { id: 'lips', label: '도톰한 입술' },
  { id: 'teeth', label: '앞니' },
  { id: 'cat', label: '고양이 입' },
  { id: 'flat', label: '일자 입' },
];

export const CHEEKS: Option<CheekStyle>[] = [
  { id: 'blush', label: '발그레' },
  { id: 'lines', label: '볼터치' },
  { id: 'freckles', label: '주근깨' },
  { id: 'mole', label: '점' },
  { id: 'none', label: '없음' },
];

export const FACIAL_HAIR: Option<FacialHair>[] = [
  { id: 'none', label: '없음' },
  { id: 'mustache', label: '콧수염' },
  { id: 'beard', label: '턱수염' },
  { id: 'stubble', label: '짧은 수염' },
];

export type HairGroup = '짧은 머리' | '단발' | '긴 머리' | '묶은 머리';
export const HAIRS: (Option<HairStyle> & { group: HairGroup })[] = [
  { id: 'dandy', label: '댄디컷', group: '짧은 머리' },
  { id: 'twoblock', label: '투블럭', group: '짧은 머리' },
  { id: 'gail', label: '가일컷', group: '짧은 머리' },
  { id: 'slick', label: '올백', group: '짧은 머리' },
  { id: 'comma', label: '쉼표머리', group: '짧은 머리' },
  { id: 'buzz', label: '까까머리', group: '짧은 머리' },
  { id: 'shortPerm', label: '뽀글 파마', group: '짧은 머리' },
  { id: 'pixie', label: '숏컷', group: '짧은 머리' },
  { id: 'bobBangs', label: '단발', group: '단발' },
  { id: 'bobPart', label: '가르마 단발', group: '단발' },
  { id: 'blunt', label: '똑단발', group: '단발' },
  { id: 'hush', label: '허쉬컷', group: '단발' },
  { id: 'longBangs', label: '긴 생머리', group: '긴 머리' },
  { id: 'longPart', label: '긴 가르마', group: '긴 머리' },
  { id: 'wave', label: '웨이브', group: '긴 머리' },
  { id: 'hippie', label: '히피펌', group: '긴 머리' },
  { id: 'halfUp', label: '반묶음', group: '묶은 머리' },
  { id: 'ponytail', label: '포니테일', group: '묶은 머리' },
  { id: 'lowPony', label: '로우 포니', group: '묶은 머리' },
  { id: 'bun', label: '똥머리', group: '묶은 머리' },
  { id: 'doubleBun', label: '만두머리', group: '묶은 머리' },
  { id: 'pigtails', label: '양갈래', group: '묶은 머리' },
  { id: 'braids', label: '땋은 양갈래', group: '묶은 머리' },
  { id: 'sideBraid', label: '한쪽 땋기', group: '묶은 머리' },
];
export const HAIR_GROUPS: HairGroup[] = ['짧은 머리', '단발', '긴 머리', '묶은 머리'];

export const HAIR_COLOR_LABELS = ['흑발', '흑갈색', '짙은 갈색', '밝은 갈색', '애쉬', '와인', '회색', '오렌지', '금발', '핑크', '블루블랙', '흰머리'];

export const TOPS: Option<TopStyle>[] = [
  { id: 'apron', label: '앞치마' },
  { id: 'cardigan', label: '카디건' },
  { id: 'sweatshirt', label: '맨투맨' },
  { id: 'shirt', label: '셔츠' },
  { id: 'hoodie', label: '후드티' },
  { id: 'vest', label: '조끼' },
  { id: 'dress', label: '원피스' },
  { id: 'turtleneck', label: '목폴라' },
  { id: 'track', label: '체육복' },
  { id: 'overalls', label: '멜빵' },
];

export const PATTERNS: Option<Pattern>[] = [
  { id: 'none', label: '민무늬' },
  { id: 'stripe', label: '줄무늬' },
  { id: 'dots', label: '도트' },
  { id: 'check', label: '체크' },
  { id: 'flower', label: '꽃무늬' },
  { id: 'star', label: '별무늬' },
];

export const GLASSES: Option<GlassesStyle>[] = [
  { id: 'none', label: '없음' },
  { id: 'round', label: '동그란' },
  { id: 'horn', label: '뿔테' },
  { id: 'square', label: '사각 얇은테' },
  { id: 'half', label: '반무테' },
  { id: 'gold', label: '금테' },
];

export const HEADWEAR: Option<Headwear>[] = [
  { id: 'none', label: '없음' },
  { id: 'headband', label: '머리띠' },
  { id: 'wideband', label: '헤어밴드' },
  { id: 'pin', label: '똑딱핀' },
  { id: 'claw', label: '집게핀' },
  { id: 'flower', label: '꽃핀' },
  { id: 'scrunchie', label: '곱창밴드' },
  { id: 'ribbon', label: '리본' },
  { id: 'bigBow', label: '큰 리본' },
  { id: 'cap', label: '모자' },
  { id: 'beanie', label: '비니' },
  { id: 'bucket', label: '버킷햇' },
];

export const NECKWEAR: Option<Neckwear>[] = [
  { id: 'none', label: '없음' },
  { id: 'necklace', label: '목걸이' },
  { id: 'scarf', label: '스카프' },
  { id: 'tie', label: '넥타이' },
  { id: 'bowtie', label: '나비넥타이' },
  { id: 'whistle', label: '호루라기' },
  { id: 'lanyard', label: '목걸이 명찰' },
];

export const EARRINGS: Option<Earrings>[] = [
  { id: 'none', label: '없음' },
  { id: 'stud', label: '작은 귀걸이' },
  { id: 'hoop', label: '링' },
  { id: 'drop', label: '드롭' },
];

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

function ids<T extends string>(xs: readonly (Option<T> | T)[]): string[] {
  return xs.map((x) => (typeof x === 'string' ? x : x.id));
}

function pickValid<T extends string>(v: unknown, valid: readonly (Option<T> | T)[], legacy: Record<string, T>, fallback: T): T {
  if (typeof v !== 'string') return fallback;
  if (ids(valid).includes(v)) return v as T;
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
    headwear: pickValid(src.headwear ?? (legacyAccessory !== 'glasses' ? legacyAccessory : undefined), HEADWEAR, LEGACY_HEADWEAR, 'none'),
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
    nameTag: false,
  };
}

/** 부분만 랜덤: 공방의 각 단계에서 🎲 를 누르면 그 단계 항목만 섞는다 */
export function randomize(a: AvatarConfig, keys: (keyof FullAvatar)[]): FullAvatar {
  const out = normalizeAvatar(a);
  const r = randomAvatar(out.age);
  for (const k of keys) (out as any)[k] = r[k];
  return out;
}

/** 모든 옵션 목록 (테스트·미리보기용) */
export const ALL_OPTIONS = {
  skin: SKINS,
  age: ids(AGES),
  faceShape: ids(FACE_SHAPES),
  eyes: ids(EYES),
  eyeColor: ids(EYE_COLORS),
  brows: ids(BROWS),
  nose: ids(NOSES),
  mouth: ids(MOUTHS),
  cheeks: ids(CHEEKS),
  facialHair: ids(FACIAL_HAIR),
  hair: ids(HAIRS),
  top: ids(TOPS),
  pattern: ids(PATTERNS),
  glasses: ids(GLASSES),
  headwear: ids(HEADWEAR),
  neckwear: ids(NECKWEAR),
  earrings: ids(EARRINGS),
} as const;

/** 사람 종류에 맞는 기본 나이대 (나이를 고르기 전의 예전 데이터용) */
export function defaultAge(kind: PersonKind | 'child'): AgeGroup {
  return kind === 'child' || kind === 'friend' ? 'kid' : 'adult';
}

/** 나이가 없는 예전 아바타에 종류별 기본 나이를 채운다 (아이·친구는 어린이) */
export function withAge<T extends { avatar: AvatarConfig }>(x: T, kind: PersonKind | 'child'): T {
  return x.avatar.age ? x : { ...x, avatar: { ...x.avatar, age: defaultAge(kind) } };
}

/** 불러온 프로필의 예전 아바타에 나이를 채운다 (아이·친구 → 어린이, 선생님·어른 → 어른) */
export function withAgeDefaults(p: Profile): Profile {
  return { ...p, child: withAge(p.child, 'child'), people: p.people.map((x) => withAge(x, x.kind)) };
}
