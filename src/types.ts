// 마음날씨 공용 타입

export type SkinTone = 'porcelain' | 'light' | 'medium' | 'tan' | 'deep';
export type FaceShape = 'round' | 'oval' | 'square' | 'heart' | 'long';
export type EyeStyle = 'basic' | 'double' | 'smile' | 'narrow' | 'big';
export type BrowStyle = 'straight' | 'arched' | 'thick';
export type CheekStyle = 'blush' | 'none';
/** 한국에서 흔한 머리 모양 (일상툰 스타일) */
export type HairStyle =
  | 'dandy'
  | 'twoblock'
  | 'shortPerm'
  | 'bobBangs'
  | 'bobPart'
  | 'longBangs'
  | 'longPart'
  | 'halfUp'
  | 'ponytail'
  | 'bun'
  | 'pigtails'
  | 'wave';
export type TopStyle = 'apron' | 'cardigan' | 'sweatshirt' | 'shirt' | 'hoodie';
export type Pattern = 'none' | 'stripe' | 'dots';
export type GlassesStyle = 'none' | 'round' | 'horn';
export type Headwear = 'none' | 'headband' | 'pin' | 'scrunchie' | 'ribbon' | 'cap';
export type Expression = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry' | 'scared';

/**
 * 아바타 파츠. 예전 버전 데이터(accessory 하나짜리, 1차 공방 형식)는
 * normalizeAvatar 가 새 형식으로 바꿔 준다.
 */
export interface AvatarConfig {
  skin: SkinTone;
  faceShape?: FaceShape;
  eyes?: EyeStyle;
  brows?: BrowStyle;
  cheeks?: CheekStyle;
  hair: HairStyle;
  hairColor: string;
  top?: TopStyle;
  pattern?: Pattern;
  shirt: string;
  glasses?: GlassesStyle;
  headwear?: Headwear;
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

export type PersonKind = 'teacher' | 'friend';

export interface Person {
  id: string;
  kind: PersonKind;
  name: string;
  avatar: AvatarConfig;
  /** 아이가 가장 최근에 고른 이미지 (변화 이력은 portrait 응답에 남는다) */
  persona?: Persona;
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

export type GameType = 'weather' | 'face' | 'story' | 'portrait';

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
  /** weather: WeatherCode, face: Expression, story: `${sceneId}:${reactionCode}`, portrait: `${facet}:${id}`, 'unknown' = 잘 모르겠어 */
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
