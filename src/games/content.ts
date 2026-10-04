import type { Expression, TopicId, WeatherCode } from '@/types';

/** 날씨·얼굴을 글 속에 짧게 보여줄 때 쓰는 이모지 (그림은 WeatherIcon·Avatar 를 쓴다) */
export const WEATHER_EMOJI: Record<WeatherCode, string> = { sunny: '☀️', partly: '⛅', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️' };
export const FACE_EMOJI: Record<Expression, string> = { happy: '😄', calm: '😊', neutral: '😐', sad: '😢', angry: '😠', scared: '😨' };

export interface WeatherOption {
  code: WeatherCode;
  label: string;
  parentLabel: string;
  score: number;
}

export const WEATHERS: WeatherOption[] = [
  { code: 'sunny', label: '쨍쨍 해님', parentLabel: '맑음', score: 2 },
  { code: 'partly', label: '구름 조금', parentLabel: '구름 조금', score: 1 },
  { code: 'cloudy', label: '흐린 구름', parentLabel: '흐림', score: 0 },
  { code: 'rainy', label: '주룩주룩 비', parentLabel: '비', score: -1 },
  { code: 'stormy', label: '우르르 천둥', parentLabel: '천둥번개', score: -2 },
];

export interface FaceOption {
  code: Expression;
  label: string;
  parentLabel: string;
  score: number;
  fear: boolean;
}

export const FACES: FaceOption[] = [
  { code: 'happy', label: '방긋방긋', parentLabel: '웃는 얼굴', score: 2, fear: false },
  { code: 'calm', label: '포근포근', parentLabel: '편안한 얼굴', score: 1, fear: false },
  { code: 'neutral', label: '그냥 그래', parentLabel: '무표정', score: 0, fear: false },
  { code: 'sad', label: '시무룩', parentLabel: '슬픈 얼굴', score: -1, fear: false },
  { code: 'angry', label: '화났어', parentLabel: '화난 얼굴', score: -2, fear: true },
  { code: 'scared', label: '무서워', parentLabel: '무서운 얼굴', score: -2, fear: true },
];

export interface Topic {
  id: TopicId;
  emoji: string;
  name: string;
  weatherPrompt: string;
}

export const TOPICS: Record<TopicId, Topic> = {
  class: { id: 'class', emoji: '🏫', name: '우리 반 교실', weatherPrompt: '오늘 우리 반 교실 하늘은 어땠어?' },
  meal: { id: 'meal', emoji: '🍙', name: '밥 먹는 시간', weatherPrompt: '밥 먹을 때는 어떤 날씨였어?' },
  nap: { id: 'nap', emoji: '🛏️', name: '낮잠 시간', weatherPrompt: '낮잠 잘 때는 어떤 날씨였어?' },
  play: { id: 'play', emoji: '🧸', name: '놀이 시간', weatherPrompt: '놀이 시간에는 어떤 날씨였어?' },
  self: { id: 'self', emoji: '🌟', name: '나', weatherPrompt: '오늘 내 마음은 어떤 날씨야?' },
};

export interface Reaction {
  code: string;
  label: string;
  parentLabel: string;
  face: Expression;
  emoji: string;
  score: number;
  fear: boolean;
}

export interface StoryScene {
  id: string;
  emoji: string;
  title: string;
  /** {name} 은 선생님 이름으로 바뀐다 */
  prompt: string;
  bg: string;
  reactions: Reaction[];
}

// 상황 그림을 보고 "선생님이라면 어떻게 할까?"를 고르는 투사형 놀이.
// 좋은 반응과 두려움 반응을 섞어 제시하고, 아이가 떠올리는 모습을 본다.
const baseReactions = (comfort: string, calm: string): Reaction[] => [
  { code: 'comfort', label: comfort, parentLabel: '다정하게 도와줌', face: 'happy', emoji: '🤗', score: 2, fear: false },
  { code: 'calm', label: calm, parentLabel: '차분하게 알려줌', face: 'calm', emoji: '🙂', score: 1, fear: false },
  { code: 'ignore', label: '못 본 척 해요', parentLabel: '모른 척함', face: 'neutral', emoji: '😶', score: -1, fear: false },
  { code: 'yell', label: '큰 소리로 말해요', parentLabel: '큰 소리로 말함', face: 'angry', emoji: '📢', score: -2, fear: true },
  { code: 'glare', label: '무서운 눈으로 봐요', parentLabel: '무서운 눈빛', face: 'angry', emoji: '👀', score: -2, fear: true },
];

export const SCENES: StoryScene[] = [
  {
    id: 'milk',
    emoji: '🥛💦',
    title: '우유를 쏟았어요',
    prompt: '앗! 우유를 쏟았어요. {name} 선생님은 어떻게 할까?',
    bg: '#FFF1D6',
    reactions: baseReactions('"괜찮아~" 하고 같이 닦아요', '"조심하자" 하고 알려줘요'),
  },
  {
    id: 'blocks',
    emoji: '🧱💥',
    title: '블록이 와르르',
    prompt: '블록 탑이 와르르 무너졌어요. {name} 선생님은?',
    bg: '#E7F5FF',
    reactions: baseReactions('"다시 쌓아볼까?" 해요', '"정리하자" 하고 말해요'),
  },
  {
    id: 'nap',
    emoji: '🛏️😣',
    title: '잠이 안 와요',
    prompt: '낮잠 시간인데 잠이 안 와요. {name} 선생님은?',
    bg: '#EEE8FF',
    reactions: baseReactions('토닥토닥 해줘요', '"눈 감고 쉬자" 해요'),
  },
  {
    id: 'veggie',
    emoji: '🥦🙅',
    title: '브로콜리 싫어요',
    prompt: '브로콜리를 먹기 싫어요. {name} 선생님은?',
    bg: '#E9FBEF',
    reactions: baseReactions('"한 입만 해볼까?" 웃어요', '"조금만 먹자" 해요'),
  },
  {
    id: 'cry',
    emoji: '😢🧸',
    title: '친구가 울어요',
    prompt: '친구가 장난감 때문에 울어요. {name} 선생님은?',
    bg: '#FFE9F2',
    reactions: baseReactions('안아주고 달래줘요', '"같이 쓰자" 하고 말해요'),
  },
  {
    id: 'toilet',
    emoji: '🚽🙋',
    title: '화장실 가고 싶어요',
    prompt: '수업 중에 화장실이 가고 싶어요. {name} 선생님은?',
    bg: '#E6FAF6',
    reactions: baseReactions('"다녀와~" 하고 웃어요', '"손 들고 말해줘" 해요'),
  },
];

export const STICKERS = ['🦄', '🐳', '🦖', '🌈', '🍓', '🚀', '🐰', '🦊', '🌻', '🐧', '🍩', '🎈', '🐝', '🦋', '🐢', '⭐'];

export const weatherByCode = (code: string) => WEATHERS.find((w) => w.code === code);
export const faceByCode = (code: string) => FACES.find((f) => f.code === code);
export const sceneById = (id: string) => SCENES.find((s) => s.id === id);
