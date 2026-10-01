import { describe, expect, it } from '@jest/globals';

import { promptFor } from '@/games/prompts';
import { BADGES, bonusStars, buy, isEquipped, newBadges, playedOn, selfWeatherOn, shopItem, streak, streakBonus, toggleEquip, weekStamps } from '@/games/rewards';
import { dayKey } from '@/lib/dates';
import { normalizeAvatar } from '@/lib/avatar';
import type { PlayResponse, Profile } from '@/types';

const NOW = new Date('2026-09-30T20:00:00'); // 수요일
const avatar = { skin: 'light' as const, hair: 'bobBangs' as const, hairColor: '#000000', shirt: '#ffffff' };
const profile = (over: Partial<Profile> = {}): Profile => ({
  child: { id: 'c', name: '콩이', className: '', avatar },
  people: [{ id: 't-1', kind: 'teacher', name: '미소', avatar }],
  pinHash: '',
  stars: 30,
  stickers: [],
  onboardedAt: '',
  ...over,
});
const played = (daysAgo: number, value = 'sunny', game: PlayResponse['game'] = 'weather'): PlayResponse => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return { id: `${daysAgo}${value}`, sessionId: 's', targetType: 'topic', targetId: 'self', game, value, score: 2, fear: false, hesitationMs: 0, createdAt: d.toISOString() };
};

describe('별 상점', () => {
  it('opens an item with stars and puts it on', () => {
    const r = buy(profile(), 'hw:kingCrown');
    expect(r.ok).toBe(true);
    expect(r.profile.stars).toBe(10);
    expect(r.profile.unlocked).toEqual(['hw:kingCrown']);
    expect(r.profile.child.avatar.headwear).toBe('kingCrown');
    expect(buy(r.profile, 'hw:kingCrown')).toMatchObject({ ok: false, reason: 'owned' });
    expect(buy(profile({ stars: 3 }), 'pet:dino')).toMatchObject({ ok: false, reason: 'stars' });
  });

  it('toggles a pet and a cape on and off', () => {
    let p = buy(profile(), 'pet:puppy').profile;
    expect(p.pet).toBe('puppy');
    p = toggleEquip(p, shopItem('pet:puppy')!);
    expect(p.pet).toBeNull();
    p = buy({ ...p, stars: 99 }, 'cape:hero').profile;
    expect(isEquipped(p, shopItem('cape:hero')!)).toBe(true);
    // 열지 않은 아이템은 못 쓴다
    expect(toggleEquip(p, shopItem('hw:wizard')!)).toBe(p);
  });

  it('special items survive avatar normalisation, and old data still migrates', () => {
    expect(normalizeAvatar({ ...avatar, headwear: 'spaceHelmet', cape: 'star' })).toMatchObject({ headwear: 'spaceHelmet', cape: 'star' });
    expect(normalizeAvatar({ ...avatar, accessory: 'crown' } as any).headwear).toBe('ribbon');
  });
});

describe('출석 도장 · 연속', () => {
  it('counts consecutive days ending today or yesterday', () => {
    expect(streak([played(0), played(1), played(2), played(4)], NOW)).toBe(3);
    expect(streak([played(1), played(2)], NOW)).toBe(2);
    expect(streak([played(3)], NOW)).toBe(0);
  });

  it('stamps this week (Mon–Sun) with my weather', () => {
    const w = weekStamps([played(0, 'rainy'), played(2, 'sunny'), played(1, 'portrait', 'portrait')], NOW);
    expect(w.map((d) => d.label).join('')).toBe('월화수목금토일');
    expect(w.map((d) => d.played)).toEqual([true, true, true, false, false, false, false]);
    expect(w[0].weather).toBe('sunny');
    expect(w[1].weather).toBeNull();
    expect(w[2]).toMatchObject({ weather: 'rainy', today: true });
  });

  it('knows whether I played on a day and which weather I picked last', () => {
    const later = { ...played(0, 'cloudy'), id: 'later', createdAt: new Date(NOW.getTime() + 60_000).toISOString() };
    expect(playedOn([played(1)], NOW)).toBe(false);
    expect(playedOn([played(1), played(0, 'portrait', 'portrait')], NOW)).toBe(true);
    expect(selfWeatherOn([later, played(0, 'rainy'), played(1, 'sunny')], NOW)).toBe('cloudy');
    expect(selfWeatherOn([played(0, 'unknown'), played(0, 'portrait', 'portrait')], NOW)).toBeNull();
  });

  it('gives a bonus only on the first play of a 3rd/5th/7th day', () => {
    expect(streakBonus([played(1), played(2)], NOW)).toEqual({ days: 3, stars: 2 });
    expect(streakBonus([played(0), played(1), played(2)], NOW)).toBeNull();
    expect(streakBonus([played(1)], NOW)).toBeNull();
  });
});

describe('배지', () => {
  it('awards new badges once', () => {
    const p = profile({ stickers: Array(10).fill('🦄') });
    const ids = newBadges({ profile: p, responses: [played(0), played(1), played(2)], drawings: [], now: NOW });
    expect(ids).toEqual(expect.arrayContaining(['first-play', 'streak3', 'stickers10']));
    expect(newBadges({ profile: { ...p, badges: ids }, responses: [played(0), played(1), played(2)], drawings: [], now: NOW })).toEqual([]);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});

describe('보너스 게임', () => {
  it('gives up to 3 stars once a day', () => {
    expect(bonusStars(10, profile(), NOW)).toBe(3);
    expect(bonusStars(4, profile(), NOW)).toBe(1);
    expect(bonusStars(10, profile({ bonusDay: dayKey(NOW) }), NOW)).toBe(0);
  });
});

describe('질문 문장', () => {
  it('reads naturally for people and topics', () => {
    const p = profile();
    expect(promptFor({ game: 'weather', targetType: 'person', targetId: 't-1' }, p)).toBe('미소 선생님 머리 위에는 오늘 어떤 날씨가 떠 있을까?');
    expect(promptFor({ game: 'face', targetType: 'topic', targetId: 'self' }, p)).toBe('오늘 내 얼굴은 어땠어?');
  });
});
