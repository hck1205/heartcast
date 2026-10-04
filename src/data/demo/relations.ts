import { relationResponse, SELF, type RelationId } from '@/games/relations';
import { uuid } from '@/lib/util';
import type { DemoLog } from './log';

/** 관계도 놀이 기록: 처음엔 편안한 관계, 최근엔 단비 선생님 쪽으로 걱정되는 선이 생긴다 */
export function addDemoRelations(log: DemoLog) {
  const { byName, miso, danbi, director } = log;
  const link = (daysAgo: number, from: string | undefined, rel: RelationId, to: string | undefined) => {
    if (!from || !to) return;
    const r = relationResponse(from, rel, to, uuid(), { at: log.at(daysAgo, 18, 40) });
    log.responses.push(r);
    log.sessions.push({ id: r.sessionId, startedAt: r.createdAt, finishedAt: r.createdAt });
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
  // 어른들 사이 (두 사람 질문)
  link(6, director, 'laugh', miso?.id);
  link(2, director, 'fight', danbi?.id);
  link(4, miso?.id, 'close', byName('우리 엄마'));
}
