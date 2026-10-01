import { describe, expect, it } from '@jest/globals';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { artResponses, bubbleCounts, crayonStats, describeDrawing, emptyDrawing, sceneStats, SELF } from '@/games/art';
import { buildReport, describeResponse } from '@/report/analyze';
import { talkCardFor } from '@/report/talkCards';
import type { Drawing, Person } from '@/types';

const NOW = new Date('2026-09-30T20:00:00');
const avatar = { skin: 'light' as const, hair: 'bobBangs' as const, hairColor: '#000000', shirt: '#ffffff' };
const people: Person[] = [
  { id: 't-1', kind: 'teacher', name: '단비', avatar },
  { id: 't-2', kind: 'teacher', name: '미소', avatar },
  { id: 'd-1', kind: 'teacher', role: 'director', name: '나래', avatar },
  { id: 'f-1', kind: 'friend', name: '서아', avatar },
];
const at = (daysAgo: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

function angryPortrait(daysAgo: number): Drawing {
  const d = emptyDrawing('portrait', 't-1');
  return {
    ...d,
    createdAt: at(daysAgo),
    sky: 'storm',
    figures: [{ ...d.figures[0], expression: 'angry', bubble: 'quiet', scale: 1.4 }],
    stamps: [
      { id: 'bolt', x: 100, y: 100 },
      { id: 'heart', x: 900, y: 100 },
    ],
    strokes: [{ color: '#2B2B35', points: [100, 1000, 400, 1000, 700, 1000] }],
  };
}

describe('artResponses', () => {
  it('turns a portrait into face · bubble · stamps · sky · crayon responses', () => {
    const rs = artResponses(angryPortrait(1), people, 's');
    expect(rs.map((r) => r.value).sort()).toEqual(['bubble:quiet', 'crayon:dark', 'face:angry', 'sky:storm', 'stamp:bolt', 'stamp:heart']);
    expect(rs.every((r) => r.targetId === 't-1' && r.game === 'art')).toBe(true);
    expect(rs.filter((r) => r.fear).map((r) => r.value).sort()).toEqual(['bubble:quiet', 'face:angry', 'sky:storm', 'stamp:bolt']);
  });

  it('notices scribbling over the face', () => {
    const d = emptyDrawing('portrait', 't-1');
    const f = d.figures[0];
    const pts: number[] = [];
    for (let i = 0; i < 20; i++) pts.push(f.x - 80 + i * 8, f.y - 40 + (i % 2 ? 30 : -30));
    expect(crayonStats({ ...d, strokes: [{ color: '#4F8EF7', points: pts }] }).faceCovered).toBe(true);
    expect(crayonStats(d).faceCovered).toBe(false);
  });
});

describe('scene drawing', () => {
  const scene: Drawing = {
    ...emptyDrawing('scene', null),
    createdAt: at(1),
    figures: [
      { personId: SELF, x: 300, y: 950, scale: 1, expression: 'happy', bubble: null },
      { personId: 'f-1', x: 450, y: 960, scale: 1, expression: 'happy', bubble: null },
      { personId: 't-1', x: 880, y: 300, scale: 1, expression: 'angry', bubble: 'shout' },
      { personId: 'd-1', x: 900, y: 450, scale: 1, expression: 'neutral', bubble: null },
    ],
  };

  it('measures distance from me, neighbours and missing teachers', () => {
    const st = sceneStats(scene, people);
    expect(st.distance).toEqual([
      { personId: 'f-1', band: 'close' },
      { personId: 't-1', band: 'far' },
      { personId: 'd-1', band: 'far' },
    ]);
    expect(st.neighbors).toEqual(expect.arrayContaining([[SELF, 'f-1'].sort(), ['d-1', 't-1']]));
    expect(st.missingTeachers).toEqual(['t-2']);
  });

  it('describes the drawing for parents', () => {
    const lines = describeDrawing(scene, people, '콩이');
    expect(lines).toContain('단비 선생님: 화난 얼굴 · 말풍선 "으아아악!!"');
    expect(lines).toContain('나와 가까이 그린 사람: 서아');
    expect(lines).toContain('그리지 않은 선생님: 미소 선생님');
    expect(lines.some((l) => l.includes('나래 원장님–단비 선생님') || l.includes('단비 선생님–나래 원장님'))).toBe(true);
  });

  it('records closeness without scoring it', () => {
    const near = artResponses(scene, people, 's').filter((r) => r.value.startsWith('near:'));
    expect(near.map((r) => r.value)).toEqual(['near:close', 'near:far', 'near:far']);
    expect(near.every((r) => r.score === null && !r.fear)).toBe(true);
  });
});

describe('art in the report', () => {
  it('raises a talk signal when scary words repeat', () => {
    const rs = [...artResponses(angryPortrait(3), people, 'a'), ...artResponses(angryPortrait(1), people, 'b')];
    const report = buildReport(rs, people, NOW, 7, '콩이');
    const sig = report.signals.find((s) => s.kind === 'art-words');
    expect(sig).toMatchObject({ level: 'talk', targetId: 't-1' });
    expect(sig!.detail).toContain('"조용히 해!"');
    expect(talkCardFor(sig!).title).toContain('말풍선');
    // 기존 두려움 신호에도 반영된다
    expect(report.teachers[0].fearCount).toBeGreaterThanOrEqual(2);
    expect(describeResponse(rs.find((r) => r.value === 'bubble:quiet')!, people).text).toBe('그림 속 단비 선생님의 말풍선: "조용히 해!"');
  });

  it('counts favourite speech bubbles per person', () => {
    expect(bubbleCounts([angryPortrait(1), angryPortrait(2)], 't-1')).toEqual([{ id: 'quiet', n: 2 }]);
  });

  it('demo data includes drawings and a 원장님', () => {
    const profile = demoProfile();
    expect(profile.people.some((p) => p.role === 'director')).toBe(true);
    const { drawings, responses } = demoHistory(profile, NOW);
    expect(drawings.length).toBeGreaterThanOrEqual(3);
    const report = buildReport(responses, profile.people, NOW, 7, profile.child.name);
    expect(report.signals.some((s) => s.kind === 'art-words')).toBe(true);
    expect(report.signals.some((s) => s.kind === 'relation-adults')).toBe(true);
  });
});
