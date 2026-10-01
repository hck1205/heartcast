/** 관계도 놀이·그림 놀이에서 나오는 신호 */
import { bubbleOf } from '@/games/art';
import { makeWho, NOBODY, SELF } from '@/games/people';
import { currentEdges, edgeSentence, parseRelationValue } from '@/games/relations';
import { josa } from '@/lib/josa';
import type { Person, PlayResponse } from '@/types';
import { DAY, startOfDay } from './summary';
import type { Signal } from './signals';

/**
 * 관계도 신호:
 * - 누군가 '나한테 소리 질러요' / 내가 누군가를 '무서워요' → 대화 추천
 * - 무섭거나 슬플 때 달려갈 사람이 '아무도 없어' → 살펴보기
 * - 친구와 '자주 다퉈요', 누군가 나를 '모른 척해요' → 살펴보기
 * - 힘들 때 선생님께 달려간다 → 좋은 신호
 * 지금 관계도에 남아 있는 선 가운데 기간 안에 이은 것만 본다.
 */
export function relationSignals(responses: PlayResponse[], people: Person[], now: Date, days: number, childName = '아이'): Signal[] {
  const end = now.getTime();
  const start = startOfDay(new Date(end - (days - 1) * DAY)).getTime();
  const inWin = (iso: string) => {
    const t = Date.parse(iso);
    return t >= start && t <= end;
  };
  const who = makeWho(people, childName);
  const kindOf = (id: string) => people.find((p) => p.id === id)?.kind;
  const out: Signal[] = [];
  const edges = currentEdges(responses, people).filter((e) => inWin(e.createdAt));

  for (const e of edges) {
    const text = edgeSentence(e, who);
    const base = { id: `rel:${e.key}`, title: `관계도: "${text}"` };
    if (e.rel === 'yell' && e.to === SELF) {
      out.push({ ...base, level: 'talk', kind: 'relation-fear', targetId: e.from, targetName: who(e.from), detail: `${josa(childName, '이/가')} 관계도에서 ${josa(who(e.from), '이/가')} 자기에게 소리 지른다고 선을 이었어요. 어떤 때 그런지 아이 말 그대로 들어봐 주세요.` });
    } else if (e.rel === 'scare' && e.from === SELF) {
      const grown = kindOf(e.to) !== 'friend';
      out.push({
        ...base,
        level: grown ? 'talk' : 'watch',
        kind: 'relation-fear',
        targetId: e.to,
        targetName: who(e.to),
        detail: `${josa(childName, '이/가')} ${josa(who(e.to), '을/를')} 무섭다고 이었어요. 어떤 모습이 무서운지, 언제 그런 마음이 드는지 천천히 물어봐 주세요.`,
      });
    } else if (e.rel === 'yell' && kindOf(e.from) === 'teacher') {
      const toGrown = e.to !== SELF && kindOf(e.to) !== 'friend';
      out.push({
        ...base,
        level: 'watch',
        kind: toGrown ? 'relation-adults' : 'relation-fear',
        targetId: e.from,
        targetName: who(e.from),
        detail: toGrown
          ? `${josa(who(e.from), '이/가')} ${who(e.to)}에게 화내는 모습을 아이가 기억하고 있어요. 어른들 사이의 긴장도 아이는 민감하게 느껴요. 그때 어떤 마음이었는지 들어봐 주세요.`
          : '다른 친구에게 큰 소리를 내는 모습을 아이가 기억하고 있어요. 그걸 볼 때 아이 마음은 어땠는지 물어봐 주세요.',
      });
    } else if (e.rel === 'fight' && e.from !== SELF && e.to !== SELF && kindOf(e.from) !== 'friend' && kindOf(e.to) !== 'friend') {
      out.push({ ...base, level: 'watch', kind: 'relation-adults', targetId: e.from, targetName: who(e.from), detail: `아이 눈에는 ${josa(who(e.from), '과/와')} ${josa(who(e.to), '이/가')} 자주 다투는 것처럼 보였어요. 어른들 사이의 분위기를 아이가 어떻게 느끼는지 물어봐 주세요.` });
    } else if ((e.rel === 'fight' && (e.from === SELF || e.to === SELF)) || (e.rel === 'ignore' && e.to === SELF)) {
      const other = e.from === SELF ? e.to : e.from;
      out.push({ ...base, level: 'watch', kind: 'relation-conflict', targetId: other, targetName: who(other), detail: '친구 사이의 작은 갈등일 수 있어요. 누가 잘못했는지보다 그때 아이 마음이 어땠는지 먼저 들어봐 주세요.' });
    } else if (e.rel === 'runto' && e.from === SELF && kindOf(e.to) === 'teacher') {
      out.push({ ...base, level: 'good', kind: 'relation-safe', targetId: e.to, targetName: who(e.to), detail: `힘들 때 ${who(e.to)}에게 달려간대요. 아이가 기댈 수 있는 어른이 어린이집에 있다는 좋은 신호예요.` });
    }
  }

  // 그림 놀이: 한 사람의 말풍선에서 무서운 말이 2번 이상
  const words = new Map<string, number>();
  for (const r of responses) {
    if (r.game !== 'art' || !r.value.startsWith('bubble:') || !inWin(r.createdAt) || !r.fear) continue;
    words.set(r.targetId, (words.get(r.targetId) ?? 0) + 1);
  }
  for (const [id, n] of words) {
    if (n < 2) continue;
    const said = responses
      .filter((r) => r.game === 'art' && r.targetId === id && r.fear && r.value.startsWith('bubble:'))
      .map((r) => bubbleOf(r.value.split(':')[1])?.text)
      .filter(Boolean);
    out.push({
      id: `art:words:${id}`,
      level: 'talk',
      kind: 'art-words',
      targetId: id,
      targetName: who(id),
      title: `그림 속 ${who(id)}의 말풍선에 무서운 말이 ${n}번 나왔어요`,
      detail: `아이가 그린 ${who(id)}의 말: ${[...new Set(said)].map((t) => `"${t}"`).join(', ')}. 아이가 실제로 들은 말인지, 어떤 때 그런 말을 하는지 천천히 들어봐 주세요.`,
    });
  }

  // "무섭거나 슬플 때 누구한테 달려가?" → 가장 최근 대답이 '아무도 없어'
  const safe = responses
    .filter((r) => r.game === 'relation' && r.targetId === SELF && parseRelationValue(r.value)?.rel === 'runto')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .at(-1);
  if (safe && inWin(safe.createdAt) && parseRelationValue(safe.value)?.to === NOBODY) {
    out.push({
      id: 'rel:alone',
      level: 'watch',
      kind: 'relation-alone',
      targetId: 'self',
      targetName: '아이 마음',
      title: '무섭거나 슬플 때 달려갈 사람으로 "아무도 없어"를 골랐어요',
      detail: '어린이집에서 기댈 사람이 떠오르지 않았을 수 있어요. 힘들 때 누구에게 말하면 좋을지 함께 이야기해 봐 주세요.',
    });
  }
  return out;
}
