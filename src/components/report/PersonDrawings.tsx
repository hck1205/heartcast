import { StyleSheet, Text } from 'react-native';

import { bubbleCounts, bubbleOf } from '@/games/art';
import { colors, fonts } from '@/theme';
import type { Drawing, Person, Profile } from '@/types';
import { DrawingStrip } from '../art/DrawingStrip';
import { Section } from './ParentShell';

/** 사람 상세: 이 사람이 나온 그림과 자주 그린 말풍선 (그림이 없으면 숨긴다) */
export function PersonDrawings({ person, drawings, profile }: { person: Person; drawings: Drawing[]; profile: Profile }) {
  const mine = drawings.filter((d) => d.figures.some((f) => f.personId === person.id));
  if (!mine.length) return null;
  const top = bubbleCounts(mine, person.id).slice(0, 3);
  return (
    <Section title="아이가 그린 그림" sub="이 사람이 나온 그림이에요">
      <DrawingStrip drawings={mine} profile={profile} />
      {top.length > 0 && (
        <Text style={styles.bubbles}>
          자주 그린 말풍선: {top.map((b) => `"${bubbleOf(b.id)?.text}" ${b.n}번`).join(' · ')}
        </Text>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  bubbles: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
});
