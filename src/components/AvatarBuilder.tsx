import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BROWS, CHEEKS, EYES, FACE_SHAPES, GLASSES, HAIRS, HEADWEAR, normalizeAvatar, PATTERNS, randomAvatar, SKINS, TOPS } from '@/lib/avatar';
import { tap } from '@/lib/feedback';
import { colors, fonts, palettes, radius } from '@/theme';
import type { AvatarConfig, Expression, FullAvatar } from '@/types';
import { Avatar } from './Avatar';
import { Floating } from './Mascot';
import { OptionTile, Swatch } from './studio/pickers';

type Tab = 'face' | 'eyes' | 'hair' | 'clothes' | 'deco';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'face', label: '얼굴', icon: '🙂' },
  { key: 'eyes', label: '눈', icon: '👀' },
  { key: 'hair', label: '머리', icon: '💇' },
  { key: 'clothes', label: '옷', icon: '👕' },
  { key: 'deco', label: '꾸미기', icon: '🎀' },
];

const EXPRESSIONS: Expression[] = ['happy', 'calm', 'happy', 'neutral'];

function Row({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
      {children}
    </ScrollView>
  );
}

/** 아이 자신의 아바타 꾸미기 (선생님·친구는 공방 Studio 를 쓴다) */
export function AvatarBuilder({ value, onChange, previewSize = 150 }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void; previewSize?: number }) {
  const [tab, setTab] = useState<Tab>('hair');
  const [exprIdx, setExprIdx] = useState(0);
  const a = normalizeAvatar(value);
  const set = <K extends keyof FullAvatar>(k: K, v: FullAvatar[K]) => onChange({ ...a, [k]: v });

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.previewRow}>
        <Pressable
          accessibilityLabel="아바타 표정 바꾸기"
          onPress={() => {
            tap();
            setExprIdx((i) => (i + 1) % EXPRESSIONS.length);
          }}
        >
          <Floating distance={5}>
            <Avatar avatar={a} size={previewSize} expression={EXPRESSIONS[exprIdx]} bg="#FFFFFFAA" />
          </Floating>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="랜덤으로 꾸미기"
          onPress={() => {
            tap();
            onChange(randomAvatar());
          }}
          style={styles.dice}
        >
          <Text style={{ fontSize: 30 }}>🎲</Text>
          <Text style={styles.diceText}>랜덤!</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
            onPress={() => {
              tap();
              setTab(t.key);
            }}
            style={[styles.tab, tab === t.key && styles.tabOn]}
          >
            <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            <Text style={[styles.tabText, tab === t.key && { color: colors.primaryDark }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'face' && (
        <>
          <Row>
            {FACE_SHAPES.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.faceShape === o.id} onPress={() => set('faceShape', o.id)} width={70}>
                <Avatar avatar={{ ...a, faceShape: o.id }} size={54} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {SKINS.map((s) => (
              <OptionTile key={s} selected={a.skin === s} onPress={() => set('skin', s)} width={58}>
                <Swatch color={palettes.skins[s]} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
      {tab === 'eyes' && (
        <>
          <Row>
            {EYES.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.eyes === o.id} onPress={() => set('eyes', o.id)} width={70}>
                <Avatar avatar={{ ...a, eyes: o.id }} size={54} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {BROWS.map((o) => (
              <OptionTile key={o.id} label={`눈썹 ${o.label}`} selected={a.brows === o.id} onPress={() => set('brows', o.id)} width={76}>
                <Avatar avatar={{ ...a, brows: o.id }} size={50} />
              </OptionTile>
            ))}
            {CHEEKS.map((o) => (
              <OptionTile key={o.id} label={`볼 ${o.label}`} selected={a.cheeks === o.id} onPress={() => set('cheeks', o.id)} width={76}>
                <Avatar avatar={{ ...a, cheeks: o.id }} size={50} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
      {tab === 'hair' && (
        <>
          <Row>
            {HAIRS.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.hair === o.id} onPress={() => set('hair', o.id)} width={72}>
                <Avatar avatar={{ ...a, hair: o.id, headwear: 'none' }} size={54} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {palettes.hairColors.map((c) => (
              <OptionTile key={c} selected={a.hairColor === c} onPress={() => set('hairColor', c)} width={58}>
                <Swatch color={c} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
      {tab === 'clothes' && (
        <>
          <Row>
            {TOPS.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.top === o.id} onPress={() => set('top', o.id)} width={70}>
                <Avatar avatar={{ ...a, top: o.id }} size={54} />
              </OptionTile>
            ))}
            {PATTERNS.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.pattern === o.id} onPress={() => set('pattern', o.id)} width={70}>
                <Avatar avatar={{ ...a, pattern: o.id }} size={54} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {palettes.shirts.map((c) => (
              <OptionTile key={c} selected={a.shirt === c} onPress={() => set('shirt', c)} width={58}>
                <Swatch color={c} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
      {tab === 'deco' && (
        <>
          <Row>
            {HEADWEAR.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.headwear === o.id} onPress={() => set('headwear', o.id)} width={70}>
                <Avatar avatar={{ ...a, headwear: o.id }} size={54} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {GLASSES.map((o) => (
              <OptionTile key={o.id} label={`안경 ${o.label}`} selected={a.glasses === o.id} onPress={() => set('glasses', o.id)} width={76}>
                <Avatar avatar={{ ...a, glasses: o.id }} size={50} />
              </OptionTile>
            ))}
            {[false, true].map((on) => (
              <OptionTile key={String(on)} label={on ? '귀걸이' : '귀걸이 없음'} selected={a.earrings === on} onPress={() => set('earrings', on)} width={80}>
                <Avatar avatar={{ ...a, earrings: on }} size={50} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  dice: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
  },
  diceText: { fontFamily: fonts.body, color: colors.ink, fontSize: 14 },
  tabs: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tabOn: { backgroundColor: colors.paper },
  tabText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  options: { gap: 10, paddingVertical: 6, paddingHorizontal: 4 },
});
