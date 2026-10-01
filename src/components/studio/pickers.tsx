import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  FACET_CHOICES,
  MAX_TRAITS,
  PERSONA_COLORS,
  type ColorChoice,
  type EmojiChoice,
  type PersonaFacet,
  visibleChoices,
} from '@/games/persona';
import { say, tap } from '@/lib/feedback';
import { colors, fonts, radius, selectedLook } from '@/theme';

/** 고르기 타일: 선택되면 주황 테두리 + 살짝 커짐 */
export function OptionTile({
  selected,
  onPress,
  children,
  label,
  width = 78,
  dim,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  label?: string;
  width?: number;
  dim?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.tile, { width }, selected && styles.tileOn, dim && { opacity: 0.35 }]}
    >
      {children}
      {label ? (
        <Text style={[styles.tileLabel, selected && { color: colors.primaryDark }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function Swatch({ color, size = 44 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }} />;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

/** 색 고르기: 동그란 물감 */
function PaintDrop({ c, selected, onPress, dim }: { c: ColorChoice; selected: boolean; onPress: () => void; dim?: boolean }) {
  return (
    <OptionTile selected={selected} onPress={onPress} label={c.label} width={84} dim={dim}>
      <View style={[styles.drop, { backgroundColor: c.color }]} />
    </OptionTile>
  );
}

/**
 * 성격 이미지 고르기 (색·동물·모양·성격).
 * trait 는 multi 로 최대 2개, 나머지는 하나만.
 * value 가 'unknown' 이면 "잘 모르겠어"를 고른 상태.
 */
export function PersonaPicker({
  facet,
  value,
  onChange,
  multi,
  dimOthers,
}: {
  facet: PersonaFacet;
  value: string | string[] | null;
  onChange: (v: string | string[] | null) => void;
  multi?: boolean;
  dimOthers?: boolean;
}) {
  const selected = (id: string) => (Array.isArray(value) ? value.includes(id) : value === id);
  const anySelected = Array.isArray(value) ? value.length > 0 : !!value;
  const pick = (id: string) => {
    const c = FACET_CHOICES[facet].find((x) => x.id === id);
    if (c) say(c.hint ? `${c.label}! ${c.hint}` : c.label);
    if (!multi) return onChange(id);
    const cur = Array.isArray(value) ? value.filter((x) => x !== 'unknown') : [];
    if (cur.includes(id)) return onChange(cur.filter((x) => x !== id));
    if (cur.length >= MAX_TRAITS) return onChange([...cur.slice(1), id]);
    onChange([...cur, id]);
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.grid}>
        {facet === 'color' &&
          PERSONA_COLORS.map((c) => (
            <PaintDrop key={c.id} c={c} selected={selected(c.id)} onPress={() => pick(c.id)} dim={dimOthers && anySelected && !selected(c.id)} />
          ))}
        {facet !== 'color' &&
          (visibleChoices(facet) as EmojiChoice[]).map((c) => (
            <OptionTile
              key={c.id}
              selected={selected(c.id)}
              onPress={() => pick(c.id)}
              label={c.label}
              width={facet === 'trait' ? 100 : 84}
              dim={dimOthers && anySelected && !selected(c.id)}
            >
              <Text style={{ fontSize: facet === 'trait' ? 36 : 40 }}>{c.emoji}</Text>
            </OptionTile>
          ))}
      </View>
      <Pressable
        onPress={() => {
          tap();
          onChange(multi ? ['unknown'] : 'unknown');
        }}
        style={[styles.unknown, selected('unknown') && styles.tileOn]}
      >
        <Text style={styles.unknownText}>🤔 잘 모르겠어</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.line,
  },
  tileOn: selectedLook,
  tileLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 4, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  sectionTitle: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkMuted, marginLeft: 4 },
  drop: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  unknown: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  unknownText: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft },
});
