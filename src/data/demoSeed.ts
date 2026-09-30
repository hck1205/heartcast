import { FACES, SCENES, WEATHERS } from '@/games/content';
import { planSession, seededRandom } from '@/games/planner';
import { hashPin, uuid } from '@/lib/util';
import type { Person, PlayResponse, PlaySession, Profile } from '@/types';

/**
 * "먼저 둘러보기"용 예시 데이터: 2주치 놀이 기록.
 * 한 선생님(해님반 '미소')은 대체로 맑고, 다른 선생님('단비')은 최근 흐려지며
 * 무서운 장면 선택이 섞이도록 만들어 리포트의 신호 기능을 보여준다.
 */
export function demoProfile(): Profile {
  const people: Person[] = [
    { id: uuid(), kind: 'teacher', name: '미소', avatar: { skin: 'peach', hair: 'long', hairColor: '#6B4226', shirt: '#FF9EC4', accessory: 'flower' } },
    { id: uuid(), kind: 'teacher', name: '단비', avatar: { skin: 'light', hair: 'bob', hairColor: '#1F1F1F', shirt: '#4FB3FF', accessory: 'glasses' } },
    { id: uuid(), kind: 'friend', name: '하준', avatar: { skin: 'tan', hair: 'spiky', hairColor: '#3B2A20', shirt: '#7BD389', accessory: 'cap' } },
    { id: uuid(), kind: 'friend', name: '서아', avatar: { skin: 'light', hair: 'pigtails', hairColor: '#A0652D', shirt: '#FFD84D', accessory: 'ribbon' } },
  ];
  return {
    child: {
      id: uuid(),
      name: '콩이',
      className: '햇님반',
      avatar: { skin: 'peach', hair: 'curly', hairColor: '#6B4226', shirt: '#FF8A5B', accessory: 'none' },
    },
    people,
    pinHash: hashPin('0000'),
    stars: 42,
    stickers: ['🦄', '🌈', '🐳', '🍓', '🚀'],
    onboardedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  };
}

export function demoHistory(profile: Profile, now = new Date()): { sessions: PlaySession[]; responses: PlayResponse[] } {
  const rand = seededRandom(20260930);
  const [miso, danbi] = profile.people;
  const sessions: PlaySession[] = [];
  const responses: PlayResponse[] = [];

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
  return { sessions, responses };
}
