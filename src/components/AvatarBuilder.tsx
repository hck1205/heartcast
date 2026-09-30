import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EYES, FACE_SHAPES, HAIR_COLOR_LABELS, HAIRS, HEADWEAR, normalizeAvatar, randomAvatar, SKINS, TOPS } from '@/lib/avatar';
import { tap } from '@/lib/feedback';
import { colors, palettes } from '@/theme';
import type { AvatarConfig, FullAvatar } from '@/types';
import { Avatar } from './Avatar';
import { OptionTile, Swatch } from './studio/pickers';
import { Tabs } from './ui';

type Tab = 'face' | 'hair' | 'clothes';

function Row({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {children}
    </ScrollView>
  );
}

/** 아이 자신의 아바타 꾸미기 (선생님·친구는 공방 Studio 를 쓴다) */
export function AvatarBuilder({ value, onChange, previewSize = 130 }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void; previewSize?: number }) {
  const [tab, setTab] = useState<Tab>('face');
  const a = normalizeAvatar(value);
  const set = <K extends keyof FullAvatar>(k: K, v: FullAvatar[K]) => onChange({ ...a, [k]: v });

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.preview}>
        <Avatar avatar={a} size={previewSize} expression="happy" bg={colors.skySoft} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="랜덤으로 꾸미기"
          onPress={() => {
            tap();
            onChange(randomAvatar());
          }}
          style={styles.dice}
        >
          <Text style={{ fontSize: 22 }}>🎲</Text>
        </Pressable>
      </View>

      <Tabs
        items={[
          { id: 'face', label: '얼굴' },
          { id: 'hair', label: '머리' },
          { id: 'clothes', label: '옷' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'face' && (
        <>
          <Row>
            {SKINS.map((s) => (
              <OptionTile key={s} selected={a.skin === s} onPress={() => set('skin', s)} width={56}>
                <Swatch color={palettes.skins[s]} size={36} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {FACE_SHAPES.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.faceShape === o.id} onPress={() => set('faceShape', o.id)} width={70}>
                <Avatar avatar={{ ...a, faceShape: o.id }} size={50} />
              </OptionTile>
            ))}
            {EYES.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.eyes === o.id} onPress={() => set('eyes', o.id)} width={70}>
                <Avatar avatar={{ ...a, eyes: o.id }} size={50} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
      {tab === 'hair' && (
        <>
          <Row>
            {HAIRS.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.hair === o.id} onPress={() => set('hair', o.id)} width={80}>
                <Avatar avatar={{ ...a, hair: o.id, headwear: 'none' }} size={50} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {palettes.hairColors.map((c, i) => (
              <OptionTile key={c} label={HAIR_COLOR_LABELS[i]} selected={a.hairColor === c} onPress={() => set('hairColor', c)} width={64}>
                <Swatch color={c} size={32} />
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
                <Avatar avatar={{ ...a, top: o.id }} size={50} />
              </OptionTile>
            ))}
            {HEADWEAR.map((o) => (
              <OptionTile key={o.id} label={o.label} selected={a.headwear === o.id} onPress={() => set('headwear', o.id)} width={70}>
                <Avatar avatar={{ ...a, headwear: o.id }} size={50} />
              </OptionTile>
            ))}
          </Row>
          <Row>
            {palettes.shirts.map((c) => (
              <OptionTile key={c} selected={a.shirt === c} onPress={() => set('shirt', c)} width={56}>
                <Swatch color={c} size={32} />
              </OptionTile>
            ))}
          </Row>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', justifyContent: 'center' },
  dice: {
    position: 'absolute',
    right: 24,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { gap: 8, paddingVertical: 2, paddingHorizontal: 2 },
});
