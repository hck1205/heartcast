import { describe, expect, it } from '@jest/globals';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { FACET_CHOICES, PERSONA_ANIMALS, PERSONA_TRAITS } from '@/games/persona';
import { planSession } from '@/games/planner';
import { parsePortraitValue, portraitDiff, portraitResponse } from '@/games/portrait';
import { normalizeAvatar, randomAvatar } from '@/lib/avatar';
import { buildReport, describeResponse, portraitHistory } from '@/report/analyze';
import { talkCardFor } from '@/report/talkCards';
import type { Person, PlayResponse } from '@/types';

const NOW = new Date('2026-09-30T20:00:00');
const daysAgo = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d;
};
const teacher: Person = { id: 't-1', kind: 'teacher', name: '단비', avatar: { skin: 'peach', hair: 'bob', hairColor: '#000', shirt: '#fff' } };

describe('normalizeAvatar', () => {
  it('migrates the old single accessory field', () => {
    const glasses = normalizeAvatar({ skin: 'tan', hair: 'bob', hairColor: '#000', shirt: '#fff', accessory: 'glasses' });
    expect(glasses.glasses).toBe('round');
    expect(glasses.headwear).toBe('none');
    const crown = normalizeAvatar({ skin: 'tan', hair: 'bob', hairColor: '#000', shirt: '#fff', accessory: 'crown' });
    expect(crown.headwear).toBe('crown');
  });

  it('fills defaults for new parts and fixes unknown skins', () => {
    const a = normalizeAvatar({ skin: 'purple' as any, hair: 'afro', hairColor: '#123', shirt: '#fff' });
    expect(a).toMatchObject({ skin: 'peach', faceShape: 'round', eyes: 'dot', top: 'tshirt', pattern: 'none', earrings: false, hair: 'afro' });
  });

  it('random avatars are always complete', () => {
    for (let i = 0; i < 20; i++) {
      const a = randomAvatar();
      expect(normalizeAvatar(a)).toEqual(a);
      for (const v of Object.values(a)) expect(v).not.toBeUndefined();
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
