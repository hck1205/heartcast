/** 그림일기에서 나오는 신호 */
import { compareDiary, diaryPages, pageFears, pageScore, parentWords } from '@/games/diary';
import { josa } from '@/lib/josa';
import type { Person, PlayResponse } from '@/types';
import type { Signal } from './signals';
import { reportWindow, targetName } from './summary';

/**
 * 그림일기 신호 (사람마다):
 * - 기간 안에 무서운 칸(쩌렁쩌렁·소리 질렀어·무서웠어 등)을 고른 일기가 2장 이상 → 대화 추천
 * - 기간 안의 마지막 장이 바로 앞 장보다 점수 평균이 1.5 이상 떨어짐 → 살펴보기 (바뀐 칸을 그대로 보여준다)
 */
export function diarySignals(responses: PlayResponse[], people: Person[], now: Date, days: number): Signal[] {
  const { end, has: inWin } = reportWindow(now, days);
  const out: Signal[] = [];
  for (const p of people) {
    const pages = diaryPages(responses, p.id).filter((pg) => Date.parse(pg.at) <= end);
    const recent = pages.filter((pg) => inWin(pg.at));
    if (!recent.length) continue;
    const who = targetName('person', p.id, people);
    const base = { targetId: p.id, targetName: who };

    const scary = recent.filter((pg) => pageFears(pg).length > 0);
    if (scary.length >= 2) {
      const words = [...new Set(scary.flatMap((pg) => pageFears(pg).map((f) => `${f.choice.emoji} ${f.choice.label}`)))].slice(0, 4);
      out.push({
        ...base,
        id: `${p.id}:diary-fear`,
        level: 'talk',
        kind: 'diary-fear',
        title: `그림일기에서 ${josa(who, '을/를')} 무섭게 느낀 날이 ${scary.length}번이에요`,
        detail: `아이가 고른 것: ${words.join(', ')}. 그날 어떤 모습이 그렇게 느껴졌는지 아이 말 그대로 들어봐 주세요.`,
      });
    }

    const last = recent[recent.length - 1];
    const prev = pages[pages.indexOf(last) - 1];
    const a = prev ? pageScore(prev) : null;
    const b = pageScore(last);
    if (prev && a !== null && b !== null && a - b >= 1.5) {
      const { changed } = compareDiary(prev, last);
      const lines = changed.slice(0, 3).map((ch) => `${ch.device.label}: ${parentWords(ch.before)} → ${parentWords(ch.after)}`);
      out.push({
        ...base,
        id: `${p.id}:diary-shift`,
        level: 'watch',
        kind: 'diary-shift',
        title: `${who}의 그림일기가 지난번보다 많이 어두워졌어요`,
        detail: lines.length
          ? `${lines.join(' / ')}. 하루의 일일 수 있어요. "오늘은 왜 그렇게 그렸어?"라고 궁금해해 주세요.`
          : '지난번과 다른 칸을 골랐지만 전체 느낌이 어두워졌어요. 하루의 일일 수 있으니 편하게 물어봐 주세요.',
      });
    }
  }
  return out;
}
