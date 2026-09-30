import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  FACET_CHOICES,
  MAX_TRAITS,
  PERSONA_COLORS,
  type ColorChoice,
  type EmojiChoice,
  type PersonaFacet,
} from '@/games/persona';
import { say, tap } from '@/lib/feedback';
import { colors, fonts, radius, shadow } from '@/theme';

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
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: 3, borderColor: '#fff', ...shadow, shadowOpacity: 0.08 }} />;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

/** 물감 방울 모양 색 고르기 */
function PaintDrop({ c, selected, onPress, dim }: { c: ColorChoice; selected: boolean; onPress: () => void; dim?: boolean }) {
  return (
    <OptionTile selected={selected} onPress={onPress} label={c.label} width={96} dim={dim}>
      <View style={[styles.drop, { backgroundColor: c.color }]}>
        <View style={styles.dropShine} />
      </View>
      <Text style={styles.hint} numberOfLines={1}>
        {c.hint}
      </Text>
    </OptionTile>
  );
}

/**
 * 성격 이미지 고르기 (색·동물·모양·성격).
 * trait 는 multi 로 최대 3개, 나머지는 하나만.
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
          (FACET_CHOICES[facet] as EmojiChoice[]).map((c) => (
            <OptionTile
              key={c.id}
              selected={selected(c.id)}
              onPress={() => pick(c.id)}
              label={c.label}
              width={facet === 'trait' ? 96 : 84}
              dim={dimOthers && anySelected && !selected(c.id)}
            >
              <Text style={{ fontSize: facet === 'trait' ? 34 : 44 }}>{c.emoji}</Text>
              {facet !== 'trait' && c.hint ? (
                <Text style={styles.hint} numberOfLines={1}>
                  {c.hint}
                </Text>
              ) : null}
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
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadow,
    shadowOpacity: 0.08,
  },
  tileOn: { borderColor: colors.primary, backgroundColor: '#FFF4EE', transform: [{ scale: 1.05 }] },
  tileLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, marginTop: 4 },
  hint: { fontFamily: fonts.body, fontSize: 10, color: colors.inkMuted, marginTop: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  sectionTitle: { fontFamily: fonts.title, fontSize: 17, color: colors.inkSoft, marginLeft: 4 },
  drop: {
    width: 54,
    height: 54,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
    transform: [{ rotate: '-45deg' }],
    borderWidth: 3,
    borderColor: '#fff',
  },
  dropShine: { position: 'absolute', left: 10, top: 14, width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.6)' },
  unknown: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  unknownText: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft },
});
