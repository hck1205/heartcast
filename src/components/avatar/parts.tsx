/**
 * 일상툰(웹툰) 스타일 아바타 파츠.
 * 진갈색 외곽선 + 평면 채색, 눈·코·입이 있는 얼굴, 한국에서 흔한 머리 모양과 원복 차림.
 * 좌표계: viewBox 0 0 120 140 (얼굴 중심 약 60,58 · 눈 y=60 · 입 y≈80 · 몸통 y≥104)
 * 파츠는 주제별 파일로 나뉘어 있고, 여기서 한꺼번에 내보낸다.
 */
export { Glasses, HeadwearLayer, EarringsLayer } from './accessories';
export { Clothes, NeckLayer } from './clothes';
export { EmotionMarks, Face, FacialHairLayer } from './face';
export { HairBack, HairFront } from './hair';
export { Ears, Head, headGeometry, Wrinkles } from './head';
export { OL, shade } from './shared';
