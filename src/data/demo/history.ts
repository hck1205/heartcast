import { FACES, SCENES, WEATHERS } from '@/games/content';
import { FACET_CHOICES } from '@/games/persona';
import { planSession } from '@/games/planner';
import { seededRandom } from '@/lib/random';
import { portraitDiff } from '@/games/portrait';
import { uuid } from '@/lib/util';
import type { Drawing, Persona, Person, PlayResponse, PlaySession, Profile } from '@/types';
import { addDemoDiary } from './diary';
import { addDemoDrawings } from './drawings';
import { newDemoLog } from './log';
import { DEMO_PERSONA } from './people';
import { addDemoRelations } from './relations';

/** 2주치 예시 기록: 공방 → 관계도 → 그림 → 매일 날씨 놀이 */
export function demoHistory(profile: Profile, now = new Date()): { sessions: PlaySession[]; responses: PlayResponse[]; drawings: Drawing[] } {
  const rand = seededRandom(20260930);
  const log = newDemoLog(profile, now);
  const { sessions, responses, miso, danbi } = log;

  // 선생님 공방 기록: 13일 전 처음 만들기, 3일 전 단비 선생님 다시 꾸미기
  const studio = (daysAgo: number, person: Person | undefined, before: Persona | undefined, after: Persona) => {
    if (!person) return;
    const at = new Date(now);
    at.setDate(at.getDate() - daysAgo);
    at.setHours(17, 30, 0, 0);
    const sessionId = uuid();
    responses.push(...portraitDiff(person.id, before, after, sessionId, at));
    sessions.push({ id: sessionId, startedAt: at.toISOString(), finishedAt: at.toISOString() });
  };
  studio(13, miso, undefined, DEMO_PERSONA.miso);
  studio(13, danbi, undefined, DEMO_PERSONA.danbiBefore);
  studio(3, danbi, DEMO_PERSONA.danbiBefore, DEMO_PERSONA.danbiNow);

  addDemoRelations(log);
  addDemoDrawings(log);
  addDemoDiary(log);

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // 주말 제외
    d.setHours(18, 10, 0, 0);
    if (d > now) d.setTime(now.getTime() - 60000);
    const sessionId = uuid();
    const steps = planSession(profile.people, responses, 1000 + daysAgo);
    const recent = daysAgo <= 6;

    steps.forEach((step, i) => {
      const at = new Date(d.getTime() + i * 25000).toISOString();
      // 대상별 "기분 성향"
      let mood = 1.2;
      if (step.targetId === danbi?.id) mood = recent ? -1.3 : 0.6;
      else if (step.targetId === miso?.id) mood = 1.6;
      else if (step.targetId === 'nap') mood = 0.2;
      else if (step.targetId === 'class') mood = recent ? 0.3 : 1.1;
      else if (step.targetId === 'self') mood = recent ? 0.4 : 1.2;
      const noisy = Math.max(-2, Math.min(2, Math.round(mood + (rand() - 0.5) * 1.6)));

      let value: string;
      let score: number;
      let fear = false;
      if (step.game === 'weather') {
        const w = WEATHERS.find((x) => x.score === noisy)!;
        value = w.code;
        score = w.score;
      } else if (step.game === 'face') {
        const opts = FACES.filter((f) => f.score === noisy);
        const f = opts[Math.floor(rand() * opts.length)];
        value = f.code;
        score = f.score;
        fear = f.fear;
      } else if (step.game === 'portrait') {
        const choices = FACET_CHOICES[step.facet ?? 'animal'];
        const best = Math.min(...choices.map((c) => Math.abs(c.score - noisy)));
        const opts = choices.filter((c) => Math.abs(c.score - noisy) === best);
        const c = opts[Math.floor(rand() * opts.length)];
        value = `${step.facet ?? 'animal'}:${c.id}`;
        score = c.score;
        fear = c.fear;
      } else {
        const scene = SCENES.find((s) => s.id === step.sceneId)!;
        const opts = scene.reactions.filter((r) => (noisy <= -1 ? r.score < 0 : r.score >= noisy - 1 && r.score > 0));
        const r = opts[Math.floor(rand() * opts.length)] ?? scene.reactions[0];
        value = `${scene.id}:${r.code}`;
        score = r.score;
        fear = r.fear;
      }
      responses.push({
        id: uuid(),
        sessionId,
        targetType: step.targetType,
        targetId: step.targetId,
        game: step.game,
        value,
        score,
        fear,
        hesitationMs: 1200 + Math.round(rand() * 4000),
        createdAt: at,
      });
    });
    sessions.push({ id: sessionId, startedAt: d.toISOString(), finishedAt: new Date(d.getTime() + 200000).toISOString() });
  }
  return { sessions, responses, drawings: log.drawings };
}
