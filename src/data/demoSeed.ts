import { FACES, SCENES, WEATHERS } from '@/games/content';
import { FACET_CHOICES } from '@/games/persona';
import { planSession, seededRandom } from '@/games/planner';
import { portraitDiff } from '@/games/portrait';
import { relationResponse, SELF, type RelationId } from '@/games/relations';
import { hashPin, uuid } from '@/lib/util';
import type { AvatarConfig, Persona, Person, PlayResponse, PlaySession, Profile } from '@/types';

/**
 * "먼저 둘러보기"용 예시 데이터: 2주치 놀이 기록.
 * 한 선생님(해님반 '미소')은 대체로 맑고, 다른 선생님('단비')은 최근 흐려지며
 * 무서운 장면 선택이 섞이도록 만들어 리포트의 신호 기능을 보여준다.
 */
const DEMO_PERSONA: Record<'miso' | 'danbiBefore' | 'danbiNow', Persona> = {
  miso: { color: 'sun', animal: 'rabbit', shape: 'heart', traits: ['kind', 'smiles', 'praises'] },
  // 처음엔 강아지·하늘색·구름이었는데, 최근 다시 꾸밀 때 사자·빨강·번개로 바뀐 흐름
  danbiBefore: { color: 'sky', animal: 'puppy', shape: 'cloud', traits: ['plays', 'fun'] },
  danbiNow: { color: 'red', animal: 'lion', shape: 'bolt', traits: ['yells', 'busy'] },
};

const friend = (name: string, avatar: Partial<AvatarConfig>): Person => ({
  id: uuid(),
  kind: 'friend',
  name,
  avatar: { skin: 'light', hair: 'bobBangs', hairColor: '#2F2320', shirt: '#A8CFF2', ...avatar, age: 'kid' },
});
const grownup = (name: string, avatar: Partial<AvatarConfig>): Person => ({
  id: uuid(),
  kind: 'parent',
  name,
  avatar: { skin: 'light', hair: 'dandy', hairColor: '#2F2320', shirt: '#EBCDB0', age: 'adult', ...avatar },
});

export function demoProfile(): Profile {
  const people: Person[] = [
    {
      id: uuid(),
      kind: 'teacher',
      name: '미소',
      avatar: { skin: 'light', age: 'adult', faceShape: 'oval', eyes: 'smile', brows: 'arched', cheeks: 'blush', hair: 'ponytail', hairColor: '#4A3226', top: 'apron', pattern: 'dots', shirt: '#F4A6A0', glasses: 'none', headwear: 'scrunchie', nameTag: true, mouth: 'lips', earrings: 'stud', neckwear: 'whistle' },
      persona: DEMO_PERSONA.miso,
    },
    {
      id: uuid(),
      kind: 'teacher',
      name: '단비',
      avatar: { skin: 'porcelain', age: 'adult', faceShape: 'long', eyes: 'narrow', brows: 'thick', cheeks: 'none', hair: 'blunt', hairColor: '#1E1B1A', top: 'turtleneck', pattern: 'none', shirt: '#8FA7C9', glasses: 'horn', headwear: 'none', nameTag: true, nose: 'tall', mouth: 'flat', neckwear: 'lanyard' },
      persona: DEMO_PERSONA.danbiNow,
    },
    {
      id: uuid(),
      kind: 'friend',
      name: '하준',
      avatar: { skin: 'medium', age: 'kid', faceShape: 'round', eyes: 'big', hair: 'gail', hairColor: '#2F2320', top: 'track', pattern: 'none', shirt: '#AEDCC0', headwear: 'none', mouth: 'teeth' },
      persona: { color: 'grass', animal: 'puppy', shape: 'star', traits: ['fun', 'plays'] },
    },
    {
      id: uuid(),
      kind: 'friend',
      name: '서아',
      avatar: { skin: 'porcelain', age: 'kid', faceShape: 'heart', eyes: 'double', hair: 'braids', hairColor: '#7A5236', top: 'dress', pattern: 'flower', shirt: '#FFD58A', headwear: 'bigBow', cheeks: 'freckles' },
      persona: { color: 'pink', animal: 'rabbit', shape: 'heart', traits: ['kind', 'smiles'] },
    },
    friend('도윤', { skin: 'warm', faceShape: 'square', eyes: 'narrow', brows: 'thick', hair: 'buzz', hairColor: '#1E1B1A', top: 'hoodie', shirt: '#5E6B7D', mouth: 'flat' }),
    friend('지우', { skin: 'snow', faceShape: 'oval', eyes: 'lashes', hair: 'pigtails', hairColor: '#4A3226', top: 'overalls', shirt: '#F7C3D8', headwear: 'pin', cheeks: 'blush' }),
    friend('민준', { skin: 'light', faceShape: 'chubby', eyes: 'round', hair: 'comma', hairColor: '#2F2320', top: 'shirt', pattern: 'check', shirt: '#A8CFF2', glasses: 'round' }),
    friend('하윤', { skin: 'tan', faceShape: 'baby', eyes: 'sparkle', hair: 'doubleBun', hairColor: '#7A5236', top: 'cardigan', shirt: '#F4EDA0', mouth: 'cat' }),
    grownup('우리 엄마', { skin: 'light', faceShape: 'oval', eyes: 'double', hair: 'wave', hairColor: '#4A3226', top: 'shirt', shirt: '#EBCDB0', earrings: 'hoop', mouth: 'lips' }),
    grownup('우리 아빠', { skin: 'warm', faceShape: 'square', eyes: 'basic', brows: 'thick', hair: 'dandy', hairColor: '#1E1B1A', top: 'sweatshirt', shirt: '#34466B', glasses: 'square', facialHair: 'stubble' }),
    grownup('하준이 엄마', { skin: 'medium', faceShape: 'heart', eyes: 'smile', hair: 'lowPony', hairColor: '#2F2320', top: 'cardigan', shirt: '#AEDCC0' }),
    grownup('할머니', { skin: 'light', age: 'senior', faceShape: 'round', eyes: 'smile', hair: 'bun', hairColor: '#EDEBE6', top: 'cardigan', pattern: 'flower', shirt: '#C9B8F0', glasses: 'gold' }),
  ];
  return {
    child: {
      id: uuid(),
      name: '콩이',
      className: '햇님반',
      avatar: { skin: 'light', age: 'kid', faceShape: 'round', eyes: 'big', hair: 'bobBangs', hairColor: '#2F2320', top: 'sweatshirt', pattern: 'none', shirt: '#C9B8F0' },
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

  // 관계도 놀이 기록: 처음엔 편안한 관계, 최근엔 단비 선생님 쪽으로 걱정되는 선이 생긴다
  const byName = (n: string) => profile.people.find((p) => p.name === n)?.id;
  const link = (daysAgo: number, from: string | undefined, rel: RelationId, to: string | undefined) => {
    if (!from || !to) return;
    const at = new Date(now);
    at.setDate(at.getDate() - daysAgo);
    at.setHours(18, 40, 0, 0);
    if (at > now) at.setTime(now.getTime() - 30000);
    const r = relationResponse(from, rel, to, uuid(), { at });
    responses.push(r);
    sessions.push({ id: r.sessionId, startedAt: r.createdAt, finishedAt: r.createdAt });
  };
  link(12, SELF, 'close', byName('하준'));
  link(12, byName('하준'), 'close', byName('서아'));
  link(12, SELF, 'runto', miso?.id);
  link(12, miso?.id, 'praise', SELF);
  link(12, byName('우리 엄마'), 'family', SELF);
  link(12, byName('우리 아빠'), 'family', SELF);
  link(12, byName('할머니'), 'family', SELF);
  link(12, byName('하준이 엄마'), 'family', byName('하준'));
  link(11, danbi?.id, 'help', byName('지우'));
  link(10, byName('지우'), 'play', byName('하윤'));
  link(9, byName('민준'), 'play', byName('도윤'));
  link(3, danbi?.id, 'yell', SELF);
  link(3, danbi?.id, 'yell', byName('도윤'));
  link(2, SELF, 'scare', danbi?.id);
  link(2, SELF, 'fight', byName('도윤'));
  link(1, SELF, 'close', byName('서아'));

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
  return { sessions, responses };
}

/** 예시 기록을 기존 프로필에 넣을 때, 이미지가 없는 선생님에게 예시 이미지를 채운다 */
export function withDemoPersonas(profile: Profile): Profile {
  const fallback = [DEMO_PERSONA.miso, DEMO_PERSONA.danbiNow];
  let t = 0;
  return {
    ...profile,
    people: profile.people.map((p) => (p.kind === 'teacher' && !p.persona && t < 2 ? { ...p, persona: fallback[t++] } : p)),
  };
}
