import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import type { ArtFigure, ArtSky, ArtStroke, Drawing, Expression, Person, PlayResponse } from '@/types';
import { faceByCode } from './content';
import { makeWho, SELF } from './people';

export { SELF } from './people';

/**
 * 그림 놀이: 아이가 사람을 그리며 표정·말풍선·스탬프·크레용·하늘로 마음껏 표현한다.
 * 그림 원본은 Drawing 으로 남기고, 리포트용으로는 'art' 응답을 뽑아 기존 흐름(날씨 평균·두려움 신호)에 합친다.
 * 아동 그림 검사(동적 학교화)에서 보는 단서 — 표정, 하는 말, 크기, 나와의 거리, 빠진 사람, 색 — 를 참고했다.
 */

export const CANVAS_W = 1000;
export const CANVAS_H = 1250;

export interface ArtChoice {
  id: string;
  emoji: string;
  label: string;
  score: number;
  fear: boolean;
}

/** 그 사람이 자주 하는 말 */
export const BUBBLES: (ArtChoice & { text: string })[] = [
  { id: 'love', emoji: '💗', label: '사랑해', text: '사랑해', score: 2, fear: false },
  { id: 'good', emoji: '👍', label: '잘했어!', text: '잘했어!', score: 2, fear: false },
  { id: 'okay', emoji: '🤗', label: '괜찮아', text: '괜찮아~', score: 2, fear: false },
  { id: 'play', emoji: '🧸', label: '같이 놀자', text: '같이 놀자!', score: 2, fear: false },
  { id: 'hurry', emoji: '⏰', label: '빨리빨리!', text: '빨리빨리!', score: -1, fear: false },
  { id: 'no', emoji: '🙅', label: '안 돼!', text: '안 돼!', score: -1, fear: false },
  { id: 'quiet', emoji: '🤫', label: '조용히 해!', text: '조용히 해!', score: -2, fear: true },
  { id: 'shout', emoji: '📢', label: '소리 질러', text: '으아아악!!', score: -2, fear: true },
  { id: 'silent', emoji: '😶', label: '말 안 해', text: '…', score: -1, fear: false },
];

/** 도화지에 찍는 스탬프: 따뜻한 것 6 + 무서운 것 6 */
export const STAMPS: ArtChoice[] = [
  { id: 'heart', emoji: '❤️', label: '하트', score: 2, fear: false },
  { id: 'star', emoji: '⭐', label: '별', score: 2, fear: false },
  { id: 'flower', emoji: '🌸', label: '꽃', score: 2, fear: false },
  { id: 'sun', emoji: '☀️', label: '해', score: 2, fear: false },
  { id: 'music', emoji: '🎵', label: '노래', score: 1, fear: false },
  { id: 'candy', emoji: '🍭', label: '사탕', score: 1, fear: false },
  { id: 'rain', emoji: '🌧️', label: '비', score: -1, fear: false },
  { id: 'tear', emoji: '💧', label: '눈물', score: -1, fear: false },
  { id: 'ice', emoji: '🧊', label: '얼음', score: -1, fear: false },
  { id: 'eye', emoji: '👀', label: '쳐다봐', score: -1, fear: false },
  { id: 'fire', emoji: '🔥', label: '불', score: -2, fear: true },
  { id: 'bolt', emoji: '⚡', label: '번개', score: -2, fear: true },
];

export const SKIES: (ArtChoice & { color: string })[] = [
  { id: 'sunny', emoji: '☀️', label: '맑음', color: '#DDEEFF', score: 2, fear: false },
  { id: 'cloudy', emoji: '☁️', label: '구름', color: '#E8ECF2', score: 0, fear: false },
  { id: 'rainy', emoji: '🌧️', label: '비', color: '#C9D3E0', score: -1, fear: false },
  { id: 'night', emoji: '🌙', label: '밤', color: '#2E3A5C', score: -1, fear: false },
  { id: 'storm', emoji: '⛈️', label: '천둥', color: '#4A4F63', score: -2, fear: true },
];

/** 크레용 8색: dark 는 검정·빨강 (화·무서움을 표현할 때 자주 쓰는 색) */
export const CRAYONS: { color: string; label: string; dark?: boolean }[] = [
  { color: '#E5484D', label: '빨강', dark: true },
  { color: '#FF9F43', label: '주황' },
  { color: '#FFD23F', label: '노랑' },
  { color: '#5BBF8A', label: '초록' },
  { color: '#4F8EF7', label: '파랑' },
  { color: '#B07CE8', label: '보라' },
  { color: '#8B5E3C', label: '갈색' },
  { color: '#2B2B35', label: '검정', dark: true },
];

/** 도화지 위 사람 크기 (도화지 단위, 가로). 세로는 140/120 배 */
export const FIGURE_BASE = { portrait: 460, scene: 190 } as const;

export const EXPRESSIONS: Expression[] = ['happy', 'calm', 'neutral', 'sad', 'angry', 'scared'];

export const bubbleOf = (id: string | null | undefined) => BUBBLES.find((b) => b.id === id);
export const stampOf = (id: string) => STAMPS.find((s) => s.id === id);
export const skyOf = (id: ArtSky) => SKIES.find((s) => s.id === id)!;

/** 한 사람 그림의 기본 자리: 가운데 */
function portraitFigure(personId: string): ArtFigure {
  return { personId, x: 500, y: 640, scale: 1, expression: 'calm', bubble: null };
}

export function emptyDrawing(kind: Drawing['kind'], subjectId: string | null): Drawing {
  return {
    id: uuid(),
    kind,
    subjectId,
    sky: kind === 'scene' ? 'sunny' : 'sunny',
    figures: kind === 'portrait' && subjectId ? [portraitFigure(subjectId)] : [],
    stamps: [],
    strokes: [],
    createdAt: new Date().toISOString(),
  };
}

const strokeLength = (s: ArtStroke) => {
  let len = 0;
  for (let i = 2; i < s.points.length; i += 2) len += Math.hypot(s.points[i] - s.points[i - 2], s.points[i + 1] - s.points[i - 1]);
  return len;
};

/** 크레용 사용: 어두운 색(검정·빨강) 비율과, 얼굴 위를 덧칠했는지 */
export function crayonStats(d: Drawing) {
  const total = d.strokes.reduce((a, s) => a + strokeLength(s), 0);
  const darkSet = new Set(CRAYONS.filter((c) => c.dark).map((c) => c.color));
  const dark = d.strokes.filter((s) => darkSet.has(s.color)).reduce((a, s) => a + strokeLength(s), 0);
  // 얼굴 위 덧칠: 인물화의 주인공 얼굴 둘레 안에 찍힌 점 비율
  let onFace = 0;
  let pts = 0;
  const f = d.kind === 'portrait' ? d.figures[0] : undefined;
  if (f) {
    const r = 140 * f.scale;
    const cx = f.x;
    const cy = f.y - 40 * f.scale;
    for (const s of d.strokes)
      for (let i = 0; i < s.points.length; i += 2) {
        pts++;
        if (Math.hypot(s.points[i] - cx, s.points[i + 1] - cy) < r) onFace++;
      }
  }
  return { total, darkRatio: total ? dark / total : 0, faceCovered: pts >= 12 && onFace / pts >= 0.5 };
}

/** 우리 반 그림: 나와의 거리, 서로 옆에 있는 사람, 빠진 선생님 */
export function sceneStats(d: Drawing, people: Person[]) {
  const self = d.figures.find((f) => f.personId === SELF);
  const others = d.figures.filter((f) => f.personId !== SELF);
  const dist = (a: ArtFigure, b: ArtFigure) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.8);
  const distance = self
    ? others.map((f) => {
        const dd = dist(self, f);
        return { personId: f.personId, band: dd < 260 ? ('close' as const) : dd < 520 ? ('mid' as const) : ('far' as const) };
      })
    : [];
  const neighbors: [string, string][] = [];
  for (const f of d.figures) {
    const near = d.figures.filter((g) => g !== f).sort((a, b) => dist(f, a) - dist(f, b))[0];
    if (near && dist(f, near) < 260) {
      const pair = [f.personId, near.personId].sort() as [string, string];
      if (!neighbors.some((p) => p[0] === pair[0] && p[1] === pair[1])) neighbors.push(pair);
    }
  }
  const drawn = new Set(d.figures.map((f) => f.personId));
  const missingTeachers = people.filter((p) => p.kind === 'teacher' && !drawn.has(p.id)).map((p) => p.id);
  return { hasSelf: !!self, distance, neighbors, missingTeachers };
}

function resp(d: Drawing, sessionId: string, targetId: string, value: string, score: number | null, fear: boolean): PlayResponse {
  return {
    id: uuid(),
    sessionId,
    targetType: targetId === SELF ? 'topic' : 'person',
    targetId,
    game: 'art',
    value,
    score,
    fear,
    hesitationMs: 0,
    createdAt: d.createdAt,
  };
}

/**
 * 그림 → 리포트용 응답.
 * 사람마다 표정·말풍선, 인물화는 스탬프(최대 6개)·하늘·크레용, 우리 반 그림은 나와의 거리(점수 없이 기록).
 */
export function artResponses(d: Drawing, people: Person[], sessionId: string): PlayResponse[] {
  const out: PlayResponse[] = [];
  const alive = new Set([SELF, ...people.map((p) => p.id)]);
  for (const f of d.figures) {
    if (!alive.has(f.personId)) continue;
    const face = faceByCode(f.expression);
    if (face) out.push(resp(d, sessionId, f.personId, `face:${f.expression}`, face.score, face.fear));
    const b = bubbleOf(f.bubble);
    if (b) out.push(resp(d, sessionId, f.personId, `bubble:${b.id}`, b.score, b.fear));
  }
  const subject = d.kind === 'portrait' ? d.subjectId : null;
  if (subject && alive.has(subject)) {
    for (const s of d.stamps.slice(0, 6)) {
      const c = stampOf(s.id);
      if (c) out.push(resp(d, sessionId, subject, `stamp:${c.id}`, c.score, c.fear));
    }
    const sky = skyOf(d.sky);
    out.push(resp(d, sessionId, subject, `sky:${sky.id}`, sky.score, sky.fear));
    const cs = crayonStats(d);
    if (cs.total > 200 && cs.darkRatio >= 0.6) out.push(resp(d, sessionId, subject, 'crayon:dark', -1, false));
    if (cs.faceCovered) out.push(resp(d, sessionId, subject, 'crayon:cover', null, false));
  }
  if (d.kind === 'scene') {
    const sky = skyOf(d.sky);
    out.push({ ...resp(d, sessionId, 'class', `sky:${sky.id}`, sky.score, sky.fear), targetType: 'topic' });
    for (const x of sceneStats(d, people).distance) {
      if (alive.has(x.personId)) out.push(resp(d, sessionId, x.personId, `near:${x.band}`, null, false));
    }
  }
  return out;
}

/** 'art' 응답 한 줄 (부모용) */
export function describeArtValue(value: string, who: string): { emoji: string; text: string } {
  const [kind, id] = value.split(':');
  switch (kind) {
    case 'face': {
      const f = faceByCode(id);
      return { emoji: '🎨', text: `그림 속 ${josa(who, '은/는')} '${f?.parentLabel ?? id}'이에요` };
    }
    case 'bubble': {
      const b = bubbleOf(id);
      return { emoji: b?.emoji ?? '💬', text: `그림 속 ${who}의 말풍선: "${b?.text ?? id}"` };
    }
    case 'stamp': {
      const s = stampOf(id);
      return { emoji: s?.emoji ?? '⭐', text: `${who} 그림에 ${s?.emoji ?? ''} ${s?.label ?? id} 스탬프를 찍었어요` };
    }
    case 'sky': {
      const s = SKIES.find((x) => x.id === id);
      return { emoji: s?.emoji ?? '🌈', text: `${who} 그림의 하늘: ${s?.label ?? id}` };
    }
    case 'crayon':
      return id === 'cover'
        ? { emoji: '🖍️', text: `${who} 얼굴 위를 크레용으로 덧칠했어요` }
        : { emoji: '🖍️', text: `${who} 그림에 검정·빨강 크레용을 많이 썼어요` };
    case 'near':
      return { emoji: '📏', text: `우리 반 그림에서 ${josa(who, '을/를')} ${id === 'close' ? '나와 가까이' : id === 'mid' ? '조금 떨어져' : '멀리'} 그렸어요` };
    default:
      return { emoji: '🎨', text: `${who} 그림` };
  }
}

/** 그림 한 장을 부모가 읽을 수 있게 요약 */
export function describeDrawing(d: Drawing, people: Person[], childName: string): string[] {
  const who = makeWho(people, childName);
  const lines: string[] = [];
  for (const f of d.figures) {
    const face = faceByCode(f.expression);
    const b = bubbleOf(f.bubble);
    const size = d.kind === 'portrait' ? (f.scale >= 1.3 ? ' · 아주 크게' : f.scale <= 0.8 ? ' · 작게' : '') : '';
    lines.push(`${who(f.personId)}: ${face?.parentLabel ?? f.expression}${b ? ` · 말풍선 "${b.text}"` : ''}${size}`);
  }
  if (d.stamps.length) {
    const counts = new Map<string, number>();
    for (const s of d.stamps) counts.set(s.id, (counts.get(s.id) ?? 0) + 1);
    lines.push(`스탬프: ${[...counts].map(([id, n]) => `${stampOf(id)?.emoji ?? '?'}${n > 1 ? `×${n}` : ''}`).join(' ')}`);
  }
  const cs = crayonStats(d);
  if (cs.total > 0) {
    const used = [...new Set(d.strokes.map((s) => CRAYONS.find((c) => c.color === s.color)?.label ?? ''))].filter(Boolean);
    lines.push(`크레용: ${used.join('·')}${cs.darkRatio >= 0.6 ? ' (검정·빨강이 많아요)' : ''}${cs.faceCovered ? ' · 얼굴 위를 덧칠했어요' : ''}`);
  }
  lines.push(`하늘: ${skyOf(d.sky).emoji} ${skyOf(d.sky).label}`);
  if (d.kind === 'scene') {
    const st = sceneStats(d, people);
    if (!st.hasSelf) lines.push('자기 자신은 그리지 않았어요');
    const close = st.distance.filter((x) => x.band === 'close').map((x) => who(x.personId));
    const far = st.distance.filter((x) => x.band === 'far').map((x) => who(x.personId));
    if (close.length) lines.push(`나와 가까이 그린 사람: ${close.join(', ')}`);
    if (far.length) lines.push(`멀리 그린 사람: ${far.join(', ')}`);
    const pairs = st.neighbors.filter(([a, b]) => a !== SELF && b !== SELF).map(([a, b]) => `${who(a)}–${who(b)}`);
    if (pairs.length) lines.push(`서로 옆에 그린 사람: ${pairs.join(', ')}`);
    if (st.missingTeachers.length) lines.push(`그리지 않은 선생님: ${st.missingTeachers.map(who).join(', ')}`);
  }
  return lines;
}

/** 사람별로 그림에서 자주 고른 말풍선 (많은 순) */
export function bubbleCounts(drawings: Drawing[], personId: string): { id: string; n: number }[] {
  const m = new Map<string, number>();
  for (const d of drawings) for (const f of d.figures) if (f.personId === personId && f.bubble) m.set(f.bubble, (m.get(f.bubble) ?? 0) + 1);
  return [...m].map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n);
}
