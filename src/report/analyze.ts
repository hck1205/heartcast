/** 부모 리포트 만들기: 기간 안의 응답 → 요약 + 신호 */
import type { Person, PlayResponse, TargetType, WeatherCode } from '@/types';
import { avgToWeather, dayKey, mean, reportWindow, summarize, type TargetSummary } from './summary';
import { diarySignals } from './diarySignals';
import { relationSignals } from './relationSignals';
import { signalsFor, type Signal, type SignalLevel } from './signals';

export interface Report {
  from: string;
  to: string;
  days: number;
  sessionCount: number;
  responseCount: number;
  overall: { avg: number | null; weather: WeatherCode | null };
  self: TargetSummary | null;
  classroom: TargetSummary | null;
  teachers: TargetSummary[];
  friends: TargetSummary[];
  topics: TargetSummary[];
  signals: Signal[];
}

export function buildReport(
  responses: PlayResponse[],
  people: Person[],
  now: Date = new Date(),
  days = 7,
  childName = '아이',
): Report {
  const { start, has } = reportWindow(now, days);
  const all = responses;
  // 관계도·그림일기 응답은 날씨 흐름(평균)에 섞지 않고, 각자의 신호로 따로 본다 (일기는 한 장에 응답이 여러 개라 평균이 쏠린다)
  responses = responses.filter((r) => r.game !== 'relation' && r.game !== 'diary');
  const inWin = responses.filter((r) => has(r.createdAt));

  const summ = (t: TargetType, id: string) => summarize(t, id, responses, people, now, days);
  const teachers = people.filter((p) => p.kind === 'teacher').map((p) => summ('person', p.id));
  const friends = people.filter((p) => p.kind === 'friend').map((p) => summ('person', p.id));
  const topics = (['meal', 'nap', 'play'] as const).map((id) => summ('topic', id));
  const self = summ('topic', 'self');
  const classroom = summ('topic', 'class');

  const signals: Signal[] = [...teachers, ...friends, classroom].flatMap(signalsFor);
  signals.push(...relationSignals(all, people, now, days, childName));
  signals.push(...diarySignals(all, people, now, days));
  if (self.avg !== null && self.answered >= 3 && self.avg <= -0.5) {
    signals.push({
      id: 'self:low',
      level: 'watch',
      kind: 'self-low',
      targetId: 'self',
      targetName: '아이 마음',
      title: '아이 스스로 고른 "내 마음 날씨"가 흐린 날이 많아요',
      detail: '요즘 조금 지쳐 있을 수 있어요. 어린이집 이야기뿐 아니라 잠, 식사, 컨디션도 함께 살펴봐 주세요.',
    });
  }
  const order: Record<SignalLevel, number> = { talk: 0, watch: 1, good: 2 };
  signals.sort((a, b) => order[a.level] - order[b.level]);

  const scored = inWin.map((r) => r.score).filter((s): s is number => s !== null);
  const overallAvg = mean(scored);

  return {
    from: dayKey(new Date(start)),
    to: dayKey(now),
    days,
    sessionCount: new Set(inWin.map((r) => r.sessionId)).size,
    responseCount: inWin.length,
    overall: { avg: overallAvg, weather: avgToWeather(overallAvg) },
    self: self.count ? self : null,
    classroom: classroom.count ? classroom : null,
    teachers,
    friends,
    topics,
    signals,
  };
}

// 리포트 모듈 전체를 한 곳에서 가져다 쓸 수 있게 다시 내보낸다
export { FACES, SCENES, WEATHERS } from '@/games/content';
export { callName } from '@/games/persona';
export * from './describe';
export * from './diarySignals';
export * from './relationSignals';
export * from './signals';
export * from './summary';
