import { StyleSheet, Text, View } from 'react-native';

import { animalOf, colorOf, FACET_LABEL, shapeOf, traitOf, type PersonaFacet } from '@/games/persona';
import { portraitHistory, type PortraitEntry } from '@/report/analyze';
import { colors, fonts, radius } from '@/theme';
import type { Person, PlayResponse } from '@/types';
import { PersonCard } from '../studio/PersonCard';
import { Panel, Section } from './ParentShell';

const FACET_ICON: Record<PersonaFacet, string> = { color: '🎨', animal: '🐾', shape: '🔷', trait: '💬' };

function Chip({ e }: { e: PortraitEntry }) {
  const swatch = e.facet === 'color' ? colorOf(e.choiceId)?.color : undefined;
  const tone = e.score === null ? colors.inkMuted : e.score < 0 ? colors.signal.talk : e.score > 0 ? colors.signal.good : colors.inkSoft;
  return (
    <View style={[styles.chip, { borderColor: tone }]}>
      {swatch ? <View style={[styles.dot, { backgroundColor: swatch }]} /> : <Text style={{ fontSize: 16 }}>{e.emoji}</Text>}
      <Text style={styles.chipText}>{e.label}</Text>
    </View>
  );
}

/** 부모 상세: 아이가 그린 선생님(친구) 이미지와 변화 이력 */
export function PortraitSection({ person, responses }: { person: Person; responses: PlayResponse[] }) {
  const history = portraitHistory(responses, person.id);
  const p = person.persona;
  if (!p && !history.length) {
    return (
      <Section title="아이가 그린 이미지">
        <Panel>
          <Text style={styles.body}>아직 아이가 고른 이미지가 없어요. 아이 화면의 🎨 선생님 공방에서 함께 만들어 보세요.</Text>
        </Panel>
      </Section>
    );
  }

  // 날짜별로 묶어서 변화가 보이게
  const byDay = new Map<string, PortraitEntry[]>();
  for (const e of history) {
    const key = new Date(e.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }
  const days = [...byDay.entries()].reverse().slice(0, 8);

  const rows: { facet: PersonaFacet; value: string }[] = [
    { facet: 'color', value: colorOf(p?.color)?.parentLabel ?? '—' },
    { facet: 'animal', value: animalOf(p?.animal) ? `${animalOf(p?.animal)!.emoji} ${animalOf(p?.animal)!.parentLabel}` : '—' },
    { facet: 'shape', value: shapeOf(p?.shape) ? `${shapeOf(p?.shape)!.emoji} ${shapeOf(p?.shape)!.parentLabel}` : '—' },
    {
      facet: 'trait',
      value: p?.traits.length ? p.traits.map((t) => `${traitOf(t)?.emoji ?? ''} ${traitOf(t)?.label ?? t}`).join('  ') : '—',
    },
  ];

  return (
    <Section title="아이가 그린 이미지" sub="선생님 공방과 날씨 모험에서 아이가 직접 고른 색·동물·모양·성격이에요">
      <Panel>
        <View style={styles.top}>
          <PersonCard person={person} size={96} showTraits={false} />
          <View style={{ flex: 1, gap: 6 }}>
            {rows.map((r) => (
              <View key={r.facet} style={styles.row}>
                <Text style={styles.rowLabel}>
                  {FACET_ICON[r.facet]} {FACET_LABEL[r.facet]}
                </Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>
        {days.length > 0 && (
          <View style={{ gap: 8, marginTop: 6 }}>
            <Text style={styles.histTitle}>🕰️ 고른 기록 (최근 순)</Text>
            {days.map(([day, entries]) => (
              <View key={day} style={styles.dayRow}>
                <Text style={styles.day}>{day}</Text>
                <View style={styles.chips}>
                  {entries.map((e) => (
                    <Chip key={e.id} e={e} />
                  ))}
                </View>
              </View>
            ))}
            <Text style={styles.legend}>테두리: 초록 = 편안한 느낌 · 빨강 = 무섭거나 어두운 느낌</Text>
          </View>
        )}
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 },
  top: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  row: { gap: 1 },
  rowLabel: { fontFamily: fonts.title, fontSize: 13, color: colors.inkSoft },
  rowValue: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  histTitle: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  dayRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  day: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, width: 40, marginTop: 6 },
  chips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.paper,
  },
  chipText: { fontFamily: fonts.body, fontSize: 12, color: colors.ink },
  dot: { width: 14, height: 14, borderRadius: 7 },
  legend: { fontFamily: fonts.body, fontSize: 11, color: colors.inkMuted },
});
