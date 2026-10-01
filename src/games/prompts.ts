import { josa } from '@/lib/josa';
import type { Profile, TopicId } from '@/types';
import { SCENES, TOPICS } from './content';
import { facetQuestion, nameOf } from './persona';
import type { Step } from './planner';
import { resolveTarget } from './target';

/** 날씨 놀이 한 문항의 질문 (마루가 읽어 준다) */
export function promptFor(step: Step, profile: Profile): string {
  const t = resolveTarget(profile, step.targetType, step.targetId);
  if (!t) return '';
  if (step.game === 'weather') {
    if (t.kind === 'topic') return TOPICS[step.targetId as TopicId].weatherPrompt;
    const who = nameOf(t.person);
    return t.person.kind === 'teacher'
      ? `${who} 머리 위에는 오늘 어떤 날씨가 떠 있을까?`
      : `${josa(who, '이랑/랑')} 놀 때는 어떤 날씨야?`;
  }
  if (step.game === 'face') {
    if (t.kind === 'topic') return '오늘 내 얼굴은 어땠어?';
    return `오늘 ${josa(nameOf(t.person), '은/는')} 어떤 얼굴이었어?`;
  }
  if (step.game === 'portrait' && t.kind === 'person') {
    const who = nameOf(t.person);
    if (step.facet === 'trait') return `오늘 ${who}에게 어울리는 스티커 하나를 골라줘!`;
    return `오늘 ${facetQuestion(step.facet ?? 'animal', t.person.name, t.person.kind, t.person.role)}`;
  }
  const scene = SCENES.find((s) => s.id === step.sceneId)!;
  return scene.prompt.replace('{name}', t.kind === 'person' ? t.person.name : '');
}
