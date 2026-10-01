import { FACES, SCENES, TOPICS, WEATHERS, faceByCode, sceneById, weatherByCode } from '@/games/content';
import { animalOf, callName, choiceEmoji, FACET_LABEL, findChoice, type PersonaFacet } from '@/games/persona';
import { bubbleOf, describeArtValue } from '@/games/art';
import { parsePortraitValue } from '@/games/portrait';
import { currentEdges, edgeSentence, makeWho, NOBODY, parseRelationValue, relationOf, SELF, UNKNOWN } from '@/games/relations';
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

export type SignalLevel = 'talk' | 'watch' | 'good';
export type SignalKind = 'fear' | 'streak' | 'low' | 'drop' | 'bright' | 'self-low' | 'portrait-shift' | 'relation-fear' | 'relation-alone' | 'relation-conflict' | 'relation-safe' | 'relation-adults' | 'art-words';

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
  return callName(p.name, p.kind, p.role);
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

export function buildReport(
  responses: PlayResponse[],
  people: Person[],
  now: Date = new Date(),
  days = 7,
  childName = '아이',
): Report {
  const end = now.getTime();
  const start = startOfDay(new Date(end - (days - 1) * DAY)).getTime();
  const all = responses;
  // 관계도 응답은 날씨 흐름(평균)에 섞지 않고, 관계 신호로 따로 본다
  responses = responses.filter((r) => r.game !== 'relation');
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
  signals.push(...relationSignals(all, people, now, days, childName));
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

/** '토끼'를 처럼 따옴표 뒤에 조사를 붙인다 */
const quoted = (word: string, pair: `${string}/${string}`) => `'${word}'${josa(word, pair).slice(word.length)}`;

/** 한 응답을 부모가 읽을 수 있는 문장으로 */
export function describeResponse(r: PlayResponse, people: Person[], childName = '아이'): { emoji: string; text: string } {
  const who = targetName(r.targetType, r.targetId, people);
  if (r.value === 'unknown') return { emoji: '🤔', text: `${who}: "잘 모르겠어"를 골랐어요` };
  if (r.game === 'relation') return describeRelation(r, people, childName);
  if (r.game === 'art') return describeArtValue(r.value, r.targetId === 'self' ? childName : r.targetId === 'class' ? '우리 반' : who);
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
  if (r.game === 'portrait') {
    const p = parsePortraitValue(r.value);
    const facet = (p?.facet ?? 'animal') as PersonaFacet;
    const c = p ? findChoice(facet, p.id) : undefined;
    if (!c) return { emoji: '🤔', text: `${who}의 ${FACET_LABEL[facet]}: "잘 모르겠어"를 골랐어요` };
    const emoji = choiceEmoji(facet, c.id);
    const text =
      facet === 'animal'
        ? `${josa(who, '은/는')} ${quoted(c.label, '을/를')} 닮았대요 (${c.hint})`
        : facet === 'color'
          ? `${who}의 색깔은 ${quoted(c.label, '이래요/래요')} (${c.hint})`
          : facet === 'shape'
            ? `${who}의 모양은 ${quoted(c.label, '이래요/래요')} (${c.hint})`
            : `${who}에게 '${c.label}' 스티커를 붙였어요`;
    return { emoji, text };
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

export interface PortraitEntry {
  id: string;
  createdAt: string;
  facet: PersonaFacet;
  choiceId: string | null;
  emoji: string;
  label: string;
  score: number | null;
}

/** 한 사람에 대해 아이가 고른 이미지 기록 (오래된 순) */
export function portraitHistory(responses: PlayResponse[], personId: string): PortraitEntry[] {
  return responses
    .filter((r) => r.game === 'portrait' && r.targetId === personId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .flatMap((r) => {
      const p = parsePortraitValue(r.value);
      if (!p) return [];
      const c = findChoice(p.facet, p.id);
      return [
        {
          id: r.id,
          createdAt: r.createdAt,
          facet: p.facet,
          choiceId: c?.id ?? null,
          emoji: c ? choiceEmoji(p.facet, c.id) : '🤔',
          label: c?.label ?? '잘 모르겠어',
          score: r.score,
        },
      ];
    });
}

export { callName };

// ── 관계도 ──

/** 관계도 응답 한 줄 (부모용). 아이 자신은 childName 으로 부른다. */
export function describeRelation(r: PlayResponse, people: Person[], childName: string): { emoji: string; text: string } {
  const p = parseRelationValue(r.value);
  if (!p) return { emoji: '🕸️', text: '관계도를 그렸어요' };
  const def = relationOf(p.rel)!;
  const who = makeWho(people, childName);
  if (p.removed) return { emoji: '✂️', text: `'${edgeSentence({ rel: p.rel, from: r.targetId, to: p.to }, who)}' 선을 지웠어요` };
  if (p.to === NOBODY || p.to === UNKNOWN) {
    const answer = p.to === NOBODY ? '"아무도 없어"' : '"잘 모르겠어"';
    return { emoji: p.to === NOBODY ? '🫥' : '🤔', text: `'${relationQuestionLabel(p.rel, who(r.targetId))}'에 ${answer}라고 했어요` };
  }
  return { emoji: def.emoji, text: `"${edgeSentence({ rel: p.rel, from: r.targetId, to: p.to }, who)}" 하고 이었어요` };
}

/** 질문 형태로 (부모용): 'runto' + 아이 → "힘들 때 달려갈 사람" */
function relationQuestionLabel(rel: string, from: string): string {
  switch (rel) {
    case 'runto':
      return '무섭거나 슬플 때 달려갈 사람';
    case 'close':
      return `${from}의 제일 친한 친구`;
    case 'fight':
      return `${josa(from, '이랑/랑')} 자주 다투는 친구`;
    case 'scare':
      return '조금 무서운 사람';
    case 'yell':
      return `${josa(from, '이/가')} 큰 소리로 말하는 사람`;
    case 'praise':
      return `${josa(from, '이/가')} 자주 칭찬하는 사람`;
    case 'help':
      return `${josa(from, '이/가')} 잘 도와주는 사람`;
    default:
      return `${from}의 관계`;
  }
}

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
