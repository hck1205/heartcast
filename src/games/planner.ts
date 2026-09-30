import type { GameType, Person, PlayResponse, TargetType, TopicId } from '@/types';
import { SCENES } from './content';

export interface Step {
  game: GameType;
  targetType: TargetType;
  targetId: string;
  sceneId?: string;
}

/** 작은 시드 난수 (테스트에서 결정적으로 돌리기 위함) */
export function seededRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 최근에 적게 물어본 대상을 먼저 고른다 → 선생님별로 고르게 데이터가 쌓인다. */
function leastAsked(candidates: string[], history: PlayResponse[], rand: () => number): string[] {
  const counts = new Map(candidates.map((id) => [id, 0]));
  for (const r of history) if (counts.has(r.targetId)) counts.set(r.targetId, counts.get(r.targetId)! + 1);
  return shuffle(candidates, rand).sort((a, b) => counts.get(a)! - counts.get(b)!);
}

/**
 * 오늘의 놀이 코스 (약 6문항).
 * 선생님만 묻지 않고 친구·밥·낮잠·나 자신을 섞어서 "평가"가 아닌 "놀이"로 느끼게 한다.
 */
export function planSession(people: Person[], history: PlayResponse[], seed = Date.now()): Step[] {
  const rand = seededRandom(seed);
  const teachers = leastAsked(people.filter((p) => p.kind === 'teacher').map((p) => p.id), history, rand);
  const friends = leastAsked(people.filter((p) => p.kind === 'friend').map((p) => p.id), history, rand);
  const sideTopics = shuffle<TopicId>(['meal', 'nap', 'play'], rand);

  const steps: Step[] = [];
  steps.push({ game: 'weather', targetType: 'topic', targetId: 'self' });

  if (teachers[0]) steps.push({ game: 'weather', targetType: 'person', targetId: teachers[0] });
  if (friends[0]) steps.push({ game: 'weather', targetType: 'person', targetId: friends[0] });
  else steps.push({ game: 'weather', targetType: 'topic', targetId: sideTopics[1] });

  const faceTeacher = teachers[1] ?? teachers[0];
  if (faceTeacher) steps.push({ game: 'face', targetType: 'person', targetId: faceTeacher });
  steps.push({ game: 'weather', targetType: 'topic', targetId: sideTopics[0] });

  if (teachers[0]) {
    const recentScenes = new Set(history.slice(-12).filter((r) => r.game === 'story').map((r) => r.value.split(':')[0]));
    const fresh = SCENES.filter((s) => !recentScenes.has(s.id));
    const pool = fresh.length ? fresh : SCENES;
    const scene = pool[Math.floor(rand() * pool.length)];
    const storyTeacher = teachers[2] ?? teachers[0];
    steps.push({ game: 'story', targetType: 'person', targetId: storyTeacher, sceneId: scene.id });
  }

  steps.push({ game: 'weather', targetType: 'topic', targetId: 'class' });
  return steps;
}
