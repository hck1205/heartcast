import { hashPin, uuid } from '@/lib/util';
import type { AvatarConfig, Persona, Person, Profile } from '@/types';

/**
 * "먼저 둘러보기"용 예시 데이터: 2주치 놀이 기록.
 * 한 선생님(해님반 '미소')은 대체로 맑고, 다른 선생님('단비')은 최근 흐려지며
 * 무서운 장면 선택이 섞이도록 만들어 리포트의 신호 기능을 보여준다.
 */
export const DEMO_PERSONA: Record<'miso' | 'danbiBefore' | 'danbiNow', Persona> = {
  miso: { color: 'sun', animal: 'rabbit', shape: 'heart', traits: ['kind', 'smiles'] },
  // 처음엔 강아지·하늘색·구름이었는데, 최근 다시 꾸밀 때 사자·빨강·번개로 바뀐 흐름
  danbiBefore: { color: 'sky', animal: 'puppy', shape: 'cloud', traits: ['plays', 'fun'] },
  danbiNow: { color: 'red', animal: 'lion', shape: 'bolt', traits: ['yells', 'busy'] },
};

const friend = (name: string, avatar: Partial<AvatarConfig>): Person => ({
  id: uuid(),
  kind: 'friend',
  name,
  avatar: { skin: 'light', hair: 'bobBangs', hairColor: '#2F2320', shirt: '#A8CFF2', ...avatar, age: 'kid' },
});
const grownup = (name: string, avatar: Partial<AvatarConfig>): Person => ({
  id: uuid(),
  kind: 'parent',
  name,
  avatar: { skin: 'light', hair: 'dandy', hairColor: '#2F2320', shirt: '#EBCDB0', age: 'adult', ...avatar },
});

export function demoProfile(): Profile {
  const people: Person[] = [
    {
      id: uuid(),
      kind: 'teacher',
      name: '미소',
      avatar: { skin: 'light', age: 'adult', faceShape: 'oval', eyes: 'smile', brows: 'arched', cheeks: 'blush', hair: 'ponytail', hairColor: '#4A3226', top: 'apron', pattern: 'dots', shirt: '#F4A6A0', glasses: 'none', headwear: 'scrunchie', nameTag: true, mouth: 'lips', earrings: 'stud', neckwear: 'whistle' },
      persona: DEMO_PERSONA.miso,
    },
    {
      id: uuid(),
      kind: 'teacher',
      name: '단비',
      avatar: { skin: 'porcelain', age: 'adult', faceShape: 'long', eyes: 'narrow', brows: 'thick', cheeks: 'none', hair: 'blunt', hairColor: '#1E1B1A', top: 'turtleneck', pattern: 'none', shirt: '#8FA7C9', glasses: 'horn', headwear: 'none', nameTag: true, nose: 'tall', mouth: 'flat', neckwear: 'lanyard' },
      persona: DEMO_PERSONA.danbiNow,
    },
    {
      id: uuid(),
      kind: 'friend',
      name: '하준',
      avatar: { skin: 'medium', age: 'kid', faceShape: 'round', eyes: 'big', hair: 'gail', hairColor: '#2F2320', top: 'track', pattern: 'none', shirt: '#AEDCC0', headwear: 'none', mouth: 'teeth' },
      persona: { color: 'grass', animal: 'puppy', shape: 'star', traits: ['fun', 'plays'] },
    },
    {
      id: uuid(),
      kind: 'friend',
      name: '서아',
      avatar: { skin: 'porcelain', age: 'kid', faceShape: 'heart', eyes: 'double', hair: 'braids', hairColor: '#7A5236', top: 'dress', pattern: 'flower', shirt: '#FFD58A', headwear: 'bigBow', cheeks: 'freckles' },
      persona: { color: 'pink', animal: 'rabbit', shape: 'heart', traits: ['kind', 'smiles'] },
    },
    friend('도윤', { skin: 'warm', faceShape: 'square', eyes: 'narrow', brows: 'thick', hair: 'buzz', hairColor: '#1E1B1A', top: 'hoodie', shirt: '#5E6B7D', mouth: 'flat' }),
    friend('지우', { skin: 'snow', faceShape: 'oval', eyes: 'lashes', hair: 'pigtails', hairColor: '#4A3226', top: 'overalls', shirt: '#F7C3D8', headwear: 'pin', cheeks: 'blush' }),
    friend('민준', { skin: 'light', faceShape: 'chubby', eyes: 'round', hair: 'comma', hairColor: '#2F2320', top: 'shirt', pattern: 'check', shirt: '#A8CFF2', glasses: 'round' }),
    friend('하윤', { skin: 'tan', faceShape: 'baby', eyes: 'sparkle', hair: 'doubleBun', hairColor: '#7A5236', top: 'cardigan', shirt: '#F4EDA0', mouth: 'cat' }),
    grownup('우리 엄마', { skin: 'light', faceShape: 'oval', eyes: 'double', hair: 'wave', hairColor: '#4A3226', top: 'shirt', shirt: '#EBCDB0', earrings: 'hoop', mouth: 'lips' }),
    grownup('우리 아빠', { skin: 'warm', faceShape: 'square', eyes: 'basic', brows: 'thick', hair: 'dandy', hairColor: '#1E1B1A', top: 'sweatshirt', shirt: '#34466B', glasses: 'square', facialHair: 'stubble' }),
    grownup('하준이 엄마', { skin: 'medium', faceShape: 'heart', eyes: 'smile', hair: 'lowPony', hairColor: '#2F2320', top: 'cardigan', shirt: '#AEDCC0' }),
    grownup('할머니', { skin: 'light', age: 'senior', faceShape: 'round', eyes: 'smile', hair: 'bun', hairColor: '#EDEBE6', top: 'cardigan', pattern: 'flower', shirt: '#C9B8F0', glasses: 'gold' }),
    {
      id: uuid(),
      kind: 'teacher',
      role: 'director',
      name: '나래',
      avatar: { skin: 'light', age: 'adult', faceShape: 'square', eyes: 'basic', brows: 'thick', hair: 'shortPerm', hairColor: '#4A3226', top: 'shirt', shirt: '#34466B', glasses: 'gold', neckwear: 'lanyard', nameTag: true },
      persona: { color: 'navy', animal: 'owl', shape: 'square', traits: ['busy', 'quiet'] },
    },
  ];
  return {
    child: {
      id: uuid(),
      name: '콩이',
      className: '햇님반',
      avatar: { skin: 'light', age: 'kid', headwear: 'kingCrown', faceShape: 'round', eyes: 'big', hair: 'bobBangs', hairColor: '#2F2320', top: 'sweatshirt', pattern: 'none', shirt: '#C9B8F0' },
    },
    people,
    pinHash: hashPin('0000'),
    stars: 42,
    stickers: ['🦄', '🌈', '🐳', '🍓', '🚀'],
    onboardedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    // 재미 요소: 별 상점에서 연 왕관·강아지, 받은 배지, 스티커판
    unlocked: ['hw:kingCrown', 'pet:puppy'],
    pet: 'puppy',
    badges: ['first-play', 'first-art', 'explorer', 'maker', 'shopper', 'pet-friend'],
    stickerBoard: [
      { id: '🦄', x: 0.25, y: 0.3 },
      { id: '🌈', x: 0.6, y: 0.22 },
      { id: '🐳', x: 0.45, y: 0.62 },
      { id: '🍓', x: 0.78, y: 0.7 },
    ],
  };
}

/** 예시 기록을 기존 프로필에 넣을 때, 이미지가 없는 선생님에게 예시 이미지를 채운다 */
export function withDemoPersonas(profile: Profile): Profile {
  const fallback = [DEMO_PERSONA.miso, DEMO_PERSONA.danbiNow];
  let t = 0;
  return {
    ...profile,
    people: profile.people.map((p) => (p.kind === 'teacher' && !p.persona && t < 2 ? { ...p, persona: fallback[t++] } : p)),
  };
}
