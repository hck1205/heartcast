/** 응답 하나를 부모가 읽을 수 있는 문장으로 (날씨·표정·이야기·이미지·관계도·그림) */
import { describeArtValue } from '@/games/art';
import { deviceOf, parseDiaryValue } from '@/games/diary';
import { faceByCode, sceneById, weatherByCode, WEATHERS } from '@/games/content';
import { makeWho, NOBODY, UNKNOWN } from '@/games/people';
import { choiceEmoji, FACET_LABEL, findChoice, type PersonaFacet } from '@/games/persona';
import { parsePortraitValue } from '@/games/portrait';
import { edgeSentence, parseRelationValue, relationOf } from '@/games/relations';
import { josa } from '@/lib/josa';
import type { Person, PlayResponse, WeatherCode } from '@/types';
import { targetName } from './summary';

/** '토끼'를 처럼 따옴표 뒤에 조사를 붙인다 */
const quoted = (word: string, pair: `${string}/${string}`) => `'${word}'${josa(word, pair).slice(word.length)}`;

/** 한 응답을 부모가 읽을 수 있는 문장으로 */
export function describeResponse(r: PlayResponse, people: Person[], childName = '아이'): { emoji: string; text: string } {
  const who = targetName(r.targetType, r.targetId, people);
  if (r.value === 'unknown') return { emoji: '🤔', text: `${who}: "잘 모르겠어"를 골랐어요` };
  if (r.game === 'relation') return describeRelation(r, people, childName);
  if (r.game === 'diary') {
    const d = parseDiaryValue(r.value);
    if (!d) return { emoji: '📔', text: `${who}의 그림일기` };
    const dev = deviceOf(d.device)!;
    return { emoji: d.choice.emoji === '●' ? '🎨' : d.choice.emoji, text: `그림일기: ${who}의 ${dev.label}로 '${d.choice.label}'(${d.choice.parentLabel})${josa(d.choice.label, '을/를').slice(d.choice.label.length)} 골랐어요` };
  }
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

const weatherEmoji: Record<WeatherCode, string> = {
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
