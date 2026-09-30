import { uuid } from '@/lib/util';
import type { Persona, PlayResponse } from '@/types';
import { findChoice, type PersonaFacet } from './persona';

/** 한 번의 선택을 응답으로 만든다. id 가 null 이면 "잘 모르겠어" */
export function portraitResponse(
  personId: string,
  facet: PersonaFacet,
  id: string | null,
  sessionId: string,
  hesitationMs = 0,
  at = new Date(),
): PlayResponse {
  const c = findChoice(facet, id);
  return {
    id: uuid(),
    sessionId,
    targetType: 'person',
    targetId: personId,
    game: 'portrait',
    value: `${facet}:${c ? c.id : 'unknown'}`,
    score: c ? c.score : null,
    fear: c ? c.fear : false,
    hesitationMs,
    createdAt: at.toISOString(),
  };
}

/**
 * 공방에서 선생님을 완성(또는 다시 꾸미기)했을 때 기록할 응답.
 * 처음이거나 바뀐 항목만 남겨서, 같은 답이 반복 저장돼 리포트가 부풀지 않게 한다.
 */
export function portraitDiff(personId: string, before: Persona | undefined, after: Persona, sessionId: string, at = new Date()): PlayResponse[] {
  const out: PlayResponse[] = [];
  for (const facet of ['color', 'animal', 'shape'] as const) {
    const v = after[facet];
    if (v && v !== before?.[facet]) out.push(portraitResponse(personId, facet, v, sessionId, 0, at));
  }
  const prevTraits = new Set(before?.traits ?? []);
  for (const t of after.traits) if (!prevTraits.has(t)) out.push(portraitResponse(personId, 'trait', t, sessionId, 0, at));
  return out;
}

export function parsePortraitValue(value: string): { facet: PersonaFacet; id: string } | null {
  const [facet, id] = value.split(':');
  if (!['color', 'animal', 'shape', 'trait'].includes(facet) || !id) return null;
  return { facet: facet as PersonaFacet, id };
}
