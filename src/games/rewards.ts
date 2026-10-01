import type { Cape, Drawing, Headwear, PlayResponse, Profile, WeatherCode } from '@/types';
import { STICKERS } from './content';

/**
 * 아이가 즐기는 보상: 별 상점(특별 아이템·반려 친구), 출석 도장, 연속 보너스, 배지.
 * 순수 재미 요소라 리포트 분석에는 쓰지 않는다.
 */

// ── 별 상점 ──

export type ShopItem =
  | { id: string; kind: 'headwear'; value: Headwear; label: string; emoji: string; price: number }
  | { id: string; kind: 'cape'; value: Cape; label: string; emoji: string; price: number }
  | { id: string; kind: 'pet'; value: PetId; label: string; emoji: string; price: number };

export type PetId = 'puppy' | 'kitty' | 'dino' | 'unicorn' | 'chick';

export const SHOP: ShopItem[] = [
  { id: 'pet:chick', kind: 'pet', value: 'chick', label: '병아리', emoji: '🐥', price: 10 },
  { id: 'pet:puppy', kind: 'pet', value: 'puppy', label: '강아지', emoji: '🐶', price: 15 },
  { id: 'pet:kitty', kind: 'pet', value: 'kitty', label: '고양이', emoji: '🐱', price: 15 },
  { id: 'pet:dino', kind: 'pet', value: 'dino', label: '아기 공룡', emoji: '🦖', price: 25 },
  { id: 'pet:unicorn', kind: 'pet', value: 'unicorn', label: '유니콘', emoji: '🦄', price: 30 },
  { id: 'hw:bunnyEars', kind: 'headwear', value: 'bunnyEars', label: '토끼 귀', emoji: '🐰', price: 8 },
  { id: 'hw:tiara', kind: 'headwear', value: 'tiara', label: '티아라', emoji: '💎', price: 12 },
  { id: 'hw:kingCrown', kind: 'headwear', value: 'kingCrown', label: '왕관', emoji: '👑', price: 20 },
  { id: 'hw:wizard', kind: 'headwear', value: 'wizard', label: '마법사 모자', emoji: '🪄', price: 20 },
  { id: 'hw:dinoHood', kind: 'headwear', value: 'dinoHood', label: '공룡 후드', emoji: '🦕', price: 18 },
  { id: 'hw:spaceHelmet', kind: 'headwear', value: 'spaceHelmet', label: '우주 헬멧', emoji: '🚀', price: 25 },
  { id: 'cape:hero', kind: 'cape', value: 'hero', label: '영웅 망토', emoji: '🦸', price: 15 },
  { id: 'cape:star', kind: 'cape', value: 'star', label: '별 망토', emoji: '🌟', price: 22 },
];

export const shopItem = (id: string) => SHOP.find((x) => x.id === id);
export const isUnlocked = (p: Profile, id: string) => (p.unlocked ?? []).includes(id);

/** 지금 쓰고 있는 아이템인지 */
export function isEquipped(p: Profile, item: ShopItem): boolean {
  if (item.kind === 'pet') return p.pet === item.value;
  if (item.kind === 'cape') return p.child.avatar.cape === item.value;
  return p.child.avatar.headwear === item.value;
}

/** 쓰기 / 벗기 (열린 아이템만) */
export function toggleEquip(p: Profile, item: ShopItem): Profile {
  if (!isUnlocked(p, item.id)) return p;
  const on = isEquipped(p, item);
  if (item.kind === 'pet') return { ...p, pet: on ? null : item.value };
  const avatar = item.kind === 'cape' ? { ...p.child.avatar, cape: on ? 'none' : item.value } : { ...p.child.avatar, headwear: on ? 'none' : item.value };
  return { ...p, child: { ...p.child, avatar: avatar as Profile['child']['avatar'] } };
}

/** 별로 아이템 열기: 별이 모자라거나 이미 열었으면 그대로. 열면 바로 써 본다 */
export function buy(p: Profile, id: string): { profile: Profile; ok: boolean; reason?: 'stars' | 'owned' | 'unknown' } {
  const item = shopItem(id);
  if (!item) return { profile: p, ok: false, reason: 'unknown' };
  if (isUnlocked(p, id)) return { profile: p, ok: false, reason: 'owned' };
  if (p.stars < item.price) return { profile: p, ok: false, reason: 'stars' };
  const bought: Profile = { ...p, stars: p.stars - item.price, unlocked: [...(p.unlocked ?? []), id] };
  return { profile: isEquipped(bought, item) ? bought : toggleEquip(bought, item), ok: true };
}

// ── 출석 도장 · 연속 보너스 ──

export const dayKey = (d: Date) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;

/** 놀이한 날들 (날씨 놀이·관계도·그림 모두) */
function playedDays(responses: PlayResponse[]): Set<string> {
  return new Set(responses.map((r) => dayKey(new Date(r.createdAt))));
}

export interface DayStamp {
  key: string;
  /** 월화수목금토일 */
  label: string;
  played: boolean;
  /** 그날 고른 "내 마음 날씨" (없으면 null) */
  weather: WeatherCode | null;
  today: boolean;
}

/** 이번 주(월~일) 출석 도장 7칸 */
export function weekStamps(responses: PlayResponse[], now = new Date()): DayStamp[] {
  const days = playedDays(responses);
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const selfWeather = new Map<string, WeatherCode>();
  for (const r of [...responses].sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    if (r.game === 'weather' && r.targetType === 'topic' && r.targetId === 'self' && r.value !== 'unknown') selfWeather.set(dayKey(new Date(r.createdAt)), r.value as WeatherCode);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d);
    return { key, label: '월화수목금토일'[i], played: days.has(key), weather: selfWeather.get(key) ?? null, today: key === dayKey(now) };
  });
}

/** 오늘(또는 어제)까지 며칠 연속으로 놀았는지 */
export function streak(responses: PlayResponse[], now = new Date()): number {
  const days = playedDays(responses);
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** 오늘 첫 놀이로 3·5·7일 연속이 되면 보너스 별 */
export function streakBonus(before: PlayResponse[], now = new Date()): { days: number; stars: number } | null {
  if (playedDays(before).has(dayKey(now))) return null;
  const today = { createdAt: now.toISOString() } as PlayResponse;
  const n = streak([...before, today], now);
  const stars = n === 3 ? 2 : n === 5 ? 3 : n === 7 ? 5 : n > 7 && n % 7 === 0 ? 5 : 0;
  return stars ? { days: n, stars } : null;
}

// ── 배지 ──

export interface BadgeCtx {
  profile: Profile;
  responses: PlayResponse[];
  drawings: Drawing[];
  now?: Date;
}

export interface Badge {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  earned: (c: BadgeCtx) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-play', emoji: '🌤️', label: '첫 날씨', desc: '날씨 놀이를 처음 했어요', earned: (c) => c.responses.some((r) => r.game === 'weather') },
  { id: 'first-art', emoji: '🖍️', label: '꼬마 화가', desc: '그림을 처음 그렸어요', earned: (c) => c.drawings.length >= 1 },
  { id: 'artist', emoji: '🎨', label: '그림 박사', desc: '그림을 5장 그렸어요', earned: (c) => c.drawings.length >= 5 },
  {
    id: 'explorer',
    emoji: '🕸️',
    label: '관계도 탐험가',
    desc: '관계도 놀이를 3번 했어요',
    earned: (c) => new Set(c.responses.filter((r) => r.game === 'relation').map((r) => dayKey(new Date(r.createdAt)))).size >= 3,
  },
  { id: 'maker', emoji: '🧑‍🎨', label: '공방 장인', desc: '공방에서 5명을 만들었어요', earned: (c) => c.profile.people.length >= 5 },
  { id: 'streak3', emoji: '🔥', label: '3일 연속', desc: '3일 연속 놀았어요', earned: (c) => streak(c.responses, c.now) >= 3 },
  { id: 'streak7', emoji: '☀️', label: '일주일 연속', desc: '7일 연속 놀았어요', earned: (c) => streak(c.responses, c.now) >= 7 },
  { id: 'stickers10', emoji: '📒', label: '스티커 수집가', desc: '스티커를 10개 모았어요', earned: (c) => c.profile.stickers.length >= 10 },
  { id: 'stickers-all', emoji: '🏆', label: '스티커 박사', desc: '스티커를 모든 종류 모았어요', earned: (c) => new Set(c.profile.stickers).size >= STICKERS.length },
  {
    id: 'all-weather',
    emoji: '🌈',
    label: '날씨 요정',
    desc: '모든 날씨 스티커를 써 봤어요',
    earned: (c) => new Set(c.responses.filter((r) => r.game === 'weather').map((r) => r.value)).size >= 5,
  },
  { id: 'shopper', emoji: '🛍️', label: '첫 선물', desc: '별 상점에서 처음 열었어요', earned: (c) => (c.profile.unlocked ?? []).length >= 1 },
  { id: 'pet-friend', emoji: '🐾', label: '반려 친구', desc: '반려 친구가 생겼어요', earned: (c) => !!c.profile.pet },
];

export const badgeOf = (id: string) => BADGES.find((b) => b.id === id);

/** 새로 받은 배지 id (이미 받은 건 빼고) */
export function newBadges(c: BadgeCtx): string[] {
  const have = new Set(c.profile.badges ?? []);
  return BADGES.filter((b) => !have.has(b.id) && b.earned(c)).map((b) => b.id);
}

// ── 놀이 끝 칭찬 ──

export const CHEERS = [
  '고마워!',
  '알려줘서 고마워~',
  '좋아, 다음 날씨로 슝!',
  '우와, 그랬구나!',
  '멋지게 골랐어!',
  '최고야! 👍',
  '반짝반짝 잘했어!',
  '오~ 그렇구나!',
  '마루가 다 들었어!',
  '척척박사네!',
  '쏙쏙 잘 고르네!',
  '대단해!',
  '하이파이브! ✋',
  '구름도 박수 짝짝!',
  '해님이 웃었어!',
  '좋은 생각이야!',
  '용감하게 말해 줬네!',
  '와, 신난다!',
  '다음 것도 궁금해!',
  '고마워, 친구야!',
];

/** 보너스 게임(해님 구하기)에서 받는 별: 터뜨린 구름 3개마다 1개, 최대 3개, 하루 한 번 */
export function bonusStars(popped: number, profile: Profile, now = new Date()): number {
  if (profile.bonusDay === dayKey(now)) return 0;
  return Math.min(3, Math.floor(popped / 3));
}
