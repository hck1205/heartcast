import { josa } from '@/lib/josa';
import type { Person, Persona, PersonKind } from '@/types';

/**
 * 아이가 선생님(친구)을 어떻게 느끼는지 "이미지"로 고르는 선택지.
 * 아이에게는 점수가 보이지 않고, 부모 리포트에서만 흐름(-2~+2)과 두려움 신호로 쓰인다.
 * 좋은 선택지와 무서운 선택지를 섞어 둬야 아이가 느낌을 있는 그대로 표현할 수 있다.
 */
export interface PersonaChoice {
  id: string;
  label: string; // 아이용 짧은 이름
  hint: string; // 아이용 설명 (말풍선/음성)
  parentLabel: string; // 부모 리포트용
  score: number;
  fear: boolean;
  /** 아이 화면에는 더 보이지 않는 선택지 (예전 기록을 읽기 위해 남겨 둠) */
  hidden?: boolean;
}

export interface ColorChoice extends PersonaChoice {
  color: string;
}
export interface EmojiChoice extends PersonaChoice {
  emoji: string;
}

export const PERSONA_COLORS: ColorChoice[] = [
  { id: 'sun', color: '#FFD23F', label: '햇살 노랑', hint: '밝고 반짝반짝', parentLabel: '햇살 노랑(밝음)', score: 2, fear: false },
  { id: 'peach', color: '#FFB38A', label: '복숭아', hint: '포근하고 따뜻해', parentLabel: '복숭아(포근함)', score: 2, fear: false },
  { id: 'pink', color: '#FF9EC4', label: '딸기 우유', hint: '다정하고 귀여워', parentLabel: '분홍(다정함)', score: 2, fear: false },
  { id: 'mint', color: '#6ED8B5', label: '민트', hint: '상쾌하고 편안해', parentLabel: '민트(편안함)', score: 1, fear: false },
  { id: 'sky', color: '#6EC3FF', label: '하늘 파랑', hint: '시원하고 차분해', parentLabel: '하늘색(차분함)', score: 1, fear: false },
  { id: 'grass', color: '#7BD389', label: '숲속 초록', hint: '쉬는 것처럼 편해', parentLabel: '초록(편안함)', score: 1, fear: false },
  { id: 'lilac', color: '#B79CFF', label: '보라', hint: '신기하고 멋져', parentLabel: '보라(신비로움)', score: 1, fear: false },
  { id: 'brown', color: '#B08463', label: '초코', hint: '든든하고 묵직해', parentLabel: '갈색(묵직함)', score: 0, fear: false },
  { id: 'gray', color: '#A7B0C0', label: '구름 회색', hint: '조용하고 흐릿해', parentLabel: '회색(흐림)', score: 0, fear: false },
  { id: 'red', color: '#F0524F', label: '불꽃 빨강', hint: '뜨겁고 화끈해', parentLabel: '빨강(뜨거움·화)', score: -1, fear: false },
  { id: 'navy', color: '#3E4C7A', label: '깊은 바다', hint: '차갑고 멀어', parentLabel: '남색(차가움)', score: -1, fear: false },
  { id: 'black', color: '#2B2B35', label: '깜깜 밤', hint: '어둡고 무서워', parentLabel: '검정(어두움·무서움)', score: -2, fear: true },
];

export const PERSONA_ANIMALS: EmojiChoice[] = [
  { id: 'rabbit', emoji: '🐰', label: '토끼', hint: '부드럽고 상냥해', parentLabel: '토끼(상냥함)', score: 2, fear: false },
  { id: 'puppy', emoji: '🐶', label: '강아지', hint: '반갑게 놀아줘', parentLabel: '강아지(친근함)', score: 2, fear: false },
  { id: 'panda', emoji: '🐼', label: '판다', hint: '느긋하고 푸근해', parentLabel: '판다(푸근함)', score: 2, fear: false },
  { id: 'koala', emoji: '🐨', label: '코알라', hint: '꼭 안아줄 것 같아', parentLabel: '코알라(포근함)', score: 2, fear: false },
  { id: 'cat', emoji: '🐱', label: '고양이', hint: '조용하고 새침해', parentLabel: '고양이(새침함)', score: 1, fear: false },
  { id: 'bear', emoji: '🐻', label: '곰돌이', hint: '크고 든든해', parentLabel: '곰(든든함)', score: 1, fear: false },
  { id: 'penguin', emoji: '🐧', label: '펭귄', hint: '재밌고 귀여워', parentLabel: '펭귄(유쾌함)', score: 2, fear: false },
  { id: 'giraffe', emoji: '🦒', label: '기린', hint: '키 크고 멀리 봐', parentLabel: '기린(높은 곳에서 봄)', score: 0, fear: false },
  { id: 'owl', emoji: '🦉', label: '부엉이', hint: '똑똑하고 다 알아', parentLabel: '부엉이(똑똑함·지켜봄)', score: 0, fear: false },
  { id: 'turtle', emoji: '🐢', label: '거북이', hint: '천천히 기다려줘', parentLabel: '거북이(느긋함)', score: 1, fear: false },
  { id: 'fox', emoji: '🦊', label: '여우', hint: '꾀가 많아', parentLabel: '여우(꾀 많음)', score: 0, fear: false },
  { id: 'lion', emoji: '🦁', label: '사자', hint: '크게 어흥 해', parentLabel: '사자(크게 소리침)', score: -1, fear: true },
  { id: 'tiger', emoji: '🐯', label: '호랑이', hint: '무섭게 으르렁', parentLabel: '호랑이(무서움)', score: -2, fear: true },
  { id: 'wolf', emoji: '🐺', label: '늑대', hint: '차갑고 무서워', parentLabel: '늑대(차갑고 무서움)', score: -2, fear: true },
  { id: 'croc', emoji: '🐊', label: '악어', hint: '콱 물 것 같아', parentLabel: '악어(공격적)', score: -2, fear: true },
  { id: 'snake', emoji: '🐍', label: '뱀', hint: '쉿, 무서워', parentLabel: '뱀(무섭고 싫음)', score: -2, fear: true },
];

export const PERSONA_SHAPES: EmojiChoice[] = [
  { id: 'star', emoji: '⭐', label: '반짝 별', hint: '멋지고 반짝여', parentLabel: '별(반짝임)', score: 2, fear: false },
  { id: 'heart', emoji: '💖', label: '하트', hint: '사랑이 가득해', parentLabel: '하트(다정함)', score: 2, fear: false },
  { id: 'cloud', emoji: '☁️', label: '폭신 구름', hint: '말랑하고 포근해', parentLabel: '구름(포근함)', score: 2, fear: false },
  { id: 'flower', emoji: '🌸', label: '꽃', hint: '예쁘고 향기로워', parentLabel: '꽃(부드러움)', score: 1, fear: false },
  { id: 'moon', emoji: '🌙', label: '초승달', hint: '조용하고 잔잔해', parentLabel: '달(조용함)', score: 0, fear: false },
  { id: 'square', emoji: '🟦', label: '네모', hint: '반듯하고 딱딱해', parentLabel: '네모(엄격함)', score: 0, fear: false },
  { id: 'spike', emoji: '🔺', label: '뾰족 세모', hint: '뾰족뾰족 따가워', parentLabel: '세모(날카로움)', score: -1, fear: false },
  { id: 'bolt', emoji: '⚡', label: '번개', hint: '갑자기 번쩍 무서워', parentLabel: '번개(갑작스러운 화)', score: -2, fear: true },
  { id: 'ice', emoji: '🧊', label: '얼음', hint: '차갑고 꽁꽁', parentLabel: '얼음(차가움)', score: -1, fear: false },
];

export const PERSONA_TRAITS: EmojiChoice[] = [
  { id: 'kind', emoji: '🤗', label: '다정해', hint: '', parentLabel: '다정해', score: 2, fear: false },
  { id: 'fun', emoji: '🤪', label: '재밌어', hint: '', parentLabel: '재밌어', score: 2, fear: false },
  { id: 'plays', emoji: '🧸', label: '잘 놀아줘', hint: '', parentLabel: '잘 놀아줘', score: 2, fear: false },
  { id: 'smiles', emoji: '😊', label: '잘 웃어', hint: '', parentLabel: '잘 웃어', score: 2, fear: false },
  { id: 'praises', emoji: '👍', label: '칭찬해줘', hint: '', parentLabel: '칭찬해줘', score: 2, fear: false, hidden: true },
  { id: 'listens', emoji: '👂', label: '잘 들어줘', hint: '', parentLabel: '잘 들어줘', score: 2, fear: false, hidden: true },
  { id: 'quiet', emoji: '🤫', label: '조용해', hint: '', parentLabel: '조용해', score: 0, fear: false },
  { id: 'busy', emoji: '🏃', label: '바빠', hint: '', parentLabel: '늘 바빠', score: 0, fear: false },
  { id: 'cold', emoji: '🥶', label: '차가워', hint: '', parentLabel: '차가워', score: -1, fear: false, hidden: true },
  { id: 'scary', emoji: '😨', label: '무서워', hint: '', parentLabel: '무서워', score: -2, fear: true },
  { id: 'angry', emoji: '😠', label: '화를 잘 내', hint: '', parentLabel: '화를 잘 내', score: -2, fear: true },
  { id: 'yells', emoji: '📢', label: '소리 질러', hint: '', parentLabel: '소리 질러', score: -2, fear: true },
];

export type PersonaFacet = 'color' | 'animal' | 'shape' | 'trait';

export const FACET_CHOICES: Record<PersonaFacet, PersonaChoice[]> = {
  color: PERSONA_COLORS,
  animal: PERSONA_ANIMALS,
  shape: PERSONA_SHAPES,
  trait: PERSONA_TRAITS,
};

export const FACET_LABEL: Record<PersonaFacet, string> = {
  color: '색깔',
  animal: '동물',
  shape: '모양',
  trait: '성격',
};

export const MAX_TRAITS = 2;

/** 아이 화면에 보여줄 선택지 */
export const visibleChoices = (facet: PersonaFacet) => FACET_CHOICES[facet].filter((c) => !c.hidden);

export function findChoice(facet: PersonaFacet, id: string | null | undefined): PersonaChoice | undefined {
  if (!id) return undefined;
  return FACET_CHOICES[facet].find((c) => c.id === id);
}

export const colorOf = (id: string | null | undefined) => PERSONA_COLORS.find((c) => c.id === id);
export const animalOf = (id: string | null | undefined) => PERSONA_ANIMALS.find((c) => c.id === id);
export const shapeOf = (id: string | null | undefined) => PERSONA_SHAPES.find((c) => c.id === id);
export const traitOf = (id: string | null | undefined) => PERSONA_TRAITS.find((c) => c.id === id);

export function choiceEmoji(facet: PersonaFacet, id: string): string {
  if (facet === 'color') return '🎨';
  return (findChoice(facet, id) as EmojiChoice | undefined)?.emoji ?? '❔';
}

export const EMPTY_PERSONA: Persona = { color: null, animal: null, shape: null, traits: [] };

/** 종류 이름 (선생님 · 친구 · 어른) */
export const KIND_LABEL: Record<PersonKind, string> = { teacher: '선생님', friend: '친구', parent: '어른' };

/** 부르는 이름: "미소 선생님" / "하준" / "하준이 엄마" */
export function callName(name: string, kind: PersonKind, role?: Person['role']) {
  if (kind !== 'teacher') return name;
  return role === 'director' ? `${name} 원장님` : `${name} 선생님`;
}

/** 사람 하나를 부르는 이름 */
export const nameOf = (p: Pick<Person, 'name' | 'kind' | 'role'>) => callName(p.name, p.kind, p.role);

/** 공방/놀이에서 마루가 묻는 말 */
export function facetQuestion(facet: PersonaFacet, name: string, kind: PersonKind, role?: Person['role']): string {
  const who = callName(name, kind, role);
  switch (facet) {
    case 'color':
      return `${josa(who, '은/는')} 무슨 색깔 같아?`;
    case 'animal':
      return `${josa(who, '은/는')} 어떤 동물을 닮았어?`;
    case 'shape':
      return `${josa(who, '은/는')} 어떤 모양 같아?`;
    case 'trait':
      return `${josa(who, '은/는')} 어떤 사람이야? 스티커를 ${MAX_TRAITS}개까지 붙여줘!`;
  }
}
