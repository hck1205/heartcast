/** 대상(선생님·친구·하루 속 순간)별 요약: 평균 날씨·추세·두려움·이미지 변화 */
import { TOPICS } from '@/games/content';
import { callName } from '@/games/persona';
import { parsePortraitValue } from '@/games/portrait';
import type { Person, PlayResponse, TargetType, WeatherCode } from '@/types';

export const DAY = 24 * 60 * 60 * 1000;

export type Trend = 'up' | 'down' | 'flat';

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  avg: number | null;
}

export interface TargetSummary {
  targetType: TargetType;
  targetId: string;
  name: string;
  kind: 'teacher' | 'friend' | 'parent' | 'topic';
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
  /** 아이가 그린 이미지(동물·색·모양·성격)의 변화 — 사람일 때만 */
  portrait: PortraitShift | null;
}

export interface PortraitShift {
  prevAvg: number | null;
  recentAvg: number | null;
  /** 이전/최근에 고른 동물 (예: 🐰 → 🦁) */
  prevAnimal: string | null;
  recentAnimal: string | null;
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

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
export const dayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function targetName(targetType: TargetType, targetId: string, people: Person[]): string {
  if (targetType === 'topic') return TOPICS[targetId as keyof typeof TOPICS]?.name ?? targetId;
  const p = people.find((x) => x.id === targetId);
  if (!p) return '(삭제된 사람)';
  return callName(p.name, p.kind, p.role);
}

export function summarize(
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
    portrait: targetType === 'person' ? portraitShift(mine, start, end) : null,
  };
}

function portraitShift(mine: PlayResponse[], start: number, end: number): PortraitShift | null {
  const portraits = mine.filter((r) => r.game === 'portrait');
  if (!portraits.length) return null;
  const before = portraits.filter((r) => Date.parse(r.createdAt) < start);
  const recent = portraits.filter((r) => {
    const t = Date.parse(r.createdAt);
    return t >= start && t <= end;
  });
  const scoreOf = (rs: PlayResponse[]) => mean(rs.map((r) => r.score).filter((x): x is number => x !== null));
  const lastAnimal = (rs: PlayResponse[]) => {
    for (let i = rs.length - 1; i >= 0; i--) {
      const p = parsePortraitValue(rs[i].value);
      if (p?.facet === 'animal' && p.id !== 'unknown') return p.id;
    }
    return null;
  };
  return { prevAvg: scoreOf(before), recentAvg: scoreOf(recent), prevAnimal: lastAnimal(before), recentAnimal: lastAnimal(recent) };
}
