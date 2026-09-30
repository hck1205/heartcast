export const colors = {
  skyTop: '#8FD3FF',
  skyBottom: '#E9F7FF',
  sunset: '#FFD9A8',
  cream: '#FFF9F0',
  paper: '#FFFFFF',
  ink: '#2E3A59',
  inkSoft: '#5B6784',
  inkMuted: '#8C96AD',
  line: '#E3E8F2',
  primary: '#FF8A5B',
  primaryDark: '#E86A3A',
  mint: '#5CCFB1',
  lemon: '#FFD84D',
  lilac: '#B79CFF',
  pink: '#FF9EC4',
  sky: '#4FB3FF',
  grass: '#7BD389',
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
    watch: '#F2A93B',
    good: '#3BAA7E',
  },
} as const;

export const radius = { sm: 12, md: 20, lg: 28, pill: 999 };
export const space = (n: number) => n * 4;

export const fonts = {
  title: 'Jua_400Regular',
  body: 'Jua_400Regular',
};

export const shadow = {
  shadowColor: '#2E3A59',
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export const palettes = {
  hairColors: ['#3B2A20', '#6B4226', '#A0652D', '#E0B15C', '#1F1F1F', '#C0504D', '#8A8FA3'],
  shirts: ['#FF8A5B', '#5CCFB1', '#4FB3FF', '#B79CFF', '#FF9EC4', '#FFD84D', '#7BD389', '#2E3A59'],
  skins: {
    light: '#FFE3CF',
    peach: '#F9CBA7',
    tan: '#E0A77A',
    brown: '#B67A4E',
    deep: '#7A4B2E',
  },
};
