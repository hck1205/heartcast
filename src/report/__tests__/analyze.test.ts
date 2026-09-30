import { describe, expect, it } from '@jest/globals';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { planSession } from '@/games/planner';
import { josa } from '@/lib/josa';
import { avgToWeather, buildReport, describeResponse } from '@/report/analyze';
import { DAILY_CARD, talkCardFor } from '@/report/talkCards';
import type { Person, PlayResponse } from '@/types';

const NOW = new Date('2026-09-30T20:00:00');
const avatar = { skin: 'light', hair: 'bobBangs', hairColor: '#000000', shirt: '#ffffff' } as const;
const teacherA: Person = { id: 't-a', kind: 'teacher', name: '미소', avatar };
const teacherB: Person = { id: 't-b', kind: 'teacher', name: '단비', avatar };
const friend: Person = { id: 'f-1', kind: 'friend', name: '하준', avatar };
const people = [teacherA, teacherB, friend];

let n = 0;
function resp(targetId: string, score: number | null, daysAgo: number, extra: Partial<PlayResponse> = {}): PlayResponse {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(18, 0, n % 60, 0);
  n++;
  return {
    id: `r${n}`,
    sessionId: `s${daysAgo}`,
    targetType: ['class', 'self', 'meal', 'nap', 'play'].includes(targetId) ? 'topic' : 'person',
    targetId,
    game: 'weather',
    value: 'cloudy',
    score,
    fear: false,
    hesitationMs: 1000,
    createdAt: d.toISOString(),
    ...extra,
  };
}

describe('avgToWeather', () => {
  it('maps averages to weather buckets', () => {
    expect(avgToWeather(2)).toBe('sunny');
    expect(avgToWeather(0.6)).toBe('partly');
    expect(avgToWeather(0)).toBe('cloudy');
    expect(avgToWeather(-1)).toBe('rainy');
    expect(avgToWeather(-2)).toBe('stormy');
    expect(avgToWeather(null)).toBeNull();
  });
});

describe('buildReport', () => {
  it('flags a repeated fear signal as "talk" and puts it first', () => {
    const rs = [
      resp('t-b', -2, 1, { game: 'story', value: 'milk:yell', fear: true }),
      resp('t-b', -2, 2, { game: 'face', value: 'angry', fear: true }),
      resp('t-b', 1, 3),
      resp('t-a', 2, 1),
      resp('t-a', 2, 2),
      resp('t-a', 2, 3),
    ];
    const report = buildReport(rs, people, NOW, 7);
    expect(report.signals[0]).toMatchObject({ level: 'talk', kind: 'fear', targetId: 't-b' });
    expect(report.signals.find((s) => s.targetId === 't-a')).toMatchObject({ level: 'good', kind: 'bright' });
  });

  it('detects a negative streak regardless of window', () => {
    const rs = [resp('t-a', 2, 5), resp('t-a', -1, 3), resp('t-a', -2, 2), resp('t-a', -1, 1)];
    const report = buildReport(rs, people, NOW, 7);
    const a = report.teachers.find((t) => t.targetId === 't-a')!;
    expect(a.negativeStreak).toBe(3);
    expect(report.signals.some((s) => s.kind === 'streak' && s.targetId === 't-a')).toBe(true);
  });

  it('ignores "unknown" answers in averages and streaks', () => {
    const rs = [resp('t-a', -1, 3), resp('t-a', -1, 2), resp('t-a', null, 1, { value: 'unknown' }), resp('t-a', -1, 0)];
    const a = buildReport(rs, people, NOW, 7).teachers.find((t) => t.targetId === 't-a')!;
    expect(a.count).toBe(4);
    expect(a.answered).toBe(3);
    expect(a.avg).toBe(-1);
    expect(a.negativeStreak).toBe(3);
  });

  it('computes trend against the previous window and a drop signal', () => {
    const rs = [resp('t-a', 2, 10), resp('t-a', 2, 9), resp('t-a', 0, 2), resp('t-a', -1, 1)];
    const report = buildReport(rs, people, NOW, 7);
    const a = report.teachers.find((t) => t.targetId === 't-a')!;
    expect(a.prevAvg).toBe(2);
    expect(a.trend).toBe('down');
    expect(report.signals.some((s) => s.kind === 'drop')).toBe(true);
  });

  it('produces a daily series with one point per day', () => {
    const report = buildReport([resp('class', 2, 0), resp('class', 0, 0)], people, NOW, 7);
    expect(report.classroom!.daily).toHaveLength(7);
    expect(report.classroom!.daily[6].avg).toBe(1);
    expect(report.classroom!.daily[0].avg).toBeNull();
  });

  it('works end-to-end with demo data and highlights the demo teacher', () => {
    const profile = demoProfile();
    const { responses } = demoHistory(profile, NOW);
    const report = buildReport(responses, profile.people, NOW, 7);
    expect(report.sessionCount).toBeGreaterThan(0);
    const danbi = profile.people[1];
    expect(report.signals.some((s) => s.targetId === danbi.id && s.level !== 'good')).toBe(true);
  });
});

describe('describeResponse', () => {
  it('describes story choices in parent language', () => {
    const r = resp('t-a', -2, 0, { game: 'story', value: 'milk:glare', fear: true });
    expect(describeResponse(r, people).text).toContain('무서운 눈빛');
    expect(describeResponse(r, people).text).toContain('미소 선생님은');
  });
});

describe('talk cards', () => {
  it('builds a card with open questions for each signal kind', () => {
    const report = buildReport(
      [resp('t-b', -2, 1, { fear: true }), resp('t-b', -2, 2, { fear: true }), resp('t-b', -2, 3)],
      people,
      NOW,
      7,
    );
    for (const s of report.signals) {
      const card = talkCardFor(s);
      expect(card.openQuestions.length).toBeGreaterThan(1);
      expect(card.empathy.length).toBeGreaterThan(0);
    }
    expect(DAILY_CARD.openQuestions.length).toBeGreaterThan(0);
  });
});

describe('planSession', () => {
  it('mixes teachers, friends and topics and includes a story scene', () => {
    const steps = planSession(people, [], 42);
    expect(steps.length).toBeGreaterThanOrEqual(6);
    expect(steps.some((s) => s.targetType === 'topic')).toBe(true);
    expect(steps.some((s) => s.targetId === 'f-1')).toBe(true);
    expect(steps.some((s) => s.game === 'story' && s.sceneId)).toBe(true);
    expect(steps[steps.length - 1]).toMatchObject({ targetId: 'class' });
  });

  it('prefers the teacher asked least recently', () => {
    const history = [resp('t-a', 1, 1), resp('t-a', 1, 2), resp('t-a', 1, 3)];
    const steps = planSession(people, history, 7);
    const firstTeacher = steps.find((s) => s.game === 'weather' && s.targetType === 'person' && s.targetId.startsWith('t-'));
    expect(firstTeacher?.targetId).toBe('t-b');
  });

  it('still works with no friends or teachers', () => {
    expect(planSession([], [], 1).every((s) => s.targetType === 'topic')).toBe(true);
  });
});

describe('josa', () => {
  it('picks particles by final consonant', () => {
    expect(josa('미소', '이랑/랑')).toBe('미소랑');
    expect(josa('하준', '이랑/랑')).toBe('하준이랑');
    expect(josa('단비 선생님', '은/는')).toBe('단비 선생님은');
  });
});

describe('describeResponse for topics', () => {
  it('uses natural phrasing and particles', () => {
    expect(describeResponse(resp('class', -1, 0, { value: 'rainy' }), people).text).toBe("우리 반 교실 날씨로 '비'를 골랐어요");
    expect(describeResponse(resp('self', 0, 0, { value: 'cloudy' }), people).text).toBe("아이 자신의 마음 날씨로 '흐림'을 골랐어요");
  });
});
