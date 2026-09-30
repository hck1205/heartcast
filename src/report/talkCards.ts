import { josa } from '@/lib/josa';
import type { Signal } from './analyze';

export interface TalkCard {
  id: string;
  title: string;
  when: string;
  openQuestions: string[];
  empathy: string[];
  avoid: string[];
  tip: string;
}

const COMMON_EMPATHY = ['"그랬구나~ 그런 마음이 들었구나."', '"말해줘서 고마워. 엄마(아빠)는 네 편이야."'];
const COMMON_AVOID = [
  '"선생님이 때렸어? 혼냈어?"처럼 답이 정해진 질문 (아이는 어른이 원하는 답을 하기 쉬워요)',
  '아이 앞에서 선생님을 나쁘게 말하기',
  '같은 질문을 여러 번 되묻기',
];

function nameOf(s: Signal) {
  return s.targetName;
}

export function talkCardFor(signal: Signal): TalkCard {
  const who = nameOf(signal);
  switch (signal.kind) {
    case 'fear':
      return {
        id: signal.id,
        title: '무서웠던 장면, 천천히 들어주기',
        when: signal.title,
        openQuestions: [
          `"마음날씨 놀이에서 ${who} 이야기 나왔지? 그때 어떤 모습이 떠올랐어?"`,
          '"어린이집에서 깜짝 놀랐던 적 있었어? 어떤 일이었는지 그림으로 그려줄래?"',
          '"그때 너는 어떤 마음이었어? 몸은 어땠어?"',
        ],
        empathy: ['"그랬구나, 많이 놀랐겠다."', ...COMMON_EMPATHY],
        avoid: COMMON_AVOID,
        tip: '한 번의 대화로 결론 내리지 마세요. 며칠에 걸쳐 편안한 시간(목욕, 잠들기 전)에 가볍게 이어가세요. 걱정이 계속되면 담임·원장님과 차분히 상담하고, 필요하면 CCTV 열람을 요청할 수 있어요.',
      };
    case 'streak':
    case 'low':
    case 'drop':
      return {
        id: signal.id,
        title: '흐린 날씨의 이유 궁금해하기',
        when: signal.title,
        openQuestions: [
          `"${who} 머리 위에 비구름을 붙였던데, 왜 그렇게 생각했어?"`,
          `"${josa(who, '이랑/랑')} 있을 때 제일 좋은 건 뭐야? 조금 싫은 건 뭐야?"`,
          '"내일은 어떤 날씨가 되면 좋겠어? 어떻게 하면 해님이 나올까?"',
        ],
        empathy: COMMON_EMPATHY,
        avoid: COMMON_AVOID,
        tip: '좋은 점과 싫은 점을 함께 물으면 아이가 부담 없이 이야기해요. 아이의 표현은 그날 기분에 따라 달라질 수 있으니 추이를 함께 봐 주세요.',
      };
    case 'self-low':
      return {
        id: signal.id,
        title: '아이 마음 먼저 안아주기',
        when: signal.title,
        openQuestions: [
          '"요즘 마음 날씨가 비가 많이 왔네. 무슨 일이 있었어?"',
          '"어린이집 가기 전에는 어떤 기분이 들어?"',
          '"기분이 좋아지려면 뭐가 있으면 좋을까?"',
        ],
        empathy: ['"그랬구나. 요즘 마음이 좀 무거웠구나."', ...COMMON_EMPATHY],
        avoid: ['"그 정도는 괜찮아"처럼 감정을 작게 만들기', ...COMMON_AVOID.slice(2)],
        tip: '수면, 식사, 몸 컨디션이 원인인 경우도 많아요. 함께 놀며 충분히 안아주는 시간이 가장 좋은 대화가 돼요.',
      };
    case 'bright':
    default:
      return {
        id: signal.id,
        title: '좋은 마음 함께 기뻐하기',
        when: signal.title,
        openQuestions: [
          `"${who} 머리 위에 해님을 붙였네! 어떤 점이 좋아?"`,
          `"${josa(who, '이랑/랑')} 오늘 뭐 하고 놀았어?"`,
        ],
        empathy: ['"와~ 그랬구나! 듣는 엄마(아빠)도 기분 좋다."'],
        avoid: ['좋은 이야기 끝에 바로 다른 걱정거리 꺼내기'],
        tip: '좋았던 경험을 말로 표현하게 도와주면, 힘든 일이 생겼을 때도 말할 수 있는 힘이 자라요. 선생님께 감사 인사를 전해 보는 것도 좋아요.',
      };
  }
}

/** 신호가 없을 때 보여줄 기본 대화 카드 */
export const DAILY_CARD: TalkCard = {
  id: 'daily',
  title: '오늘의 그랬구나 대화',
  when: '특별한 신호가 없을 때도 매일 짧게',
  openQuestions: [
    '"오늘 어린이집 하늘은 어떤 날씨였어?"',
    '"오늘 제일 재미있었던 일 하나만 알려줄래?"',
    '"오늘 속상한 일은 없었어? 없으면 없다고 해도 돼!"',
  ],
  empathy: COMMON_EMPATHY,
  avoid: COMMON_AVOID.slice(0, 2),
  tip: '"그랬구나"로 먼저 받아주고, 이유는 그다음에 물어보세요. 평가하지 않고 들어주는 경험이 쌓이면 아이는 힘든 일도 먼저 이야기해요.',
};
