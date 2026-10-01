/** 아바타 꾸미기 선택지 목록 (얼굴·머리·옷·장식·나이) */
import { palettes } from '@/theme';
import type {
  AgeGroup,
  BrowStyle,
  Cape,
  CheekStyle,
  Earrings,
  EyeColor,
  EyeStyle,
  FaceShape,
  FacialHair,
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

/** 별 상점에서 여는 특별 머리 장식 (일반 꾸미기 목록에는 안 보인다) */
export const SPECIAL_HEADWEAR: Option<Headwear>[] = [
  { id: 'kingCrown', label: '왕관' },
  { id: 'wizard', label: '마법사 모자' },
  { id: 'tiara', label: '티아라' },
  { id: 'dinoHood', label: '공룡 후드' },
  { id: 'spaceHelmet', label: '우주 헬멧' },
  { id: 'bunnyEars', label: '토끼 귀' },
];

export const CAPES: Option<Cape>[] = [
  { id: 'none', label: '없음' },
  { id: 'hero', label: '영웅 망토' },
  { id: 'star', label: '별 망토' },
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

export function optionIds<T extends string>(xs: readonly (Option<T> | T)[]): string[] {
  return xs.map((x) => (typeof x === 'string' ? x : x.id));
}

/** 모든 옵션 목록 (테스트·미리보기용) */
export const ALL_OPTIONS = {
  skin: SKINS,
  age: optionIds(AGES),
  faceShape: optionIds(FACE_SHAPES),
  eyes: optionIds(EYES),
  eyeColor: optionIds(EYE_COLORS),
  brows: optionIds(BROWS),
  nose: optionIds(NOSES),
  mouth: optionIds(MOUTHS),
  cheeks: optionIds(CHEEKS),
  facialHair: optionIds(FACIAL_HAIR),
  hair: optionIds(HAIRS),
  top: optionIds(TOPS),
  pattern: optionIds(PATTERNS),
  glasses: optionIds(GLASSES),
  headwear: optionIds([...HEADWEAR, ...SPECIAL_HEADWEAR]),
  cape: optionIds(CAPES),
  neckwear: optionIds(NECKWEAR),
  earrings: optionIds(EARRINGS),
} as const;
