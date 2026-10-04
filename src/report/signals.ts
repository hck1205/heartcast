/** 날씨·표정·이미지 기록에서 나오는 신호 (대화 추천 / 살펴보기 / 좋은 신호) */
import { animalOf } from '@/games/persona';
import { josa } from '@/lib/josa';
import type { TargetSummary } from './summary';

export type SignalLevel = 'talk' | 'watch' | 'good';
export type SignalKind = 'fear' | 'streak' | 'low' | 'drop' | 'bright' | 'self-low' | 'portrait-shift' | 'relation-fear' | 'relation-alone' | 'relation-conflict' | 'relation-safe' | 'relation-adults' | 'art-words' | 'diary-fear' | 'diary-shift';

export interface Signal {
  id: string;
  level: SignalLevel;
  kind: SignalKind;
  targetId: string;
  targetName: string;
  title: string;
  detail: string;
}

export function signalsFor(s: TargetSummary): Signal[] {
  const out: Signal[] = [];
  const base = { targetId: s.targetId, targetName: s.name };
  const isTeacher = s.kind === 'teacher';
  const who = s.name;

  if (s.fearCount >= 2) {
    out.push({
      ...base,
      id: `${s.targetId}:fear`,
      level: 'talk',
      kind: 'fear',
      title: `${josa(who, '과/와')} 관련해 '무서운' 느낌을 ${s.fearCount}번 골랐어요`,
      detail: isTeacher
        ? '큰 소리, 무서운 눈빛, 화난 얼굴, 무서운 동물 같은 선택이 반복됐어요. 아이가 어떤 모습을 떠올렸는지 편하게 들어봐 주세요.'
        : '친구와 지낼 때 무섭거나 화난 느낌을 고른 적이 있어요. 어떤 일이 있었는지 가볍게 물어봐 주세요.',
    });
  }
  if (s.negativeStreak >= 3) {
    out.push({
      ...base,
      id: `${s.targetId}:streak`,
      level: 'talk',
      kind: 'streak',
      title: `${who}에게 ${s.negativeStreak}번 연속 흐린 날씨를 붙였어요`,
      detail: '최근 선택이 연달아 비나 천둥이었어요. 하루 기분일 수도 있으니, 판단보다는 이야기를 먼저 들어봐 주세요.',
    });
  }
  const ps = s.portrait;
  if (ps && ps.prevAvg !== null && ps.recentAvg !== null && ps.prevAvg - ps.recentAvg >= 1.5) {
    const pa = animalOf(ps.prevAnimal);
    const ra = animalOf(ps.recentAnimal);
    const animalLine = pa && ra && pa.id !== ra.id ? `예전엔 ${pa.emoji} ${pa.label} 같다고 했는데, 요즘은 ${ra.emoji} ${ra.label} 같대요. ` : '';
    out.push({
      ...base,
      id: `${s.targetId}:portrait`,
      level: 'watch',
      kind: 'portrait-shift',
      title: `아이가 그린 ${who}의 이미지가 달라졌어요`,
      detail: `${animalLine}고른 색·모양·성격 스티커도 전보다 어두워졌어요. 무엇이 달라졌는지 궁금해하며 물어봐 주세요.`,
    });
  }
  const alreadyTalk = out.some((x) => x.level === 'talk');
  if (!alreadyTalk && s.avg !== null && s.answered >= 3 && s.avg <= -0.75) {
    out.push({
      ...base,
      id: `${s.targetId}:low`,
      level: 'watch',
      kind: 'low',
      title: `${who}의 마음날씨가 대체로 흐려요`,
      detail: '이번 기간 평균이 흐림~비 사이예요. 좋았던 순간과 힘들었던 순간을 함께 물어보면 균형 있게 들을 수 있어요.',
    });
  }
  if (!alreadyTalk && s.avg !== null && s.prevAvg !== null && s.answered >= 2 && s.prevAvg - s.avg >= 1.25) {
    out.push({
      ...base,
      id: `${s.targetId}:drop`,
      level: 'watch',
      kind: 'drop',
      title: `${who}의 날씨가 지난 기간보다 많이 흐려졌어요`,
      detail: '예전에는 맑았는데 요즘 흐려졌어요. 최근에 달라진 일이 있었는지 살펴봐 주세요.',
    });
  }
  if (!alreadyTalk && s.avg !== null && s.answered >= 3 && s.avg >= 1.25) {
    out.push({
      ...base,
      id: `${s.targetId}:bright`,
      level: 'good',
      kind: 'bright',
      title: `${who}에게는 늘 맑은 날씨예요`,
      detail: '아이가 편안하고 좋게 느끼고 있어요. 어떤 점이 좋은지 물어보고 함께 기뻐해 주세요.',
    });
  }
  return out;
}
