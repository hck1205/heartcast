import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { tap } from '@/lib/feedback';
import { ACCESSORIES, HAIRS, SKINS, randomAvatar } from '@/lib/util';
import { colors, fonts, palettes, radius } from '@/theme';
import type { AvatarConfig, Expression } from '@/types';
import { Avatar } from './Avatar';
import { Floating } from './Mascot';
import { Chip } from './ui';

type Tab = 'skin' | 'hair' | 'hairColor' | 'shirt' | 'accessory';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'hair', label: '머리', icon: '💇' },
  { key: 'hairColor', label: '머리색', icon: '🎨' },
  { key: 'skin', label: '피부', icon: '🖐️' },
  { key: 'shirt', label: '옷', icon: '👕' },
  { key: 'accessory', label: '꾸미기', icon: '🎀' },
];

const ACCESSORY_LABEL: Record<string, string> = {
  none: '없음',
  glasses: '안경',
  ribbon: '리본',
  cap: '모자',
  flower: '꽃핀',
  crown: '왕관',
};

const EXPRESSIONS: Expression[] = ['happy', 'calm', 'happy', 'neutral'];

/** 옷입히기 놀이처럼 아바타를 꾸미는 빌더 */
export function AvatarBuilder({ value, onChange, previewSize = 150 }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void; previewSize?: number }) {
  const [tab, setTab] = useState<Tab>('hair');
  const [exprIdx, setExprIdx] = useState(0);
  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) => onChange({ ...value, [k]: v });

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
            <Avatar avatar={value} size={previewSize} expression={EXPRESSIONS[exprIdx]} bg="#FFFFFFAA" />
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
        {tab === 'hair' &&
          HAIRS.map((h) => (
            <Chip key={h} label={h} selected={value.hair === h} onPress={() => set('hair', h)}>
              <Avatar avatar={{ ...value, hair: h, accessory: 'none' }} size={62} />
            </Chip>
          ))}
        {tab === 'hairColor' &&
          palettes.hairColors.map((c) => (
            <Chip key={c} label={`머리색 ${c}`} selected={value.hairColor === c} onPress={() => set('hairColor', c)}>
              <View style={[styles.swatch, { backgroundColor: c }]} />
            </Chip>
          ))}
        {tab === 'skin' &&
          SKINS.map((s) => (
            <Chip key={s} label={`피부 ${s}`} selected={value.skin === s} onPress={() => set('skin', s)}>
              <View style={[styles.swatch, { backgroundColor: palettes.skins[s] }]} />
            </Chip>
          ))}
        {tab === 'shirt' &&
          palettes.shirts.map((c) => (
            <Chip key={c} label={`옷 색 ${c}`} selected={value.shirt === c} onPress={() => set('shirt', c)}>
              <Text style={{ fontSize: 34 }}>👕</Text>
              <View style={[styles.shirtBar, { backgroundColor: c }]} />
            </Chip>
          ))}
        {tab === 'accessory' &&
          ACCESSORIES.map((a) => (
            <Chip key={a} label={ACCESSORY_LABEL[a]} selected={value.accessory === a} onPress={() => set('accessory', a)}>
              <Avatar avatar={{ ...value, accessory: a }} size={56} />
              <Text style={styles.accLabel}>{ACCESSORY_LABEL[a]}</Text>
            </Chip>
          ))}
      </ScrollView>
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
  options: { gap: 10, paddingVertical: 4, paddingHorizontal: 2 },
  swatch: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: '#fff' },
  shirtBar: { width: 40, height: 8, borderRadius: 4, marginTop: 2 },
  accLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
});
