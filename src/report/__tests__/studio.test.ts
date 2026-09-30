import { describe, expect, it } from '@jest/globals';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { FACET_CHOICES, PERSONA_ANIMALS, PERSONA_TRAITS } from '@/games/persona';
import { planSession } from '@/games/planner';
import { parsePortraitValue, portraitDiff, portraitResponse } from '@/games/portrait';
import { ALL_OPTIONS, normalizeAvatar, randomAvatar } from '@/lib/avatar';
import { buildReport, describeResponse, portraitHistory } from '@/report/analyze';
import { talkCardFor } from '@/report/talkCards';
import type { Person, PlayResponse } from '@/types';

const NOW = new Date('2026-09-30T20:00:00');
const daysAgo = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d;
};
const teacher: Person = { id: 't-1', kind: 'teacher', name: '단비', avatar: { skin: 'light', hair: 'bobBangs', hairColor: '#000000', shirt: '#ffffff' } };

describe('normalizeAvatar', () => {
  it('migrates the very first version (single accessory field)', () => {
    const glasses = normalizeAvatar({ skin: 'tan', hair: 'bob', hairColor: '#000000', shirt: '#ffffff', accessory: 'glasses' } as any);
    expect(glasses).toMatchObject({ glasses: 'round', headwear: 'none', hair: 'bobBangs', skin: 'tan', top: 'sweatshirt' });
    const crown = normalizeAvatar({ skin: 'peach', hair: 'spiky', hairColor: '#000000', shirt: '#ffffff', accessory: 'crown' } as any);
    expect(crown).toMatchObject({ headwear: 'ribbon', hair: 'twoblock', skin: 'light' });
  });

  it('migrates the first studio version (western cartoon parts)', () => {
    const a = normalizeAvatar({
      skin: 'fair',
      eyes: 'sparkle',
      brows: 'none',
      cheeks: 'freckles',
      hair: 'afro',
      hairColor: '#5B8DEF',
      top: 'tshirt',
      pattern: 'stars',
      shirt: '#FF8A5B',
      glasses: 'sun',
      headwear: 'beanie',
      earrings: true,
    } as any);
    expect(a).toMatchObject({
      skin: 'porcelain',
      eyes: 'sparkle',
      brows: 'thin',
      cheeks: 'freckles',
      hair: 'shortPerm',
      top: 'sweatshirt',
      pattern: 'star',
      glasses: 'horn',
      headwear: 'beanie',
      // 2차 버전의 earrings: true 는 작은 귀걸이로
      earrings: 'stud',
      nameTag: false,
      nose: 'hook',
      mouth: 'smile',
      facialHair: 'none',
      neckwear: 'none',
      eyeColor: 'black',
    });
  });

  it('keeps every option of every part (round-trip) and has no duplicate ids', () => {
    for (const [field, values] of Object.entries(ALL_OPTIONS)) {
      expect(new Set(values).size).toBe(values.length);
      for (const v of values) {
        const a = normalizeAvatar({ skin: 'light', hair: 'dandy', hairColor: '#000000', shirt: '#ffffff', [field]: v } as any);
        expect((a as any)[field]).toBe(v);
      }
    }
  });

  it('offers lots of choices in every category', () => {
    expect(ALL_OPTIONS.faceShape.length).toBeGreaterThanOrEqual(9);
    expect(ALL_OPTIONS.eyes.length).toBeGreaterThanOrEqual(12);
    expect(ALL_OPTIONS.hair.length).toBeGreaterThanOrEqual(24);
    expect(ALL_OPTIONS.top.length).toBeGreaterThanOrEqual(10);
    expect(ALL_OPTIONS.headwear.length).toBeGreaterThanOrEqual(12);
    expect(ALL_OPTIONS.skin.length).toBeGreaterThanOrEqual(8);
  });

  it('falls back safely on garbage', () => {
    const a = normalizeAvatar({ skin: 'purple', hair: 42, hairColor: 'red', shirt: null } as any);
    expect(a.skin).toBe('light');
    expect(a.hair).toBe('bobBangs');
    expect(a.hairColor).toMatch(/^#/);
    expect(a.shirt).toMatch(/^#/);
  });

  it('random avatars are always complete and valid', () => {
    for (let i = 0; i < 30; i++) {
      const a = randomAvatar();
      expect(normalizeAvatar(a)).toEqual(a);
    }
  });
});

describe('persona choices', () => {
  it('offer both gentle and scary options so children can express fear', () => {
    for (const choices of Object.values(FACET_CHOICES)) {
      expect(choices.some((c) => c.score > 0)).toBe(true);
      expect(choices.some((c) => c.score < 0)).toBe(true);
      expect(new Set(choices.map((c) => c.id)).size).toBe(choices.length);
    }
    expect(PERSONA_ANIMALS.find((a) => a.id === 'tiger')?.fear).toBe(true);
    expect(PERSONA_TRAITS.find((a) => a.id === 'kind')?.fear).toBe(false);
  });
});

describe('portrait responses', () => {
  it('records only new or changed facets', () => {
    const before = { color: 'sky', animal: 'puppy', shape: 'cloud', traits: ['kind'] };
    const after = { color: 'sky', animal: 'lion', shape: 'cloud', traits: ['kind', 'yells'] };
    const rs = portraitDiff('t-1', before, after, 's1', NOW);
    expect(rs.map((r) => r.value).sort()).toEqual(['animal:lion', 'trait:yells']);
    expect(rs.every((r) => r.fear)).toBe(true);
    expect(portraitDiff('t-1', undefined, after, 's1', NOW)).toHaveLength(5);
  });

  it('keeps "잘 모르겠어" as a null score', () => {
    const r = portraitResponse('t-1', 'shape', null, 's1');
    expect(r).toMatchObject({ value: 'shape:unknown', score: null, fear: false, game: 'portrait' });
    expect(parsePortraitValue(r.value)).toEqual({ facet: 'shape', id: 'unknown' });
    expect(describeResponse(r, [teacher]).text).toContain('잘 모르겠어');
  });

  it('describes portrait choices with natural particles', () => {
    const r = portraitResponse('t-1', 'animal', 'rabbit', 's1');
    expect(describeResponse(r, [teacher]).text).toBe("단비 선생님은 '토끼'를 닮았대요 (부드럽고 상냥해)");
    const c = portraitResponse('t-1', 'color', 'sun', 's1');
    expect(describeResponse(c, [teacher]).text).toBe("단비 선생님의 색깔은 '햇살 노랑'이래요 (밝고 반짝반짝)");
  });
});

describe('portrait-shift signal', () => {
  it('fires when the child redraws a teacher much darker', () => {
    const rs: PlayResponse[] = [
      ...portraitDiff('t-1', undefined, { color: 'sky', animal: 'puppy', shape: 'cloud', traits: ['kind'] }, 'a', daysAgo(12)),
      ...portraitDiff('t-1', { color: 'sky', animal: 'puppy', shape: 'cloud', traits: ['kind'] }, { color: 'black', animal: 'tiger', shape: 'bolt', traits: ['kind'] }, 'b', daysAgo(1)),
    ];
    const report = buildReport(rs, [teacher], NOW, 7);
    const sig = report.signals.find((s) => s.kind === 'portrait-shift');
    expect(sig).toBeDefined();
    expect(sig!.detail).toContain('🐶 강아지');
    expect(sig!.detail).toContain('🐯 호랑이');
    expect(talkCardFor(sig!).openQuestions.length).toBeGreaterThan(1);
    // 무서운 선택 3개(검정·호랑이·번개)는 두려움 신호로도 잡힌다
    expect(report.signals.some((s) => s.kind === 'fear')).toBe(true);
  });

  it('lists the portrait history oldest first', () => {
    const rs = [portraitResponse('t-1', 'animal', 'lion', 'b', 0, daysAgo(1)), portraitResponse('t-1', 'animal', 'puppy', 'a', 0, daysAgo(5))];
    expect(portraitHistory(rs, 't-1').map((e) => e.label)).toEqual(['강아지', '사자']);
  });
});

describe('planner portrait step', () => {
  it('asks one image question per session, rotating facets', () => {
    const people: Person[] = [teacher, { ...teacher, id: 't-2', name: '미소' }];
    const first = planSession(people, [], 3);
    const p1 = first.filter((s) => s.game === 'portrait');
    expect(p1).toHaveLength(1);
    expect(p1[0].facet).toBe('animal');
    const history = [portraitResponse('t-1', 'animal', 'lion', 's')];
    const second = planSession(people, history, 3).find((s) => s.game === 'portrait')!;
    expect(second.facet).toBe('color');
    expect(second.targetId).toBe('t-2');
  });
});

describe('demo data', () => {
  it('shows the demo teacher redrawn from puppy to lion', () => {
    const profile = demoProfile();
    const { responses } = demoHistory(profile, NOW);
    const danbi = profile.people[1];
    const hist = portraitHistory(responses, danbi.id).filter((e) => e.facet === 'animal');
    expect(hist[0].choiceId).toBe('puppy');
    expect(hist.some((e) => e.choiceId === 'lion')).toBe(true);
    const report = buildReport(responses, profile.people, NOW, 7);
    expect(report.signals.some((s) => s.targetId === danbi.id && s.kind === 'portrait-shift')).toBe(true);
  });
});
