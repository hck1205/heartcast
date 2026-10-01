// 마음날씨 공용 타입

export type SkinTone = 'snow' | 'porcelain' | 'light' | 'warm' | 'medium' | 'tan' | 'deep' | 'cocoa';
export type FaceShape = 'round' | 'oval' | 'square' | 'heart' | 'long' | 'chubby' | 'diamond' | 'pear' | 'baby';
export type EyeStyle =
  | 'basic'
  | 'double'
  | 'smile'
  | 'narrow'
  | 'big'
  | 'droopy'
  | 'cat'
  | 'sparkle'
  | 'sleepy'
  | 'round'
  | 'lashes'
  | 'dot';
export type EyeColor = 'black' | 'brown' | 'hazel' | 'gray';
export type BrowStyle = 'straight' | 'arched' | 'thick' | 'thin' | 'short' | 'angled' | 'droopy';
export type NoseStyle = 'hook' | 'dot' | 'round' | 'tall' | 'tiny';
export type MouthStyle = 'smile' | 'small' | 'lips' | 'teeth' | 'cat' | 'flat';
export type CheekStyle = 'blush' | 'lines' | 'freckles' | 'mole' | 'none';
export type FacialHair = 'none' | 'mustache' | 'beard' | 'stubble';
/** 한국에서 흔한 머리 모양 (일상툰 스타일) */
export type HairStyle =
  // 짧은 머리
  | 'dandy'
  | 'twoblock'
  | 'gail'
  | 'slick'
  | 'comma'
  | 'buzz'
  | 'shortPerm'
  | 'pixie'
  // 단발
  | 'bobBangs'
  | 'bobPart'
  | 'blunt'
  | 'hush'
  // 긴 머리
  | 'longBangs'
  | 'longPart'
  | 'wave'
  | 'hippie'
  // 묶은 머리
  | 'halfUp'
  | 'ponytail'
  | 'lowPony'
  | 'bun'
  | 'doubleBun'
  | 'pigtails'
  | 'braids'
  | 'sideBraid';
export type TopStyle =
  | 'apron'
  | 'cardigan'
  | 'sweatshirt'
  | 'shirt'
  | 'hoodie'
  | 'vest'
  | 'dress'
  | 'turtleneck'
  | 'track'
  | 'overalls';
export type Pattern = 'none' | 'stripe' | 'dots' | 'check' | 'flower' | 'star';
export type GlassesStyle = 'none' | 'round' | 'horn' | 'square' | 'half' | 'gold';
export type Headwear =
  | 'none'
  | 'headband'
  | 'pin'
  | 'scrunchie'
  | 'ribbon'
  | 'cap'
  | 'flower'
  | 'beanie'
  | 'bucket'
  | 'claw'
  | 'wideband'
  | 'bigBow';
export type Neckwear = 'none' | 'necklace' | 'scarf' | 'tie' | 'bowtie' | 'whistle' | 'lanyard';
export type Earrings = 'none' | 'stud' | 'hoop' | 'drop';
/** 나이대: 아이는 머리가 크고 몸이 작게, 할머니·할아버지는 주름을 그린다 */
export type AgeGroup = 'kid' | 'adult' | 'senior';
export type Expression = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry' | 'scared';

/**
 * 아바타 파츠. 예전 버전 데이터(accessory 하나짜리, 1차 공방 형식)는
 * normalizeAvatar 가 새 형식으로 바꿔 준다.
 */
export interface AvatarConfig {
  skin: SkinTone;
  age?: AgeGroup;
  faceShape?: FaceShape;
  eyes?: EyeStyle;
  eyeColor?: EyeColor;
  brows?: BrowStyle;
  nose?: NoseStyle;
  mouth?: MouthStyle;
  cheeks?: CheekStyle;
  facialHair?: FacialHair;
  hair: HairStyle;
  hairColor: string;
  top?: TopStyle;
  pattern?: Pattern;
  shirt: string;
  glasses?: GlassesStyle;
  headwear?: Headwear;
  neckwear?: Neckwear;
  earrings?: Earrings;
  /** 가슴에 다는 이름표 */
  nameTag?: boolean;
}

export type FullAvatar = Required<AvatarConfig>;

/** 아이가 느끼는 선생님(친구)의 이미지: 색·동물·모양·성격 스티커 */
export interface Persona {
  color: string | null;
  animal: string | null;
  shape: string | null;
  traits: string[];
}

/** 선생님 · 반 친구 · 어른(엄마·아빠·친구 부모님·할머니 등) */
export type PersonKind = 'teacher' | 'friend' | 'parent';

export interface Person {
  id: string;
  kind: PersonKind;
  name: string;
  avatar: AvatarConfig;
  /** 아이가 가장 최근에 고른 이미지 (변화 이력은 portrait 응답에 남는다) */
  persona?: Persona;
  /** 선생님 중 원장님 */
  role?: 'director';
}

export interface Child {
  id: string;
  name: string;
  avatar: AvatarConfig;
  className: string;
}

/** 사람이 아닌 질문 대상 — 선생님 평가처럼 느껴지지 않도록 섞어서 묻는다. */
export type TopicId = 'class' | 'meal' | 'nap' | 'play' | 'self';

export type TargetType = 'person' | 'topic';

export type GameType = 'weather' | 'face' | 'story' | 'portrait' | 'relation' | 'art';

export type WeatherCode = 'sunny' | 'partly' | 'cloudy' | 'rainy' | 'stormy';

export interface Profile {
  child: Child;
  people: Person[];
  pinHash: string;
  stars: number;
  stickers: string[];
  onboardedAt: string;
}

export interface PlayResponse {
  id: string;
  sessionId: string;
  targetType: TargetType;
  targetId: string;
  game: GameType;
  /** weather: WeatherCode, face: Expression, story: `${sceneId}:${reactionCode}`, portrait: `${facet}:${id}`, relation: `${rel}>${to}` (지우기는 `-${rel}>${to}`), 'unknown' = 잘 모르겠어 */
  value: string;
  /** -2(매우 부정) ~ +2(매우 긍정). 모르겠어는 null */
  score: number | null;
  /** 두려움/위축 신호(무서운 얼굴, 큰소리, 째려보기 등) */
  fear: boolean;
  hesitationMs: number;
  createdAt: string;
}

export interface PlaySession {
  id: string;
  startedAt: string;
  finishedAt: string;
}

export interface ParentNote {
  id: string;
  targetId: string | null;
  body: string;
  createdAt: string;
}

// ── 그림 놀이 ──

/** portrait: 한 사람 그리기 / scene: 우리 반 그리기 */
export type ArtKind = 'portrait' | 'scene';
export type ArtSky = 'sunny' | 'cloudy' | 'rainy' | 'night' | 'storm';

/** 도화지 좌표는 가로 1000 × 세로 1250 기준 */
export interface ArtStroke {
  color: string;
  /** [x1, y1, x2, y2, …] */
  points: number[];
}

export interface ArtStamp {
  id: string;
  x: number;
  y: number;
}

export interface ArtFigure {
  /** 사람 id 또는 'self' */
  personId: string;
  x: number;
  y: number;
  scale: number;
  expression: Expression;
  bubble: string | null;
}

export interface Drawing {
  id: string;
  kind: ArtKind;
  /** portrait 일 때 그린 사람 */
  subjectId: string | null;
  sky: ArtSky;
  figures: ArtFigure[];
  stamps: ArtStamp[];
  strokes: ArtStroke[];
  createdAt: string;
}
