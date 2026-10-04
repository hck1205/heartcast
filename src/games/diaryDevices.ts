import { josa } from '@/lib/josa';
import { BUBBLES } from './art';
import { FACE_EMOJI, FACES, WEATHER_EMOJI, WEATHERS } from './content';
import { PERSONA_ANIMALS, PERSONA_COLORS, PERSONA_SHAPES } from './persona';

/**
 * 그림일기: "오늘 이 사람은 나에게 어땠어?"를 한 장에 여러 칸으로 담는다.
 * 칸은 모두 선택이라 아이가 하고 싶은 만큼만 채운다.
 * 좋고 나쁨이 있는 칸은 점수(-2~+2)·두려움 표시를 갖고, 크기·거리는 점수 없이(null) 묘사로만 쓴다.
 */

export type DiaryDeviceId =
  | 'weather'
  | 'face'
  | 'animal'
  | 'voice'
  | 'bubble'
  | 'action'
  | 'heart'
  | 'color'
  | 'shape'
  | 'temp'
  | 'size'
  | 'distance'
  | 'taste'
  | 'sound';

export interface DiaryChoice {
  id: string;
  emoji: string;
  /** 아이용 이름 */
  label: string;
  /** 부모 화면용 뜻풀이 */
  parentLabel: string;
  score: number | null;
  fear: boolean;
  /** 고른 칸이 그림에 보일 색 (색 칸만) */
  color?: string;
}

export interface DiaryDevice {
  id: DiaryDeviceId;
  emoji: string;
  /** 칸 이름 */
  label: string;
  /** 칸을 눌렀을 때 읽어 주는 질문 */
  question: (who: string) => string;
  /** 일기 문장 한 줄 */
  line: (who: string, picks: DiaryChoice[]) => string;
  choices: DiaryChoice[];
  /** 여러 개 고를 수 있으면 최대 개수 */
  multi?: number;
}

const c = (id: string, emoji: string, label: string, parentLabel: string, score: number | null, fear = false): DiaryChoice => ({ id, emoji, label, parentLabel, score, fear });
const x = (p: DiaryChoice) => `${p.emoji} ${p.label}`;

const FACE_LINE: Record<string, string> = { happy: '방긋방긋 웃었어', calm: '포근포근한 얼굴이었어', neutral: '그냥 그런 얼굴이었어', sad: '시무룩했어', angry: '화난 얼굴이었어', scared: '무서운 얼굴이었어' };

export const DIARY_DEVICES: DiaryDevice[] = [
  {
    id: 'weather',
    emoji: '🌦️',
    label: '날씨',
    question: (w) => `오늘 ${w} 머리 위는 어떤 날씨였어?`,
    line: (_, [p]) => `머리 위에는 ${josa(x(p), '이/가')} 떠 있었어.`,
    choices: WEATHERS.map((w) => c(w.code, WEATHER_EMOJI[w.code], w.label, w.parentLabel, w.score, false)),
  },
  {
    id: 'face',
    emoji: '😀',
    label: '얼굴',
    question: (w) => `오늘 ${w} 얼굴은 어땠어?`,
    line: (_, [p]) => `${p.emoji} ${FACE_LINE[p.id] ?? p.label}.`,
    choices: FACES.map((f) => c(f.code, FACE_EMOJI[f.code], f.label, f.parentLabel, f.score, f.fear)),
  },
  {
    id: 'animal',
    emoji: '🐾',
    label: '동물',
    question: (w) => `오늘 ${josa(w, '은/는')} 어떤 동물 같았어?`,
    line: (_, [p]) => `${x(p)} 같았어.`,
    choices: PERSONA_ANIMALS.filter((a) => !a.hidden).map((a) => c(a.id, a.emoji, a.label, a.parentLabel, a.score, a.fear)),
  },
  {
    id: 'voice',
    emoji: '🔊',
    label: '목소리',
    question: (w) => `오늘 ${w} 목소리는 어땠어?`,
    line: (_, [p]) => `목소리는 ${p.emoji} ${p.label}.`,
    choices: [
      c('whisper', '🤫', '소곤소곤', '소곤소곤 작은 목소리', 1),
      c('normal', '🙂', '보통', '보통 목소리', 2),
      c('loud', '🔊', '큰 소리', '큰 목소리', -1),
      c('roar', '📢', '쩌렁쩌렁', '쩌렁쩌렁 고함', -2, true),
    ],
  },
  {
    id: 'bubble',
    emoji: '💬',
    label: '한 말',
    question: (w) => `오늘 ${josa(w, '이/가')} 뭐라고 말했어?`,
    line: (_, [p]) => `"${BUBBLES.find((b) => b.id === p.id)?.text ?? p.label}" 하고 말했어.`,
    choices: BUBBLES.map((b) => c(b.id, b.emoji, b.label, `"${b.text}"`, b.score, b.fear)),
  },
  {
    id: 'action',
    emoji: '🙌',
    label: '한 일',
    multi: 3,
    question: (w) => `오늘 ${josa(w, '이/가')} 나한테 뭐 했어? (3개까지)`,
    line: (_, ps) => `${ps.map((p) => `${p.emoji} ${p.label}`).join(', ')}.`,
    choices: [
      c('hug', '🤗', '안아줬어', '안아줌', 2),
      c('praise', '👍', '칭찬했어', '칭찬함', 2),
      c('play', '🧸', '같이 놀았어', '같이 놀아줌', 2),
      c('help', '🤝', '도와줬어', '도와줌', 2),
      c('read', '📚', '책 읽어줬어', '책을 읽어줌', 2),
      c('wait', '⏳', '기다려줬어', '기다려줌', 2),
      c('busy', '🏃', '바빴어', '바빠 보임', 0),
      c('unseen', '🙈', '나를 못 봤어', '아이를 못 봄', -1),
      c('scold', '☝️', '혼냈어', '혼냄', -1),
      c('yell', '📢', '소리 질렀어', '소리 지름', -2, true),
      c('glare', '👀', '무섭게 쳐다봤어', '무섭게 쳐다봄', -2, true),
      c('grab', '✊', '팔을 꽉 잡았어', '팔을 꽉 잡음', -2, true),
    ],
  },
  {
    id: 'heart',
    emoji: '❤️',
    label: '내 마음',
    question: (w) => `${josa(w, '이랑/랑')} 있을 때 내 마음은 어땠어?`,
    line: (w, [p]) => `${josa(w, '이랑/랑')} 있을 때 나는 ${p.emoji} ${p.label}.`,
    choices: [
      c('excited', '🤩', '신났어', '신남', 2),
      c('cozy', '😊', '편했어', '편안함', 2),
      c('so', '😐', '그냥 그랬어', '그저 그럼', 0),
      c('nervous', '😬', '떨렸어', '긴장됨', -1),
      c('sad', '😢', '슬펐어', '슬픔', -1),
      c('scared', '😨', '무서웠어', '무서움', -2, true),
    ],
  },
  {
    id: 'color',
    emoji: '🎨',
    label: '색',
    question: (w) => `오늘 ${josa(w, '은/는')} 무슨 색 같았어?`,
    line: (_, [p]) => `${p.label} 색 같았어.`,
    choices: PERSONA_COLORS.filter((p) => !p.hidden).map((p) => ({ ...c(p.id, '●', p.label, p.parentLabel, p.score, p.fear), color: p.color })),
  },
  {
    id: 'shape',
    emoji: '⭐',
    label: '모양',
    question: (w) => `오늘 ${josa(w, '은/는')} 어떤 모양 같았어?`,
    line: (_, [p]) => `${x(p)} 모양 같았어.`,
    choices: PERSONA_SHAPES.filter((p) => !p.hidden).map((p) => c(p.id, p.emoji, p.label, p.parentLabel, p.score, p.fear)),
  },
  {
    id: 'temp',
    emoji: '🌡️',
    label: '온도',
    question: (w) => `오늘 ${josa(w, '은/는')} 따뜻했어, 차가웠어?`,
    line: (_, [p]) => `${x(p)}처럼 느껴졌어.`,
    choices: [
      c('blanket', '🧣', '포근한 담요', '포근함', 2),
      c('sun', '🌞', '따뜻한 햇볕', '따뜻함', 2),
      c('lukewarm', '💧', '미지근한 물', '미지근함', 0),
      c('ice', '🧊', '차가운 얼음', '차가움', -1),
      c('fire', '🔥', '뜨거운 불', '뜨거움(화)', -1),
    ],
  },
  {
    id: 'size',
    emoji: '📏',
    label: '크기',
    question: (w) => `오늘 ${josa(w, '은/는')} 얼마나 커 보였어?`,
    line: (_, [p]) => `${p.label} 커 보였어.`,
    choices: [
      c('ant', '🐜', '개미만큼', '아주 작게 보임', null),
      c('me', '🧒', '나만큼', '아이와 비슷하게 보임', null),
      c('adult', '🧑', '어른만큼', '어른 크기로 보임', null),
      c('house', '🏠', '집채만큼', '아주 크게 보임', null),
      c('sky', '🗼', '하늘만큼', '하늘만큼 크게 보임', null),
    ],
  },
  {
    id: 'distance',
    emoji: '↔️',
    label: '거리',
    question: (w) => `오늘 ${josa(w, '은/는')} 나랑 얼마나 가까웠어?`,
    line: (_, [p]) => `나랑 ${p.label}.`,
    choices: [
      c('close', '🫶', '꼭 붙어 있었어', '꼭 붙어 있음', null),
      c('near', '👫', '옆에 있었어', '옆에 있음', null),
      c('bitfar', '🚶', '조금 멀리 있었어', '조금 떨어져 있음', null),
      c('far', '🏃', '아주 멀리 있었어', '멀리 있음', null),
      c('gone', '👻', '안 보였어', '보이지 않음', null),
    ],
  },
  {
    id: 'taste',
    emoji: '🍬',
    label: '맛',
    question: (w) => `오늘 ${josa(w, '을/를')} 맛으로 말하면?`,
    line: (_, [p]) => `맛으로 치면 ${x(p)}.`,
    choices: [
      c('candy', '🍬', '달콤한 사탕', '달콤함', 2),
      c('honey', '🍯', '꿀', '꿀처럼 달콤함', 2),
      c('milk', '🥛', '부드러운 우유', '부드러움', 1),
      c('rice', '🍚', '든든한 밥', '든든함', 1),
      c('lemon', '🍋', '새콤 레몬', '새콤함', 0),
      c('medicine', '💊', '쓴 약', '씀', -1),
      c('pepper', '🌶️', '매운 고추', '매움', -2),
    ],
  },
  {
    id: 'sound',
    emoji: '🎵',
    label: '소리',
    question: (w) => `오늘 ${w} 하면 어떤 소리가 떠올라?`,
    line: (_, [p]) => `떠오르는 소리는 ${x(p)}.`,
    choices: [
      c('song', '🎵', '노랫소리', '노랫소리', 2),
      c('laugh', '😆', '웃음소리', '웃음소리', 2),
      c('clap', '👏', '박수', '박수', 2),
      c('tick', '⏰', '똑딱 시계', '똑딱 시계', 0),
      c('shh', '🤫', '쉿', '쉿(조용히)', 0),
      c('bang', '💥', '쾅쾅', '쾅쾅(큰 소리)', -2, true),
    ],
  },
];

export const deviceOf = (id: string) => DIARY_DEVICES.find((d) => d.id === id);
export const findDiaryChoice = (device: string, id: string) => deviceOf(device)?.choices.find((ch) => ch.id === id);
