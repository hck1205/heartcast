import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';

import { SELF } from '@/games/people';
import { nameOf } from '@/games/persona';
import { relationOf, type Edge } from '@/games/relations';
import { colors, fonts } from '@/theme';
import type { AvatarConfig, PersonKind, Profile } from '@/types';
import { Avatar } from '../Avatar';

export interface MapNode {
  id: string;
  name: string;
  kind: PersonKind | 'self';
  avatar: AvatarConfig;
}

export const KIND_RING: Record<MapNode['kind'], string> = {
  self: '#FFC83D',
  teacher: colors.primary,
  friend: colors.sky,
  parent: '#9B7BE0',
};

interface Pos {
  x: number;
  y: number;
}

/**
 * 자리 잡기: 나는 가운데, 선생님은 위, 어른은 아래, 친구는 양옆.
 * 사람이 많으면 2~3겹 고리에 번갈아 놓아 겹치지 않게 한다.
 */
export function layoutNodes(nodes: MapNode[], w: number, h: number): { pos: Record<string, Pos>; size: number; selfSize: number } {
  const others = nodes.filter((n) => n.id !== SELF);
  const n = others.length;
  const base = Math.min(w, h);
  const size = Math.round(Math.max(34, Math.min(66, n <= 6 ? base * 0.2 : n <= 12 ? base * 0.16 : n <= 22 ? base * 0.13 : base * 0.105)));
  const selfSize = Math.round(Math.min(96, size * 1.35));
  const rings = n <= 10 ? 1 : n <= 24 ? 2 : 3;

  const teachers = others.filter((x) => x.kind === 'teacher');
  const parents = others.filter((x) => x.kind === 'parent');
  const friends = others.filter((x) => x.kind === 'friend');
  const half = Math.ceil(friends.length / 2);
  // 시계 방향: 위(선생님) → 오른쪽 친구 → 아래(어른) → 왼쪽 친구
  const order = [...teachers, ...friends.slice(0, half), ...parents, ...friends.slice(half)];
  const start = -Math.PI / 2 - (teachers.length > 1 ? ((teachers.length - 1) / 2) * ((2 * Math.PI) / Math.max(1, n)) : 0);

  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - size * 0.62;
  const ry = h / 2 - size * 0.75;
  const scales = rings === 1 ? [1] : rings === 2 ? [1, 0.64] : [1, 0.72, 0.46];
  const pos: Record<string, Pos> = { [SELF]: { x: cx, y: cy } };
  order.forEach((node, i) => {
    const a = start + (i / Math.max(1, n)) * 2 * Math.PI;
    const k = scales[i % rings];
    pos[node.id] = { x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k };
  });
  return { pos, size, selfSize };
}

/** 관계도에 놓을 사람들: 가운데 아이(이름은 selfName) + 만든 사람 모두 */
export function nodesFor(profile: Pick<Profile, 'child' | 'people'>, selfName: string): MapNode[] {
  return [
    { id: SELF, name: selfName, kind: 'self', avatar: profile.child.avatar },
    ...profile.people.map((p) => ({ id: p.id, name: nameOf(p), kind: p.kind, avatar: p.avatar })),
  ];
}

/** 화살촉: 받는 쪽 동그라미 가장자리에 */
function arrowPoints(a: Pos, b: Pos, r: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const tip = { x: b.x - ux * r, y: b.y - uy * r };
  const s = 7;
  return `${tip.x},${tip.y} ${tip.x - ux * s * 1.6 - uy * s},${tip.y - uy * s * 1.6 + ux * s} ${tip.x - ux * s * 1.6 + uy * s},${tip.y - uy * s * 1.6 - ux * s}`;
}

/**
 * 관계도 (부모 화면, 보기 전용): 사람 카드(아바타)를 원형으로 놓고, 관계를 색 선 + 스티커로 잇는다.
 * 조심스러운 관계는 점선, 방향이 있는 관계(칭찬해요, 소리 질러요…)는 받는 쪽에 화살촉.
 */
export function RelationMap({ nodes, edges, height }: { nodes: MapNode[]; edges: Edge[]; /** 지정하지 않으면 부모 높이에 맞춘다 */ height?: number }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: hh } = e.nativeEvent.layout;
    if (Math.abs(width - box.w) > 1 || Math.abs(hh - box.h) > 1) setBox({ w: width, h: hh });
  };
  const w = box.w;
  const h = height ?? box.h;
  const ready = w > 0 && h > 0;
  const { pos, size, selfSize } = ready ? layoutNodes(nodes, w, h) : { pos: {} as Record<string, Pos>, size: 0, selfSize: 0 };
  const drawn = edges.filter((e) => pos[e.from] && pos[e.to]);

  // 같은 두 사람 사이 스티커가 겹치지 않게 조금씩 밀기
  const pairCount = new Map<string, number>();
  const stickers = drawn.map((e) => {
    const pair = [e.from, e.to].sort().join('|');
    const i = pairCount.get(pair) ?? 0;
    pairCount.set(pair, i + 1);
    const a = pos[e.from];
    const b = pos[e.to];
    const t = 0.5 + (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 0.16;
    return { e, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  });
  const radiusOf = (id: string) => (id === SELF ? selfSize : size) / 2 + 3;
  const S = Math.max(24, Math.min(32, size * 0.55));

  return (
    <View style={[styles.box, height ? { height } : { flex: 1 }]} onLayout={onLayout}>
      {ready && (
        <>
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <Circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.2} fill={colors.skySoft} opacity={0.6} />
            {drawn.map((e) => {
              const def = relationOf(e.rel)!;
              const a = pos[e.from];
              const b = pos[e.to];
              return (
                <G key={e.key}>
                  <Line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={def.color}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeDasharray={def.score < 0 ? '8 6' : undefined}
                    opacity={0.9}
                  />
                  {def.directed && <Polygon points={arrowPoints(a, b, radiusOf(e.to))} fill={def.color} />}
                </G>
              );
            })}
          </Svg>

          {stickers.map(({ e, x, y }) => {
            const def = relationOf(e.rel)!;
            return (
              <View
                key={`s-${e.key}`}
                accessibilityLabel={def.label}
                style={[styles.sticker, { left: x - S / 2, top: y - S / 2, width: S, height: S, borderRadius: S / 2, borderColor: def.color }]}
              >
                <Text style={{ fontSize: S * 0.55 }}>{def.emoji}</Text>
              </View>
            );
          })}

          {nodes.map((nd) => {
            const p = pos[nd.id];
            if (!p) return null;
            const s = nd.id === SELF ? selfSize : size;
            return (
              <View key={nd.id} accessibilityLabel={nd.name} style={[styles.node, { left: p.x - s / 2, top: p.y - s / 2, width: s }]}>
                <View style={[styles.face, { width: s, height: s, borderRadius: s / 2, borderColor: KIND_RING[nd.kind] }]}>
                  <View style={{ marginTop: s * 0.02 }}>
                    <Avatar avatar={nd.avatar} size={s * 0.98} expression={nd.id === SELF ? 'happy' : 'calm'} />
                  </View>
                </View>
                <Text numberOfLines={1} style={[styles.name, { fontSize: Math.max(10, Math.min(13, s * 0.22)), maxWidth: s + 26 }]}>
                  {nd.name}
                </Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', position: 'relative' },
  node: { position: 'absolute', alignItems: 'center' },
  face: { overflow: 'hidden', backgroundColor: colors.paper, alignItems: 'center', borderWidth: 2.5 },
  name: {
    fontFamily: fonts.title,
    color: colors.ink,
    backgroundColor: colors.paper,
    borderRadius: 999,
    paddingHorizontal: 6,
    marginTop: -6,
    overflow: 'hidden',
    textAlign: 'center',
  },
  sticker: {
    position: 'absolute',
    backgroundColor: colors.paper,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
