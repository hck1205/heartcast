import type { Drawing, Person, PlayResponse, PlaySession, Profile } from '@/types';

/** 예시 기록을 쌓는 통: 세션·응답·그림과, 날짜·사람 찾기 도우미 */
export interface DemoLog {
  profile: Profile;
  now: Date;
  sessions: PlaySession[];
  responses: PlayResponse[];
  drawings: Drawing[];
  miso?: Person;
  danbi?: Person;
  director?: string;
  byName: (name: string) => string | undefined;
  /** daysAgo 일 전 hh:mm (지금보다 늦으면 지금 조금 전으로) */
  at: (daysAgo: number, h: number, m: number, back?: number) => Date;
}

export function newDemoLog(profile: Profile, now: Date): DemoLog {
  const [miso, danbi] = profile.people;
  return {
    profile,
    now,
    sessions: [],
    responses: [],
    drawings: [],
    miso,
    danbi,
    director: profile.people.find((p) => p.role === 'director')?.id,
    byName: (n) => profile.people.find((p) => p.name === n)?.id,
    at: (daysAgo, h, m, back = 30000) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(h, m, 0, 0);
      if (d > now) d.setTime(now.getTime() - back);
      return d;
    },
  };
}
