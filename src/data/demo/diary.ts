import { diaryResponses, type DiaryDeviceId, type DiaryPage } from '@/games/diary';
import { uuid } from '@/lib/util';
import type { DemoLog } from './log';

type Picks = Partial<Record<DiaryDeviceId, string[]>>;

/** 그림일기 기록: 미소 선생님은 늘 포근하고, 단비 선생님은 최근 들어 무섭게 바뀐다 */
export function addDemoDiary(log: DemoLog) {
  const { byName, miso, danbi } = log;
  const page = (daysAgo: number, personId: string | undefined, picks: Picks) => {
    if (!personId) return;
    const p: DiaryPage = { id: uuid(), personId, at: log.at(daysAgo, 19, 5).toISOString(), picks };
    const rs = diaryResponses(p);
    log.responses.push(...rs);
    log.sessions.push({ id: p.id, startedAt: p.at, finishedAt: p.at });
  };
  page(12, miso?.id, { weather: ['sunny'], face: ['happy'], animal: ['rabbit'], voice: ['normal'], action: ['hug', 'read'], heart: ['cozy'], distance: ['close'] });
  page(5, miso?.id, { weather: ['sunny'], animal: ['koala'], bubble: ['okay'], temp: ['blanket'], taste: ['honey'], distance: ['near'] });
  page(1, miso?.id, { weather: ['partly'], face: ['calm'], animal: ['rabbit'], action: ['praise'], heart: ['excited'], sound: ['song'] });

  page(11, danbi?.id, { weather: ['sunny'], face: ['happy'], animal: ['puppy'], voice: ['normal'], action: ['play'], size: ['adult'], distance: ['near'] });
  page(6, danbi?.id, { weather: ['cloudy'], face: ['neutral'], animal: ['cat'], voice: ['loud'], action: ['busy'], size: ['adult'], distance: ['bitfar'] });
  page(3, danbi?.id, { weather: ['stormy'], face: ['angry'], animal: ['lion'], voice: ['roar'], bubble: ['quiet'], action: ['yell', 'glare'], heart: ['scared'], size: ['house'], distance: ['far'], temp: ['fire'] });
  page(0, danbi?.id, { weather: ['rainy'], face: ['angry'], animal: ['tiger'], voice: ['roar'], heart: ['nervous'], size: ['sky'], sound: ['bang'], taste: ['pepper'] });

  page(9, byName('서아'), { weather: ['sunny'], face: ['happy'], animal: ['penguin'], action: ['play'], heart: ['excited'], sound: ['laugh'] });
  page(2, byName('서아'), { weather: ['sunny'], animal: ['puppy'], action: ['play', 'help'], distance: ['close'], taste: ['candy'] });
}
