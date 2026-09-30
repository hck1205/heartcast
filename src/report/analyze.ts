import { FACES, SCENES, TOPICS, WEATHERS, faceByCode, sceneById, weatherByCode } from '@/games/content';
import { josa } from '@/lib/josa';
import type { Person, PlayResponse, TargetType, WeatherCode } from '@/types';

const DAY = 24 * 60 * 60 * 1000;

export type Trend = 'up' | 'down' | 'flat';

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  avg: number | null;
}

export interface TargetSummary {
  targetType: TargetType;
  targetId: string;
  name: string;
  kind: 'teacher' | 'friend' | 'topic';
  count: number;
  answered: number;
  avg: number | null;
  prevAvg: number | null;
  trend: Trend | null;
  weather: WeatherCode | null;
  negativeStreak: number;
  fearCount: number;
  distribution: Record<WeatherCode, number>;
  daily: DailyPoint[];
  lastAt: string | null;
}

export type SignalLevel = 'talk' | 'watch' | 'good';
export type SignalKind = 'fear' | 'streak' | 'low' | 'drop' | 'bright' | 'self-low';

export interface Signal {
  id: string;
  level: SignalLevel;
  kind: SignalKind;
  targetId: string;
  targetName: string;
  title: string;
  detail: string;
}

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

export function avgToWeather(avg: number | null): WeatherCode | null {
  if (avg === null) return null;
  if (avg >= 1.25) return 'sunny';
  if (avg >= 0.5) return 'partly';
  if (avg > -0.5) return 'cloudy';
  if (avg > -1.25) return 'rainy';
  return 'stormy';
}

export function scoreToWeather(score: number): WeatherCode {
  return avgToWeather(score) as WeatherCode;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const dayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function targetName(targetType: TargetType, targetId: string, people: Person[]): string {
  if (targetType === 'topic') return TOPICS[targetId as keyof typeof TOPICS]?.name ?? targetId;
  const p = people.find((x) => x.id === targetId);
  if (!p) return '(삭제된 사람)';
  return p.kind === 'teacher' ? `${p.name} 선생님` : p.name;
}

function summarize(
  targetType: TargetType,
  targetId: string,
  all: PlayResponse[],
  people: Person[],
  now: Date,
  days: number,
): TargetSummary {
  const end = now.getTime();
  const start = startOfDay(new Date(end - (days - 1) * DAY)).getTime();
  const prevStart = start - days * DAY;
  const mine = all
    .filter((r) => r.targetType === targetType && r.targetId === targetId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const inWin = mine.filter((r) => {
    const t = Date.parse(r.createdAt);
    return t >= start && t <= end;
  });
  const inPrev = mine.filter((r) => {
    const t = Date.parse(r.createdAt);
    return t >= prevStart && t < start;
  });
  const scores = inWin.map((r) => r.score).filter((s): s is number => s !== null);
  const prevScores = inPrev.map((r) => r.score).filter((s): s is number => s !== null);
  const avg = mean(scores);
  const prevAvg = mean(prevScores);

  let trend: Trend | null = null;
  if (avg !== null && prevAvg !== null) {
    const d = avg - prevAvg;
    trend = d >= 0.5 ? 'up' : d <= -0.5 ? 'down' : 'flat';
  }

  let negativeStreak = 0;
  for (let i = mine.length - 1; i >= 0; i--) {
    const s = mine[i].score;
    if (s === null) continue;
    if (s < 0) negativeStreak++;
    else break;
  }

  const distribution: Record<WeatherCode, number> = { sunny: 0, partly: 0, cloudy: 0, rainy: 0, stormy: 0 };
  for (const s of scores) distribution[scoreToWeather(s)]++;

  const daily: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = startOfDay(new Date(end - i * DAY));
    const key = dayKey(d);
    const ds = inWin
      .filter((r) => dayKey(new Date(r.createdAt)) === key)
      .map((r) => r.score)
      .filter((s): s is number => s !== null);
    daily.push({ date: key, avg: mean(ds) });
  }

  const person = targetType === 'person' ? people.find((p) => p.id === targetId) : undefined;
  return {
    targetType,
    targetId,
    name: targetName(targetType, targetId, people),
    kind: person ? person.kind : 'topic',
    count: inWin.length,
    answered: scores.length,
    avg,
    prevAvg,
    trend,
    weather: avgToWeather(avg),
    negativeStreak,
    fearCount: inWin.filter((r) => r.fear).length,
    distribution,
    daily,
    lastAt: mine.length ? mine[mine.length - 1].createdAt : null,
  };
}

function signalsFor(s: TargetSummary): Signal[] {
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
      title: `${josa(who, '과/와')} 관련해 '무서운' 장면을 ${s.fearCount}번 골랐어요`,
      detail: isTeacher
        ? '큰 소리, 무서운 눈빛, 화난 얼굴 같은 선택이 반복됐어요. 아이가 어떤 장면을 떠올렸는지 편하게 들어봐 주세요.'
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
  const alreadyTalk = out.length > 0;
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

export function buildReport(
  responses: PlayResponse[],
  people: Person[],
  now: Date = new Date(),
  days = 7,
): Report {
  const end = now.getTime();
  const start = startOfDay(new Date(end - (days - 1) * DAY)).getTime();
  const inWin = responses.filter((r) => {
    const t = Date.parse(r.createdAt);
    return t >= start && t <= end;
  });

  const summ = (t: TargetType, id: string) => summarize(t, id, responses, people, now, days);
  const teachers = people.filter((p) => p.kind === 'teacher').map((p) => summ('person', p.id));
  const friends = people.filter((p) => p.kind === 'friend').map((p) => summ('person', p.id));
  const topics = (['meal', 'nap', 'play'] as const).map((id) => summ('topic', id));
  const self = summ('topic', 'self');
  const classroom = summ('topic', 'class');

  const signals: Signal[] = [...teachers, ...friends, classroom].flatMap(signalsFor);
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

/** 한 응답을 부모가 읽을 수 있는 문장으로 */
export function describeResponse(r: PlayResponse, people: Person[]): { emoji: string; text: string } {
  const who = targetName(r.targetType, r.targetId, people);
  if (r.value === 'unknown') return { emoji: '🤔', text: `${who}: "잘 모르겠어"를 골랐어요` };
  if (r.game === 'weather') {
    const label = weatherByCode(r.value)?.parentLabel ?? r.value;
    const emoji = weatherEmoji[r.value as WeatherCode] ?? '☁️';
    if (r.targetType === 'topic') {
      const subject = r.targetId === 'self' ? '아이 자신의 마음' : who;
      return { emoji, text: `${subject} 날씨로 '${label}'${josa(label, '을/를').slice(label.length)} 골랐어요` };
    }
    return { emoji, text: `${who}에게 '${label}' 날씨를 붙였어요` };
  }
  if (r.game === 'face') {
    const label = faceByCode(r.value)?.parentLabel ?? r.value;
    return { emoji: faceEmoji[r.value] ?? '🙂', text: `${who}의 오늘 얼굴로 '${label}'${josa(label, '을/를').slice(label.length)} 골랐어요` };
  }
  const [sceneId, code] = r.value.split(':');
  const scene = sceneById(sceneId);
  const reaction = scene?.reactions.find((x) => x.code === code);
  return {
    emoji: reaction?.emoji ?? '📖',
    text: `'${scene?.title ?? sceneId}' 상황에서 ${josa(who, '은/는')} '${reaction?.parentLabel ?? code}' 모습일 거라고 했어요`,
  };
}

export const weatherEmoji: Record<WeatherCode, string> = {
  sunny: '☀️',
  partly: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
};

export const faceEmoji: Record<string, string> = {
  happy: '😄',
  calm: '😊',
  neutral: '😐',
  sad: '😢',
  angry: '😠',
  scared: '😨',
};

export const weatherLabel = (w: WeatherCode | null) => (w ? WEATHERS.find((x) => x.code === w)!.parentLabel : '기록 없음');

// re-export for convenience
export { FACES, SCENES, WEATHERS };
