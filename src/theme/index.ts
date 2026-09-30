import { Platform } from 'react-native';

/** 차분한 바탕 + 코랄 주조색 하나. 그림자 대신 얇은 선으로 구분한다. */
export const colors = {
  bg: '#FAF7F2',
  skyTop: '#DCEEFF',
  skyBottom: '#F6FAFF',
  cream: '#FAF7F2',
  paper: '#FFFFFF',
  ink: '#222831',
  inkSoft: '#5F6673',
  inkMuted: '#9AA0AA',
  line: '#ECE6DC',
  primary: '#FF7A59',
  primaryDark: '#E8603F',
  primarySoft: '#FFEDE6',
  sky: '#4F8EF7',
  skySoft: '#EAF2FF',
  mint: '#3FBF9B',
  lemon: '#FFD58A',
  lilac: '#9B87F5',
  pink: '#F4A6A0',
  grass: '#AEDCC0',
  // 리포트: 날씨 점수 (맑음→폭풍) — 아이콘과 함께 쓰여 색만으로 의미를 전달하지 않는다
  weather: {
    sunny: '#F6B400',
    partly: '#F2C94C',
    cloudy: '#9AA7BD',
    rainy: '#5B8DEF',
    stormy: '#6B5BD6',
  },
  signal: {
    talk: '#E8684A',
    watch: '#E39A2D',
    good: '#3BAA7E',
  },
} as const;

export const radius = { sm: 10, md: 16, lg: 20, pill: 999 };
export const space = (n: number) => n * 4;

/** 아이용 제목·버튼만 둥근 Jua, 본문과 부모 화면은 시스템 글꼴(안드로이드: Noto Sans KR) */
export const fonts = {
  title: 'Jua_400Regular',
  body: Platform.select({ android: 'sans-serif', ios: 'System', default: 'system-ui' }) as string,
};

/** 아주 옅은 그림자 (대부분은 테두리로 구분) */
export const shadow = {
  shadowColor: '#222831',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export const palettes = {
  // 흑발 · 흑갈 · 짙은 갈색 · 밝은 갈색 · 애쉬 · 와인 · 회색
  hairColors: ['#1E1B1A', '#2F2320', '#4A3226', '#7A5236', '#8C7B6B', '#6B2E3A', '#A9A9AD'],
  // 파스텔 옷색: 코랄 · 버터 · 민트 · 하늘 · 라벤더 · 베이지 · 데님 · 차콜
  shirts: ['#F4A6A0', '#FFD58A', '#AEDCC0', '#A8CFF2', '#C9B8F0', '#EBCDB0', '#8FA7C9', '#5E6B7D'],
  skins: {
    porcelain: '#FCEADF',
    light: '#F7DCC6',
    medium: '#EFC7A6',
    tan: '#D9A57C',
    deep: '#A8714B',
  },
};
