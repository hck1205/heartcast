import { artResponses, emptyDrawing } from '@/games/art';
import { SELF } from '@/games/people';
import { uuid } from '@/lib/util';
import type { Drawing } from '@/types';
import type { DemoLog } from './log';

/** 그림 놀이: 단비 선생님(화난 얼굴·"조용히 해!"·번개), 미소 선생님(웃는 얼굴·하트), 우리 반 그림 */
export function addDemoDrawings(log: DemoLog) {
  const { byName, miso, danbi, director } = log;
  const draw = (daysAgo: number, d: Drawing) => {
    const dd = { ...d, createdAt: log.at(daysAgo, 19, 0, 20000).toISOString() };
    log.drawings.push(dd);
    const sessionId = uuid();
    log.responses.push(...artResponses(dd, log.profile.people, sessionId));
    log.sessions.push({ id: sessionId, startedAt: dd.createdAt, finishedAt: dd.createdAt });
  };
  if (danbi) {
    const d = emptyDrawing('portrait', danbi.id);
    draw(4, {
      ...d,
      sky: 'storm',
      figures: [{ ...d.figures[0], scale: 1.4, expression: 'angry', bubble: 'quiet' }],
      stamps: [
        { id: 'bolt', x: 180, y: 380 },
        { id: 'bolt', x: 830, y: 420 },
        { id: 'tear', x: 160, y: 900 },
      ],
      strokes: [{ color: '#2B2B35', points: [120, 1080, 260, 1020, 400, 1100, 560, 1010, 720, 1090, 880, 1020] }],
    });
    draw(1, {
      ...d,
      id: uuid(),
      sky: 'rainy',
      figures: [{ ...d.figures[0], scale: 1.2, expression: 'angry', bubble: 'shout' }],
      stamps: [{ id: 'fire', x: 820, y: 300 }],
      strokes: [{ color: '#E5484D', points: [300, 520, 420, 470, 560, 520, 680, 470] }],
    });
  }
  if (miso) {
    const d = emptyDrawing('portrait', miso.id);
    draw(5, {
      ...d,
      figures: [{ ...d.figures[0], expression: 'happy', bubble: 'good' }],
      stamps: [
        { id: 'heart', x: 170, y: 420 },
        { id: 'heart', x: 840, y: 470 },
        { id: 'flower', x: 180, y: 1000 },
        { id: 'star', x: 820, y: 1020 },
      ],
      strokes: [{ color: '#FFD23F', points: [100, 1150, 300, 1120, 500, 1160, 700, 1120, 900, 1150] }],
    });
  }
  const seoa = byName('서아');
  draw(2, {
    ...emptyDrawing('scene', null),
    figures: [
      { personId: SELF, x: 330, y: 960, scale: 1, expression: 'happy', bubble: null },
      ...(seoa ? [{ personId: seoa, x: 520, y: 980, scale: 1, expression: 'happy' as const, bubble: 'play' }] : []),
      ...(miso ? [{ personId: miso.id, x: 200, y: 700, scale: 1, expression: 'happy' as const, bubble: null }] : []),
      ...(danbi ? [{ personId: danbi.id, x: 840, y: 640, scale: 1, expression: 'angry' as const, bubble: 'shout' }] : []),
      ...(director ? [{ personId: director, x: 860, y: 920, scale: 1, expression: 'neutral' as const, bubble: 'silent' }] : []),
    ],
    stamps: [{ id: 'heart', x: 430, y: 820 }],
  });
}
