import { describe, expect, it } from '@jest/globals';

import { demoHistory, demoProfile } from '@/data/demoSeed';
import { changeLine, compareDiary, DIARY_DEVICES, diaryPages, diaryResponses, diarySentence, emptyPage, filledCount, pageScore, togglePick, type DiaryPage } from '@/games/diary';
import { BADGES } from '@/games/rewards';
import { buildReport, describeResponse, diarySignals } from '@/report/analyze';
import { talkCardFor } from '@/report/talkCards';
import type { Person } from '@/types';

const NOW = new Date('2026-09-30T20:00:00');
const avatar = { skin: 'light' as const, hair: 'bobBangs' as const, hairColor: '#000000', shirt: '#ffffff' };
const people: Person[] = [{ id: 't-1', kind: 'teacher', name: '단비', avatar }];
const page = (daysAgo: number, picks: DiaryPage['picks'], id = `p${daysAgo}`): DiaryPage => {
  const at = new Date(NOW);
  at.setDate(at.getDate() - daysAgo);
  return { id, personId: 't-1', at: at.toISOString(), picks };
};

describe('그림일기 칸', () => {
  it('has 14 optional devices with unique choices', () => {
    expect(DIARY_DEVICES).toHaveLength(14);
    for (const d of DIARY_DEVICES) expect(new Set(d.choices.map((c) => c.id)).size).toBe(d.choices.length);
  });

  it('keeps size and distance unscored', () => {
    for (const id of ['size', 'distance']) expect(DIARY_DEVICES.find((d) => d.id === id)!.choices.every((c) => c.score === null)).toBe(true);
  });

  it('toggles picks, keeps up to 3 actions and drops an emptied device', () => {
    let p = emptyPage('t-1');
    p = togglePick(p, 'animal', 'rabbit');
    p = togglePick(p, 'animal', 'lion');
    expect(p.picks.animal).toEqual(['lion']);
    for (const a of ['hug', 'praise', 'play', 'help']) p = togglePick(p, 'action', a);
    expect(p.picks.action).toEqual(['praise', 'play', 'help']);
    p = togglePick(p, 'animal', 'lion');
    expect(p.picks.animal).toBeUndefined();
    expect(filledCount(p)).toBe(1);
  });
});

describe('그림일기 저장·되살리기', () => {
  it('round-trips a page through responses (one per pick)', () => {
    const p = page(0, { animal: ['lion'], action: ['yell', 'glare'], size: ['house'] });
    const rs = diaryResponses(p);
    expect(rs.map((r) => r.value)).toEqual(['animal:lion', 'action:yell', 'action:glare', 'size:house']);
    expect(rs.every((r) => r.game === 'diary' && r.sessionId === p.id && r.targetId === 't-1')).toBe(true);
    expect(rs.find((r) => r.value === 'size:house')!.score).toBeNull();
    expect(rs.find((r) => r.value === 'action:yell')!.fear).toBe(true);
    expect(diaryPages(rs)).toEqual([p]);
  });

  it('writes a diary sentence in the child voice', () => {
    const s = diarySentence(page(0, { animal: ['rabbit'], voice: ['whisper'], distance: ['close'], bubble: ['okay'] }), '미소 선생님');
    expect(s).toContain('오늘 미소 선생님은');
    expect(s).toContain('🐰 토끼 같았어.');
    expect(s).toContain('목소리는 🤫 소곤소곤.');
    expect(s).toContain('"괜찮아~" 하고 말했어.');
    expect(s).toContain('나랑 꼭 붙어 있었어.');
  });

  it('compares with the last page: changed, same, first page', () => {
    const before = page(3, { animal: ['puppy'], weather: ['sunny'], voice: ['normal'] });
    const today = page(0, { animal: ['lion'], weather: ['sunny'], heart: ['scared'] });
    const { changed, same } = compareDiary(before, today);
    expect(changed.map((c) => c.device.id)).toEqual(['animal']);
    expect(same.map((c) => c.device.id)).toEqual(['weather']);
    expect(changeLine(changed[0])).toBe('동물: 지난번엔 🐶 강아지, 오늘은 🦁 사자');
    expect(compareDiary(undefined, today)).toEqual({ changed: [], same: [] });
    expect(pageScore(before)).toBe(2);
  });
});

describe('그림일기 신호', () => {
  it('asks to talk when scary picks appear on 2 pages', () => {
    const rs = [page(5, { animal: ['puppy'] }), page(3, { voice: ['roar'] }), page(1, { heart: ['scared'] })].flatMap(diaryResponses);
    const sig = diarySignals(rs, people, NOW, 7);
    const fear = sig.find((s) => s.kind === 'diary-fear')!;
    expect(fear.level).toBe('talk');
    expect(fear.detail).toContain('쩌렁쩌렁');
    expect(talkCardFor(fear).title).toBe('그림일기 함께 펼쳐 보기');
    expect(diarySignals([page(3, { voice: ['roar'] })].flatMap(diaryResponses), people, NOW, 7).some((s) => s.kind === 'diary-fear')).toBe(false);
  });

  it('watches a big drop from the previous page and names what changed', () => {
    const rs = [page(20, { animal: ['puppy'], face: ['happy'] }), page(1, { animal: ['wolf'], face: ['sad'] })].flatMap(diaryResponses);
    const shift = diarySignals(rs, people, NOW, 7).find((s) => s.kind === 'diary-shift')!;
    expect(shift.level).toBe('watch');
    expect(shift.detail).toContain('동물: 🐶 강아지(친근함) → 🐺 늑대(차갑고 무서움)');
    // 1.5 미만이면 신호 없음
    const small = [page(4, { face: ['happy'] }), page(1, { face: ['calm'] })].flatMap(diaryResponses);
    expect(diarySignals(small, people, NOW, 7).some((s) => s.kind === 'diary-shift')).toBe(false);
  });

  it('stays out of the weather averages and reads as a sentence', () => {
    const rs = diaryResponses(page(1, { weather: ['stormy'], voice: ['roar'] }));
    const report = buildReport(rs, people, NOW, 7);
    expect(report.teachers[0].answered).toBe(0);
    expect(describeResponse(rs[1], people).text).toBe("그림일기: 단비 선생님의 목소리로 '쩌렁쩌렁'(쩌렁쩌렁 고함)을 골랐어요");
  });
});

describe('그림일기 데모·배지', () => {
  it('demo history has diary pages and Danbi turns scary', () => {
    const p = demoProfile();
    const { responses } = demoHistory(p, NOW);
    const danbi = p.people.find((x) => x.name === '단비')!;
    expect(diaryPages(responses).length).toBeGreaterThanOrEqual(9);
    const report = buildReport(responses, p.people, NOW, 7, p.child.name);
    expect(report.signals.some((s) => s.kind === 'diary-fear' && s.targetId === danbi.id)).toBe(true);
  });

  it('has a diary badge', () => {
    expect(BADGES.some((b) => b.id === 'diarist')).toBe(true);
  });
});
