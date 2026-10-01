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
    case 'portrait-shift':
      return {
        id: signal.id,
        title: '달라진 선생님 그림, 궁금해하기',
        when: signal.title,
        openQuestions: [
          `"선생님 공방에서 ${josa(who, '을/를')} 새로 꾸몄더라! 이번엔 왜 이 동물이야?"`,
          `"${josa(who, '이/가')} 이 색깔 같다고 했지? 어떤 점이 그런 것 같아?"`,
          '"예전 그림이랑 지금 그림이랑 뭐가 달라진 것 같아?"',
        ],
        empathy: ['"아~ 그렇게 느꼈구나. 말해줘서 고마워."', ...COMMON_EMPATHY],
        avoid: ['"선생님이 사자처럼 무섭게 했어?"처럼 아이의 그림을 어른이 먼저 해석하기', ...COMMON_AVOID.slice(1)],
        tip: '아이는 말보다 그림·동물·색으로 먼저 마음을 보여줘요. 해석은 아이에게 맡기고, 아이 말 그대로를 대화 기록에 남겨 두면 흐름을 보는 데 도움이 돼요.',
      };
    case 'relation-fear':
      return {
        id: signal.id,
        title: '관계도 속 무서운 선, 천천히 들어주기',
        when: signal.title,
        openQuestions: [
          `"관계도 놀이에서 ${josa(who, '을/를')} 이렇게 이었네. 어떤 때 그런 것 같아?"`,
          '"그때 너는 어디에 있었어? 어떤 마음이 들었어?"',
          '"그럴 때 누가 옆에 있어 주면 좋겠어?"',
        ],
        empathy: ['"그랬구나, 무서웠겠다. 말해줘서 정말 고마워."', ...COMMON_EMPATHY],
        avoid: ['선을 이은 이유를 캐묻거나 "정말이야?" 하고 되묻기', ...COMMON_AVOID],
        tip: '관계도는 아이가 느끼는 마음의 지도예요. 한 번의 선보다 여러 날 같은 선이 이어지는지 함께 보세요. 걱정이 계속되면 담임·원장님과 차분히 상담하고, 필요하면 CCTV 열람을 요청할 수 있어요.',
      };
    case 'art-words':
      return {
        id: signal.id,
        title: '그림 속 말풍선, 그대로 들어주기',
        when: signal.title,
        openQuestions: [
          `"그림에서 ${josa(who, '이/가')} 이렇게 말하고 있네. 언제 이런 말을 해?"`,
          '"그 말을 들으면 너는 어떤 마음이 들어?"',
          '"그때 다른 친구들은 어떻게 했어?"',
        ],
        empathy: ['"그랬구나. 그 말을 들으면 무서웠겠다."', ...COMMON_EMPATHY],
        avoid: ['"정말 그렇게 말했어?" 하고 되묻거나 다그치기', ...COMMON_AVOID],
        tip: 'CCTV에는 말소리가 담기지 않아요. 아이가 그림으로 보여준 말을 날짜와 함께 대화 기록에 그대로 적어 두세요. 같은 말이 계속되면 담임·원장님과 차분히 상담해 보세요.',
      };
    case 'relation-adults':
      return {
        id: signal.id,
        title: '어른들 사이의 분위기 들어보기',
        when: signal.title,
        openQuestions: [
          '"관계도 놀이에서 선생님들 사이를 이렇게 이었네. 어떤 모습을 봤어?"',
          '"그걸 볼 때 너는 어떤 마음이었어?"',
        ],
        empathy: ['"그랬구나. 어른들이 그러면 마음이 불편했겠다."', ...COMMON_EMPATHY],
        avoid: ['아이 앞에서 선생님이나 다른 어른을 평가하기', ...COMMON_AVOID.slice(2)],
        tip: '아이는 어른들 사이의 긴장을 민감하게 느껴요. 한 번의 선택보다는 흐름을 보고, 필요하면 원과 편하게 이야기해 보세요.',
      };
    case 'relation-conflict':
      return {
        id: signal.id,
        title: '친구 사이 마음 들어주기',
        when: signal.title,
        openQuestions: [
          `"${josa(who, '이랑/랑')} 놀 때 어떤 게 재밌어? 어떤 게 속상해?"`,
          '"다툴 때는 보통 어떻게 시작돼?"',
          '"다음에 그런 일이 생기면 어떻게 하고 싶어?"',
        ],
        empathy: ['"그랬구나, 속상했겠다."', ...COMMON_EMPATHY],
        avoid: ['"네가 먼저 그랬지?"처럼 잘잘못부터 따지기', '친구를 나쁜 아이로 부르기'],
        tip: '또래 갈등은 자라면서 자주 생겨요. 아이가 마음을 말로 표현하고, 스스로 해결 방법을 떠올리도록 도와주세요. 같은 친구와의 갈등이 계속되면 선생님과 이야기해 보세요.',
      };
    case 'relation-alone':
      return {
        id: signal.id,
        title: '기댈 사람 함께 찾기',
        when: signal.title,
        openQuestions: [
          '"어린이집에서 무섭거나 슬플 때는 어떻게 해?"',
          '"선생님 중에 말하기 편한 선생님이 있어?"',
          '"엄마(아빠)한테 말하고 싶을 때는 언제든 말해도 돼. 알지?"',
        ],
        empathy: ['"그랬구나. 혼자 참느라 힘들었겠다."', ...COMMON_EMPATHY],
        avoid: ['"선생님한테 말하면 되잖아"처럼 쉽게 답을 정해 주기', ...COMMON_AVOID.slice(1)],
        tip: '힘들 때 도움을 청하는 연습은 아이를 지키는 힘이 돼요. 선생님께 아이가 편하게 기댈 수 있도록 도와 달라고 부탁해 보세요.',
      };
    case 'relation-safe':
      return {
        id: signal.id,
        title: '든든한 어른 함께 기뻐하기',
        when: signal.title,
        openQuestions: [`"${josa(who, '이/가')} 어떻게 도와줘?"`, `"${josa(who, '이랑/랑')} 있으면 어떤 마음이 들어?"`],
        empathy: ['"와~ 든든한 선생님이 있구나! 엄마(아빠)도 마음이 놓인다."'],
        avoid: ['좋은 이야기 끝에 바로 다른 걱정거리 꺼내기'],
        tip: '아이가 기댈 수 있는 선생님께 고마운 마음을 전해 보세요. 아이도 그 관계를 더 소중히 느껴요.',
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
