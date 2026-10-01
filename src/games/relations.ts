import { hasBatchim, josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import type { Person, PlayResponse } from '@/types';
import { callName } from './persona';
import { seededRandom } from './planner';

/**
 * 관계도 놀이: 아이가 선생님·친구·어른 사이를 선으로 잇고 스티커(관계)를 붙인다.
 * 응답 하나 = 선 하나. targetId 는 선을 긋는 쪽(from), value 는 `${rel}>${to}`.
 * 지우기는 `-${rel}>${to}`, 질문에 "아무도 없어"/"잘 모르겠어"는 to 가 'nobody'/'unknown'.
 * 아이 자신은 'self' (targetType 'topic').
 */
export type RelationId = 'close' | 'laugh' | 'play' | 'help' | 'praise' | 'family' | 'runto' | 'fight' | 'ignore' | 'yell' | 'scare';

export const SELF = 'self';
export const NOBODY = 'nobody';
export const UNKNOWN = 'unknown';

export interface RelationDef {
  id: RelationId;
  emoji: string;
  /** 아이용 스티커 이름 */
  label: string;
  /** 선 색 */
  color: string;
  /** 방향이 있는 관계인지 (A가 B를 칭찬해요) */
  directed: boolean;
  score: number;
  fear: boolean;
  /** 문장: a·b 는 이미 부르는 이름 (아이 화면은 '나', 부모 화면은 아이 이름) */
  sentence: (a: string, b: string) => string;
}

export const RELATIONS: RelationDef[] = [
  { id: 'close', emoji: '💞', label: '친해요', color: '#FF8FB1', directed: false, score: 2, fear: false, sentence: (a, b) => `${josa(a, '이랑/랑')} ${josa(b, '은/는')} 친해요` },
  { id: 'laugh', emoji: '😄', label: '같이 웃어요', color: '#FFB547', directed: false, score: 2, fear: false, sentence: (a, b) => `${josa(a, '이랑/랑')} ${josa(b, '은/는')} 같이 웃어요` },
  { id: 'play', emoji: '🧸', label: '같이 놀아요', color: '#F5B841', directed: false, score: 2, fear: false, sentence: (a, b) => `${josa(a, '이랑/랑')} ${josa(b, '은/는')} 같이 놀아요` },
  { id: 'help', emoji: '🤝', label: '도와줘요', color: '#5BBF8A', directed: true, score: 2, fear: false, sentence: (a, b) => `${josa(a, '이/가')} ${josa(b, '을/를')} 도와줘요` },
  { id: 'praise', emoji: '👍', label: '칭찬해요', color: '#4F8EF7', directed: true, score: 2, fear: false, sentence: (a, b) => `${josa(a, '이/가')} ${josa(b, '을/를')} 칭찬해요` },
  { id: 'runto', emoji: '🏃', label: '힘들 때 달려가요', color: '#35B7C9', directed: true, score: 2, fear: false, sentence: (a, b) => `${josa(a, '은/는')} 힘들 때 ${b}한테 달려가요` },
  { id: 'family', emoji: '🏠', label: '가족이에요', color: '#A98BE0', directed: false, score: 1, fear: false, sentence: (a, b) => `${josa(a, '이랑/랑')} ${josa(b, '은/는')} 가족이에요` },
  { id: 'fight', emoji: '💢', label: '자주 다퉈요', color: '#F2994A', directed: false, score: -1, fear: false, sentence: (a, b) => `${josa(a, '이랑/랑')} ${josa(b, '은/는')} 자주 다퉈요` },
  { id: 'ignore', emoji: '🙈', label: '모른 척해요', color: '#9AA3B2', directed: true, score: -1, fear: false, sentence: (a, b) => `${josa(a, '이/가')} ${josa(b, '을/를')} 모른 척해요` },
  { id: 'yell', emoji: '📢', label: '소리 질러요', color: '#E5484D', directed: true, score: -2, fear: true, sentence: (a, b) => `${josa(a, '이/가')} ${b}한테 소리 질러요` },
  { id: 'scare', emoji: '😨', label: '무서워요', color: '#6E56CF', directed: true, score: -2, fear: true, sentence: (a, b) => `${josa(a, '은/는')} ${josa(b, '이/가')} 무서워요` },
];

export const relationOf = (id: string) => RELATIONS.find((r) => r.id === id);

export interface ParsedRelation {
  rel: RelationId;
  to: string;
  removed: boolean;
}

export function parseRelationValue(value: string): ParsedRelation | null {
  const m = /^(-?)([a-z]+)>(.+)$/.exec(value);
  if (!m || !relationOf(m[2])) return null;
  return { removed: m[1] === '-', rel: m[2] as RelationId, to: m[3] };
}

export function relationResponse(from: string, rel: RelationId, to: string, sessionId: string, opts: { removed?: boolean; hesitationMs?: number; at?: Date } = {}): PlayResponse {
  const def = relationOf(rel)!;
  const real = to !== NOBODY && to !== UNKNOWN && !opts.removed;
  return {
    id: uuid(),
    sessionId,
    targetType: from === SELF ? 'topic' : 'person',
    targetId: from,
    game: 'relation',
    value: `${opts.removed ? '-' : ''}${rel}>${to}`,
    score: real ? def.score : null,
    fear: real && def.fear,
    hesitationMs: opts.hesitationMs ?? 0,
    createdAt: (opts.at ?? new Date()).toISOString(),
  };
}

export interface Edge {
  key: string;
  rel: RelationId;
  from: string;
  to: string;
  createdAt: string;
}

export const edgeKey = (rel: RelationId, from: string, to: string) =>
  relationOf(rel)!.directed ? `${rel}|${from}|${to}` : `${rel}|${[from, to].sort().join('|')}`;

/** 지금 관계도에 그려진 선들: 같은 선은 가장 최근 응답이 이긴다(지우기 포함). 지워진 사람은 뺀다. */
export function currentEdges(responses: PlayResponse[], people: Person[]): Edge[] {
  const alive = new Set([SELF, ...people.map((p) => p.id)]);
  const map = new Map<string, Edge>();
  const rs = responses.filter((r) => r.game === 'relation').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const r of rs) {
    const p = parseRelationValue(r.value);
    if (!p || p.to === NOBODY || p.to === UNKNOWN || p.to === r.targetId) continue;
    const key = edgeKey(p.rel, r.targetId, p.to);
    if (p.removed) map.delete(key);
    else map.set(key, { key, rel: p.rel, from: r.targetId, to: p.to, createdAt: r.createdAt });
  }
  return [...map.values()].filter((e) => alive.has(e.from) && alive.has(e.to));
}

/** 두 사람 사이에 이어진 선들 (방향 상관없이) */
export function edgesBetween(edges: Edge[], a: string, b: string): Edge[] {
  return edges.filter((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

// ── 마루가 이끄는 질문 ──

export type QuestTemplate =
  | 'safe'
  | 'myClose'
  | 'myFight'
  | 'myScare'
  | 'friendClose'
  | 'friendPlay'
  | 'teacherPraise'
  | 'teacherHelp'
  | 'teacherYell'
  | 'parentFamily'
  // 두 사람 사이 (아이는 스티커를 고른다)
  | 'pairDirector'
  | 'pairTeachers'
  | 'pairParent'
  | 'pairMe';

/** 두 사람 질문에서 고르는 스티커 */
export const PAIR_CHOICES: RelationId[] = ['close', 'laugh', 'help', 'fight', 'yell'];

export interface Quest {
  id: string;
  template: QuestTemplate;
  /** 질문의 주인공 (선의 시작점) */
  subject: string;
  rel: RelationId;
  /** 고를 수 있는 사람들 */
  candidates: string[];
  allowNobody: boolean;
  /** 조심스럽게 묻는 질문(무서움·다툼·큰 소리) — 한 판에 많이 섞지 않는다 */
  sensitive: boolean;
  /** 두 사람 질문: 선의 끝 사람 (이때 아이는 사람이 아니라 관계 스티커를 고른다) */
  other?: string;
}

type Who = (id: string) => string;

/** 아이에게 읽어 주는 질문 */
export function questPrompt(q: Quest, who: Who): string {
  const s = who(q.subject);
  switch (q.template) {
    case 'safe':
      return '무섭거나 슬플 때 누구한테 달려가?';
    case 'myClose':
      return '나는 누구랑 제일 친해?';
    case 'myFight':
      return '나랑 자주 다투는 친구가 있어?';
    case 'myScare':
      return '조금 무서운 사람이 있어?';
    case 'friendClose':
      return `${josa(s, '은/는')} 누구랑 제일 친해?`;
    case 'friendPlay':
      return `${josa(s, '은/는')} 누구랑 자주 놀아?`;
    case 'teacherPraise':
      return `${josa(s, '은/는')} 누구를 자주 칭찬해?`;
    case 'teacherHelp':
      return `${josa(s, '은/는')} 누구를 잘 도와줘?`;
    case 'teacherYell':
      return `${josa(s, '이/가')} 큰 소리로 말하는 사람이 있어?`;
    case 'parentFamily':
      return `${josa(s, '은/는')} 누구네 가족이야?`;
    case 'pairMe':
      return `${josa('나', '이랑/랑')} ${josa(who(q.subject), '은/는')} 어떤 사이야?`;
    case 'pairDirector':
    case 'pairTeachers':
    case 'pairParent':
      return `${josa(s, '이랑/랑')} ${josa(who(q.other ?? ''), '은/는')} 어떤 사이야?`;
  }
}

/**
 * 한 판(기본 3문항)의 질문을 고른다.
 * - 최근에 덜 물어본 질문부터
 * - 조심스러운 질문은 최대 1개, 첫 질문은 늘 편안한 질문
 */
export function planQuests(people: Person[], history: PlayResponse[], seed = Date.now(), count = 3, maxSensitive = 1): Quest[] {
  const rand = seededRandom(seed);
  const ids = (k: Person['kind']) => people.filter((p) => p.kind === k).map((p) => p.id);
  const teachers = ids('teacher');
  const friends = ids('friend');
  const parents = ids('parent');
  const kids = [SELF, ...friends];
  const all: Quest[] = [];
  const add = (template: QuestTemplate, subject: string, rel: RelationId, candidates: string[], allowNobody: boolean, sensitive = false) => {
    const c = candidates.filter((x) => x !== subject);
    if (c.length) all.push({ id: `${template}:${subject}`, template, subject, rel, candidates: c, allowNobody, sensitive });
  };

  add('safe', SELF, 'runto', [...teachers, ...parents, ...friends], true);
  add('myClose', SELF, 'close', friends, true);
  add('myFight', SELF, 'fight', friends, true, true);
  add('myScare', SELF, 'scare', [...teachers, ...friends, ...parents], true, true);
  for (const f of friends) {
    add('friendClose', f, 'close', kids, false);
    add('friendPlay', f, 'play', kids, false);
  }
  for (const t of teachers) {
    add('teacherPraise', t, 'praise', kids, true);
    add('teacherHelp', t, 'help', kids, true);
    add('teacherYell', t, 'yell', kids, true, true);
  }
  for (const p of parents) add('parentFamily', p, 'family', kids, false);

  // 두 사람 질문: 원장님↔선생님, 선생님↔선생님, 선생님↔우리 엄마·아빠, 나↔선생님
  const pair = (template: QuestTemplate, subject: string, other: string) =>
    all.push({ id: `${template}:${subject}:${other}`, template, subject, other, rel: 'close', candidates: [], allowNobody: false, sensitive: false });
  const director = people.find((p) => p.kind === 'teacher' && p.role === 'director')?.id;
  const plain = teachers.filter((t) => t !== director);
  if (director) for (const t of plain) pair('pairDirector', director, t);
  for (let i = 0; i < plain.length; i++) for (let j = i + 1; j < plain.length; j++) pair('pairTeachers', plain[i], plain[j]);
  const myFamily = currentEdges(history, people)
    .filter((e) => e.rel === 'family' && (e.from === SELF || e.to === SELF))
    .map((e) => (e.from === SELF ? e.to : e.from));
  for (const t of teachers) {
    for (const p of myFamily.length ? myFamily : parents.slice(0, 2)) pair('pairParent', t, p);
    pair('pairMe', t, SELF);
  }

  // 최근에 같은 질문(주인공+관계)을 얼마나 했는지
  const asked = new Map<string, number>();
  for (const r of history) {
    if (r.game !== 'relation') continue;
    const p = parseRelationValue(r.value);
    if (!p) continue;
    const k = `${r.targetId}|${p.rel}`;
    asked.set(k, (asked.get(k) ?? 0) + 1);
  }
  const pairAsked = new Map<string, number>();
  for (const r of history) {
    const p = r.game === 'relation' ? parseRelationValue(r.value) : null;
    if (!p) continue;
    const k = [r.targetId, p.to].sort().join('|');
    pairAsked.set(k, (pairAsked.get(k) ?? 0) + 1);
  }
  const askedCount = (q: Quest) => (q.other ? (pairAsked.get([q.subject, q.other].sort().join('|')) ?? 0) : (asked.get(`${q.subject}|${q.rel}`) ?? 0));
  const ranked = all
    .map((q) => ({ q, n: askedCount(q), r: rand() }))
    .sort((a, b) => a.n - b.n || a.r - b.r)
    .map((x) => x.q);

  const picked: Quest[] = [];
  let sensitive = 0;
  for (const q of ranked) {
    if (picked.length >= count) break;
    if (q.sensitive && sensitive >= maxSensitive) continue;
    // 두 사람 질문은 한 판에 하나
    if (q.other && picked.some((x) => x.other)) continue;
    // 같은 사람을 주인공으로 두 번 묻지 않는다
    if (picked.some((x) => x.subject === q.subject && x.subject !== SELF)) continue;
    if (q.sensitive) sensitive++;
    picked.push(q);
  }
  // 편안한 질문으로 시작하고, 조심스러운 질문은 사이사이에
  const easy = picked.filter((q) => !q.sensitive);
  const hard = picked.filter((q) => q.sensitive);
  const out: Quest[] = [];
  while (easy.length || hard.length) {
    if (easy.length) out.push(easy.shift()!);
    if (easy.length && out.length > 1 && hard.length) out.push(hard.shift()!);
    else if (!easy.length && hard.length) out.push(hard.shift()!);
  }
  return out;
}

/**
 * 부르는 이름: 아이 화면에서는 나 자신을 '나', 부모 화면에서는 아이 이름.
 * kid: 아이에게 말할 때는 친구 이름을 "하준이"처럼 부른다.
 */
export function makeWho(people: Person[], selfName: string, opts: { kid?: boolean } = {}): Who {
  return (id: string) => {
    if (id === SELF) return selfName;
    if (id === NOBODY) return '아무도 없어';
    if (id === UNKNOWN) return '잘 모르겠어';
    const p = people.find((x) => x.id === id);
    if (!p) return '(지워진 사람)';
    if (opts.kid && p.kind === 'friend' && hasBatchim(p.name)) return `${p.name}이`;
    return callName(p.name, p.kind, p.role);
  };
}

/** 선 하나를 문장으로 */
export function edgeSentence(e: { rel: RelationId; from: string; to: string }, who: Who): string {
  return relationOf(e.rel)!.sentence(who(e.from), who(e.to));
}
