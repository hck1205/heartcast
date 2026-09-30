// 마음날씨 공용 타입

export type SkinTone = 'light' | 'peach' | 'tan' | 'brown' | 'deep';
export type HairStyle = 'short' | 'bob' | 'long' | 'bun' | 'curly' | 'pigtails' | 'spiky';
export type Accessory = 'none' | 'glasses' | 'ribbon' | 'cap' | 'flower' | 'crown';
export type Expression = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry' | 'scared';

export interface AvatarConfig {
  skin: SkinTone;
  hair: HairStyle;
  hairColor: string;
  shirt: string;
  accessory: Accessory;
}

export type PersonKind = 'teacher' | 'friend';

export interface Person {
  id: string;
  kind: PersonKind;
  name: string;
  avatar: AvatarConfig;
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

export type GameType = 'weather' | 'face' | 'story';

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
  /** weather: WeatherCode, face: Expression, story: `${sceneId}:${reactionCode}`, 'unknown' = 잘 모르겠어 */
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
