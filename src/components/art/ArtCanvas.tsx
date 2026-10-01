import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polyline, Rect } from 'react-native-svg';

import { bubbleOf, CANVAS_H, CANVAS_W, FIGURE_BASE, SELF, skyOf, stampOf } from '@/games/art';
import { colors, fonts } from '@/theme';
import type { ArtStroke, AvatarConfig, Drawing } from '@/types';
import { Avatar } from '../Avatar';

export type CanvasMode = 'none' | 'draw' | 'tap';

/** 하늘 배경 + (우리 반 그림이면) 교실 바닥·칠판 */
function Background({ d }: { d: Drawing }) {
  const sky = skyOf(d.sky);
  const night = d.sky === 'night' || d.sky === 'storm';
  return (
    <>
      <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={sky.color} />
      {d.sky === 'sunny' && <Circle cx={860} cy={130} r={70} fill="#FFD23F" />}
      {d.sky === 'night' && (
        <>
          <Path d="M840 80 A70 70 0 1 0 900 200 A55 55 0 1 1 840 80 Z" fill="#FFE9A8" />
          {[
            [120, 90],
            [300, 160],
            [520, 70],
            [700, 200],
          ].map(([x, y]) => (
            <Circle key={`${x}`} cx={x} cy={y} r={6} fill="#FFF6D0" />
          ))}
        </>
      )}
      {(d.sky === 'cloudy' || d.sky === 'rainy' || d.sky === 'storm') && (
        <>
          {[
            [220, 140],
            [700, 110],
          ].map(([x, y]) => (
            <Ellipse key={x} cx={x} cy={y} rx={150} ry={60} fill={night ? '#6B7186' : '#FFFFFF'} opacity={0.9} />
          ))}
        </>
      )}
      {d.sky === 'rainy' &&
        [150, 260, 380, 620, 730, 840].map((x, i) => <Path key={x} d={`M${x} ${210 + (i % 2) * 30} l-14 40`} stroke="#6E8FC0" strokeWidth={8} strokeLinecap="round" />)}
      {d.sky === 'storm' && <Path d="M700 170 l-60 110 h50 l-40 100 l110 -140 h-55 l40 -70 Z" fill="#FFD23F" />}
      {d.kind === 'scene' && (
        <>
          <Rect x={0} y={820} width={CANVAS_W} height={CANVAS_H - 820} fill="#EED9BC" />
          <Rect x={280} y={250} width={440} height={180} rx={16} fill="#3F6B4F" stroke="#8B5E3C" strokeWidth={14} />
        </>
      )}
    </>
  );
}

/**
 * 그림 도화지 (아이 편집 · 부모 보기 공용).
 * 층: 배경 → 사람 → 스탬프 → 크레용 → 말풍선 → (편집 중) 터치 막.
 * 좌표는 1000×1250 도화지 단위로 저장하고, 화면 너비에 맞춰 줄인다.
 */
export function ArtCanvas({
  drawing,
  avatarOf,
  labelOf,
  width,
  mode = 'none',
  penColor = '#2B2B35',
  selectedFigure = null,
  onStroke,
  onCanvasPress,
  onFigurePress,
  onStampPress,
}: {
  drawing: Drawing;
  avatarOf: (personId: string) => AvatarConfig | null;
  /** 우리 반 그림에서 사람 아래에 붙이는 이름 */
  labelOf?: (personId: string) => string;
  width: number;
  mode?: CanvasMode;
  penColor?: string;
  selectedFigure?: number | null;
  onStroke?: (s: ArtStroke) => void;
  onCanvasPress?: (x: number, y: number) => void;
  onFigurePress?: (index: number) => void;
  onStampPress?: (index: number) => void;
}) {
  const k = width / CANVAS_W;
  const height = CANVAS_H * k;
  const [live, setLive] = useState<number[] | null>(null);
  // 터치 좌표: 화면 좌표(pageX/Y)에서 도화지 위치를 빼서 구한다 (웹·안드로이드 모두 같은 방식)
  const boxRef = useRef<View>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const measure = () => boxRef.current?.measureInWindow((x, y) => (originRef.current = { x, y }));
  const at = (e: GestureResponderEvent) => [
    Math.round((e.nativeEvent.pageX - originRef.current.x) / k),
    Math.round((e.nativeEvent.pageY - originRef.current.y) / k),
  ];
  // 손가락 그리기: 이벤트 핸들러에서만 ref 를 읽는다
  const ptsRef = useRef<number[]>([]);
  const drawHandlers = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: (e: GestureResponderEvent) => {
      measure();
      ptsRef.current = at(e);
      setLive([...ptsRef.current]);
    },
    onResponderMove: (e: GestureResponderEvent) => {
      const [x, y] = at(e);
      const p = ptsRef.current;
      if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) < 6) return;
      ptsRef.current = [...p, x, y];
      setLive(ptsRef.current);
    },
    onResponderRelease: () => {
      const p = ptsRef.current;
      // 톡 찍기만 해도 점이 남도록
      const pts = p.length === 2 ? [...p, p[0] + 1, p[1] + 1] : p;
      if (pts.length >= 4) onStroke?.({ color: penColor, points: pts });
      ptsRef.current = [];
      setLive(null);
    },
    onResponderTerminate: () => {
      ptsRef.current = [];
      setLive(null);
    },
  };

  const figSize = (scale: number) => FIGURE_BASE[drawing.kind] * scale;

  return (
    <View ref={boxRef} onLayout={measure} style={{ width, height, overflow: 'hidden', borderRadius: 18 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} style={StyleSheet.absoluteFill}>
        <Background d={drawing} />
      </Svg>

      {drawing.figures.map((f, i) => {
        const w = figSize(f.scale) * k;
        const h = (w * 140) / 120;
        const av = avatarOf(f.personId);
        if (!av) return null;
        return (
          <Pressable
            key={`${f.personId}-${i}`}
            disabled={!onFigurePress || mode !== 'none'}
            onPress={() => onFigurePress?.(i)}
            accessibilityLabel={`그림 속 사람 ${i + 1}`}
            style={[
              styles.figure,
              { left: f.x * k - w / 2, top: f.y * k - h / 2, width: w, height: h },
              selectedFigure === i && { borderColor: colors.primary, borderWidth: 3, borderRadius: 16, borderStyle: 'dashed' },
            ]}
          >
            <Avatar avatar={av} size={w} expression={f.expression} />
            {drawing.kind === 'scene' && (
              <Text numberOfLines={1} style={[styles.me, { fontSize: Math.max(9, 30 * k) }]}>
                {f.personId === SELF ? '나' : (labelOf?.(f.personId) ?? '')}
              </Text>
            )}
          </Pressable>
        );
      })}

      {drawing.stamps.map((s, i) => {
        const size = 90 * k;
        return (
          <Pressable
            key={`st-${i}`}
            disabled={!onStampPress}
            onPress={() => onStampPress?.(i)}
            style={{ position: 'absolute', left: s.x * k - size / 2, top: s.y * k - size / 2, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: size * 0.75 }}>{stampOf(s.id)?.emoji ?? '⭐'}</Text>
          </Pressable>
        );
      })}

      <Svg width={width} height={height} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} style={StyleSheet.absoluteFill} pointerEvents="none">
        {[...drawing.strokes, ...(live ? [{ color: penColor, points: live }] : [])].map((s, i) => (
          <Polyline key={i} points={s.points.join(' ')} fill="none" stroke={s.color} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        ))}
      </Svg>

      {drawing.figures.map((f, i) => {
        const b = bubbleOf(f.bubble);
        if (!b) return null;
        const w = figSize(f.scale) * k;
        const h = (w * 140) / 120;
        const fs = Math.max(10, (drawing.kind === 'portrait' ? 46 : 30) * k);
        return (
          <View key={`b-${i}`} pointerEvents="none" style={[styles.bubble, { left: Math.min(f.x * k + w * 0.12, width - fs * 7), top: Math.max(4, f.y * k - h * 0.62 - fs * 1.4) }]}>
            <Text style={[styles.bubbleText, { fontSize: fs }]}>{b.text}</Text>
          </View>
        );
      })}

      {mode === 'draw' && <View style={StyleSheet.absoluteFill} {...drawHandlers} />}
      {mode === 'tap' && (
        <Pressable
          accessibilityLabel="도화지"
          style={StyleSheet.absoluteFill}
          onPressIn={measure}
          onPress={(e) => {
            const [x, y] = at(e);
            onCanvasPress?.(x, y);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { position: 'absolute', alignItems: 'center' },
  me: { position: 'absolute', bottom: -4, maxWidth: 120, fontFamily: fonts.title, color: colors.ink, backgroundColor: '#FFFFFFDD', borderRadius: 999, paddingHorizontal: 6, overflow: 'hidden' },
  bubble: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bubbleText: { fontFamily: fonts.title, color: colors.ink },
});
