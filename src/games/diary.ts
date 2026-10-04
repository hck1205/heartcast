import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import type { PlayResponse } from '@/types';
import { DIARY_DEVICES, deviceOf, findDiaryChoice, type DiaryChoice, type DiaryDevice, type DiaryDeviceId } from './diaryDevices';

/** 그림일기 한 장의 로직: 고르기 · 응답 만들기/되살리기 · 일기 문장 · 지난 장과 비교. 칸 목록은 diaryDevices 에 있다 */
export * from './diaryDevices';

/** 한 장의 일기: 사람 한 명, 칸마다 고른 것 */
export interface DiaryPage {
  id: string;
  personId: string;
  at: string;
  picks: Partial<Record<DiaryDeviceId, string[]>>;
}

export const emptyPage = (personId: string): DiaryPage => ({ id: uuid(), personId, at: new Date().toISOString(), picks: {} });

/** 칸 하나 고르기/빼기 (여러 개 칸은 최대 개수까지 쌓고, 넘치면 가장 먼저 고른 것을 뺀다) */
export function togglePick(page: DiaryPage, device: DiaryDeviceId, id: string): DiaryPage {
  const d = deviceOf(device);
  const cur = page.picks[device] ?? [];
  let next: string[];
  if (cur.includes(id)) next = cur.filter((v) => v !== id);
  else if (d?.multi) next = [...cur, id].slice(-d.multi);
  else next = [id];
  const picks = { ...page.picks, [device]: next };
  if (!next.length) delete picks[device];
  return { ...page, picks };
}

export const filledCount = (page: DiaryPage) => Object.values(page.picks).filter((v) => v && v.length).length;

/** 일기 한 장 → 응답 (고른 칸마다 하나, 여러 개 칸은 고른 개수만큼) */
export function diaryResponses(page: DiaryPage): PlayResponse[] {
  const out: PlayResponse[] = [];
  for (const d of DIARY_DEVICES) {
    for (const id of page.picks[d.id] ?? []) {
      const ch = findDiaryChoice(d.id, id);
      if (!ch) continue;
      out.push({
        id: uuid(),
        sessionId: page.id,
        targetType: 'person',
        targetId: page.personId,
        game: 'diary',
        value: `${d.id}:${id}`,
        score: ch.score,
        fear: ch.fear,
        hesitationMs: 0,
        createdAt: page.at,
      });
    }
  }
  return out;
}

export function parseDiaryValue(value: string): { device: DiaryDeviceId; choice: DiaryChoice } | null {
  const [device, id] = value.split(':');
  const ch = id ? findDiaryChoice(device, id) : undefined;
  return ch ? { device: device as DiaryDeviceId, choice: ch } : null;
}

/** 응답에서 일기 장들을 되살린다 (같은 세션 = 한 장, 오래된 순) */
export function diaryPages(responses: PlayResponse[], personId?: string): DiaryPage[] {
  const pages = new Map<string, DiaryPage>();
  for (const r of responses) {
    if (r.game !== 'diary' || (personId && r.targetId !== personId)) continue;
    const parsed = parseDiaryValue(r.value);
    if (!parsed) continue;
    const page = pages.get(r.sessionId) ?? { id: r.sessionId, personId: r.targetId, at: r.createdAt, picks: {} };
    page.picks[parsed.device] = [...(page.picks[parsed.device] ?? []), parsed.choice.id];
    pages.set(r.sessionId, page);
  }
  return [...pages.values()].sort((a, b) => a.at.localeCompare(b.at));
}

/** 고른 칸들을 칸 순서대로 (칸, 고른 것들) */
export function pickedDevices(page: DiaryPage): { device: DiaryDevice; picks: DiaryChoice[] }[] {
  return DIARY_DEVICES.filter((d) => page.picks[d.id]?.length).map((d) => ({
    device: d,
    picks: page.picks[d.id]!.map((id) => findDiaryChoice(d.id, id)).filter((p): p is DiaryChoice => !!p),
  }));
}

/** 아이 말투의 일기 문장 */
export function diarySentence(page: DiaryPage, who: string): string {
  const lines = pickedDevices(page).map(({ device, picks }) => device.line(who, picks));
  if (!lines.length) return '';
  return [`오늘 ${josa(who, '은/는')}`, ...lines].join(' ');
}

/** 점수가 있는 칸들의 평균 (없으면 null) */
export function pageScore(page: DiaryPage): number | null {
  const scores = pickedDevices(page).flatMap(({ picks }) => picks.map((p) => p.score)).filter((s): s is number => s !== null);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

export const pageFears = (page: DiaryPage) => pickedDevices(page).flatMap(({ device, picks }) => picks.filter((p) => p.fear).map((p) => ({ device, choice: p })));

export interface DiaryChange {
  device: DiaryDevice;
  before: DiaryChoice[];
  after: DiaryChoice[];
}

/** 두 장 비교: 둘 다 채운 칸 가운데 바뀐 것 / 그대로인 것 */
export function compareDiary(prev: DiaryPage | undefined, cur: DiaryPage): { changed: DiaryChange[]; same: DiaryChange[] } {
  const changed: DiaryChange[] = [];
  const same: DiaryChange[] = [];
  if (!prev) return { changed, same };
  const a = new Map(pickedDevices(prev).map((p) => [p.device.id, p.picks]));
  for (const { device, picks } of pickedDevices(cur)) {
    const before = a.get(device.id);
    if (!before) continue;
    const key = (ps: DiaryChoice[]) => ps.map((p) => p.id).sort().join(',');
    (key(before) === key(picks) ? same : changed).push({ device, before, after: picks });
  }
  return { changed, same };
}

const pickText = (ps: DiaryChoice[]) => ps.map((p) => (p.color ? p.label : `${p.emoji} ${p.label}`)).join(', ');

/** 아이에게 읽어 줄 비교 한 줄: "지난번엔 🐶 강아지 같았는데, 오늘은 🐰 토끼 같았어" */
export function changeLine(ch: DiaryChange): string {
  return `${ch.device.label}: 지난번엔 ${pickText(ch.before)}, 오늘은 ${pickText(ch.after)}`;
}


/** 부모용 한 단어: "🐶 강아지(친근함)" (뜻풀이에 이름이 이미 있으면 겹치지 않게) */
const parentWord = (p: DiaryChoice) => {
  const word = p.parentLabel.startsWith(p.label) ? p.parentLabel : p.label.includes(p.parentLabel) ? p.label : `${p.label}(${p.parentLabel})`;
  return p.color ? word : `${p.emoji} ${word}`;
};
export const parentWords = (ps: DiaryChoice[]) => ps.map(parentWord).join(', ');
