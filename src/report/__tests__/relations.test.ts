import { describe, expect, it } from '@jest/globals';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { currentEdges, edgeSentence, makeWho, NOBODY, parseRelationValue, planQuests, questPrompt, relationResponse, SELF } from '@/games/relations';
import { normalizeAvatar, randomAvatar, withAgeDefaults } from '@/lib/avatar';
import { buildReport, describeResponse, relationSignals } from '@/report/analyze';
import { talkCardFor } from '@/report/talkCards';
import type { Person, Profile } from '@/types';

const NOW = new Date('2026-09-30T20:00:00');
const daysAgo = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d;
};
const avatar = { skin: 'light' as const, hair: 'bobBangs' as const, hairColor: '#000000', shirt: '#ffffff' };
const people: Person[] = [
  { id: 't-1', kind: 'teacher', name: '단비', avatar },
  { id: 't-2', kind: 'teacher', name: '미소', avatar },
  { id: 'f-1', kind: 'friend', name: '하준', avatar },
  { id: 'f-2', kind: 'friend', name: '서아', avatar },
  { id: 'p-1', kind: 'parent', name: '하준이 엄마', avatar },
];
const rel = (from: string, r: Parameters<typeof relationResponse>[1], to: string, n: number, removed = false) =>
  relationResponse(from, r, to, `s-${n}-${from}-${to}`, { at: daysAgo(n), removed });

describe('relation values', () => {
  it('round-trips value strings', () => {
    const r = relationResponse('t-1', 'yell', SELF, 's');
    expect(r).toMatchObject({ value: 'yell>self', targetType: 'person', targetId: 't-1', game: 'relation', score: -2, fear: true });
    expect(parseRelationValue(r.value)).toEqual({ rel: 'yell', to: 'self', removed: false });
    expect(parseRelationValue('-close>f-1')).toEqual({ rel: 'close', to: 'f-1', removed: true });
    expect(parseRelationValue('weird')).toBeNull();
    const nobody = relationResponse(SELF, 'runto', NOBODY, 's');
    expect(nobody).toMatchObject({ targetType: 'topic', targetId: 'self', score: null, fear: false });
  });

  it('writes natural Korean sentences', () => {
    const who = makeWho(people, '나');
    expect(edgeSentence({ rel: 'close', from: SELF, to: 'f-1' }, who)).toBe('나랑 하준은 친해요');
    expect(edgeSentence({ rel: 'yell', from: 't-1', to: SELF }, who)).toBe('단비 선생님이 나한테 소리 질러요');
    expect(edgeSentence({ rel: 'scare', from: SELF, to: 't-1' }, who)).toBe('나는 단비 선생님이 무서워요');
    expect(edgeSentence({ rel: 'family', from: 'p-1', to: 'f-1' }, who)).toBe('하준이 엄마랑 하준은 가족이에요');
  });
});

describe('currentEdges', () => {
  it('keeps the latest line, treats undirected pairs as one, and honours removal', () => {
    const edges = currentEdges(
      [
        rel(SELF, 'close', 'f-1', 5),
        rel('f-1', 'close', SELF, 4), // 같은 선 (방향 없음)
        rel('t-1', 'praise', SELF, 4),
        rel(SELF, 'praise', 't-1', 4), // 방향이 다르면 다른 선
        rel(SELF, 'fight', 'f-2', 3),
        rel(SELF, 'fight', 'f-2', 1, true), // 지우기
        rel(SELF, 'runto', NOBODY, 1), // 선이 아님
        rel('gone', 'close', SELF, 1), // 지워진 사람
      ],
      people,
    );
    expect(edges.map((e) => e.key).sort()).toEqual(['close|f-1|self', 'praise|self|t-1', 'praise|t-1|self']);
  });
});

describe('planQuests', () => {
  it('asks three questions, at most one sensitive, starts gently and never repeats a subject', () => {
    for (let seed = 1; seed < 40; seed++) {
      const qs = planQuests(people, [], seed);
      expect(qs).toHaveLength(3);
      expect(qs[0].sensitive).toBe(false);
      expect(qs.filter((q) => q.sensitive).length).toBeLessThanOrEqual(1);
      const subjects = qs.map((q) => q.subject).filter((s) => s !== SELF);
      expect(new Set(subjects).size).toBe(subjects.length);
      for (const q of qs) {
        expect(q.candidates).not.toContain(q.subject);
        // 두 사람 질문은 사람을 고르지 않고 스티커를 고른다
        expect(q.candidates.length > 0).toBe(!q.other);
      }
      expect(qs.filter((q) => q.other).length).toBeLessThanOrEqual(1);
    }
  });

  it('prefers questions that were not asked recently', () => {
    const history = [rel(SELF, 'runto', 't-2', 1), rel(SELF, 'close', 'f-1', 1), rel(SELF, 'scare', NOBODY, 1)];
    const qs = planQuests(people, history, 7, 5);
    expect(qs.map((q) => q.template)).not.toContain('safe');
  });

  it('reads well to a child', () => {
    const who = makeWho(people, '나');
    const base = { id: 'q', candidates: [SELF], allowNobody: true, sensitive: true };
    expect(questPrompt({ ...base, template: 'teacherYell', subject: 't-1', rel: 'yell' }, who)).toBe('단비 선생님이 큰 소리로 말하는 사람이 있어?');
    expect(questPrompt({ ...base, template: 'parentFamily', subject: 'p-1', rel: 'family' }, who)).toBe('하준이 엄마는 누구네 가족이야?');
    expect(questPrompt({ ...base, template: 'friendClose', subject: 'f-1', rel: 'close' }, makeWho(people, '나', { kid: true }))).toBe('하준이는 누구랑 제일 친해?');
  });

  it('works with only teachers (no friends yet)', () => {
    const qs = planQuests([people[0]], [], 1);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.candidates.length > 0 || !!q.other)).toBe(true);
  });

  it('asks about adults: 원장님↔선생님, 선생님↔선생님, 선생님↔우리 엄마, 나↔선생님', () => {
    const withDirector: Person[] = [...people, { id: 'd-1', kind: 'teacher', role: 'director', name: '나래', avatar }];
    const family = [rel('p-1', 'family', SELF, 3)];
    const seen = new Set<string>();
    for (let seed = 1; seed < 200; seed++) for (const q of planQuests(withDirector, family, seed)) if (q.other) seen.add(q.template);
    expect([...seen].sort()).toEqual(['pairDirector', 'pairMe', 'pairParent', 'pairTeachers']);
    const who = makeWho(withDirector, '나', { kid: true });
    const base = { id: 'q', candidates: [], allowNobody: false, sensitive: false, rel: 'close' as const };
    expect(questPrompt({ ...base, template: 'pairDirector', subject: 'd-1', other: 't-1' }, who)).toBe('나래 원장님이랑 단비 선생님은 어떤 사이야?');
    expect(questPrompt({ ...base, template: 'pairMe', subject: 't-1', other: SELF }, who)).toBe('나랑 단비 선생님은 어떤 사이야?');
    expect(edgeSentence({ rel: 'laugh', from: 'd-1', to: 't-2' }, who)).toBe('나래 원장님이랑 미소 선생님은 같이 웃어요');
  });
});

describe('relation signals', () => {
  it('flags a teacher who yells at the child, and fear of a teacher', () => {
    const sig = relationSignals([rel('t-1', 'yell', SELF, 1), rel(SELF, 'scare', 't-1', 1)], people, NOW, 7, '콩이');
    expect(sig.filter((s) => s.level === 'talk')).toHaveLength(2);
    expect(sig[0].detail).toContain('콩이가');
    expect(talkCardFor(sig[0]).openQuestions.length).toBeGreaterThan(1);
  });

  it('notices "nobody" as the safe person, and cheers a trusted teacher', () => {
    expect(relationSignals([rel(SELF, 'runto', NOBODY, 1)], people, NOW, 7).map((s) => s.kind)).toEqual(['relation-alone']);
    // 나중에 선생님을 고르면 사라진다
    expect(relationSignals([rel(SELF, 'runto', NOBODY, 3), rel(SELF, 'runto', 't-2', 1)], people, NOW, 7).map((s) => s.kind)).toEqual(['relation-safe']);
  });

  it('notices tension between adults', () => {
    const withDirector: Person[] = [...people, { id: 'd-1', kind: 'teacher', role: 'director', name: '나래', avatar }];
    const sig = relationSignals([rel('d-1', 'yell', 't-1', 1), rel('t-1', 'fight', 'p-1', 1)], withDirector, NOW, 7, '콩이');
    expect(sig.map((s) => s.kind)).toEqual(['relation-adults', 'relation-adults']);
    expect(sig[0].detail).toContain('나래 원장님이 단비 선생님에게');
  });

  it('ignores lines drawn before the report window', () => {
    expect(relationSignals([rel('t-1', 'yell', SELF, 20)], people, NOW, 7)).toHaveLength(0);
  });

  it('keeps relation answers out of weather averages', () => {
    const report = buildReport([rel('t-1', 'yell', SELF, 1)], people, NOW, 7);
    expect(report.overall.avg).toBeNull();
    expect(report.sessionCount).toBe(0);
    expect(report.teachers[0].fearCount).toBe(0);
    expect(report.signals.some((s) => s.kind === 'relation-fear')).toBe(true);
  });

  it('describes relation answers for parents', () => {
    expect(describeResponse(rel('t-1', 'praise', SELF, 1), people, '콩이').text).toBe('"단비 선생님이 콩이를 칭찬해요" 하고 이었어요');
    expect(describeResponse(rel(SELF, 'runto', NOBODY, 1), people, '콩이').text).toContain('"아무도 없어"');
  });
});

describe('ages', () => {
  it('fills kid for the child and friends, adult for teachers and grown-ups', () => {
    const p = withAgeDefaults({
      child: { id: 'c', name: '콩이', className: '', avatar },
      people,
      pinHash: '',
      stars: 0,
      stickers: [],
      onboardedAt: '',
    } as Profile);
    expect(p.child.avatar.age).toBe('kid');
    expect(p.people.map((x) => x.avatar.age)).toEqual(['adult', 'adult', 'kid', 'kid', 'adult']);
    // 이미 고른 나이는 그대로
    const kept = withAgeDefaults({ ...p, people: [{ ...people[0], avatar: { ...avatar, age: 'senior' } }] });
    expect(kept.people[0].avatar.age).toBe('senior');
  });

  it('random kids have no beard or earrings', () => {
    for (let i = 0; i < 30; i++) {
      const a = randomAvatar('kid');
      expect(a).toMatchObject({ age: 'kid', facialHair: 'none', earrings: 'none' });
      expect(normalizeAvatar(a)).toEqual(a);
    }
  });
});

describe('demo relations', () => {
  it('shows the whole class, grown-ups and a worrying line from 단비 선생님', () => {
    const profile = demoProfile();
    expect(profile.people.filter((p) => p.kind === 'friend').length).toBeGreaterThanOrEqual(6);
    expect(profile.people.filter((p) => p.kind === 'parent').length).toBeGreaterThanOrEqual(4);
    const { responses } = demoHistory(profile, NOW);
    const edges = currentEdges(responses, profile.people);
    expect(edges.length).toBeGreaterThan(10);
    const report = buildReport(responses, profile.people, NOW, 7, profile.child.name);
    const danbi = profile.people[1];
    expect(report.signals.some((s) => s.kind === 'relation-fear' && s.targetId === danbi.id && s.level === 'talk')).toBe(true);
  });
});
