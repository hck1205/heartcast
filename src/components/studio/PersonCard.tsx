import { StyleSheet, Text, View } from 'react-native';

import { animalOf, callName, colorOf, shapeOf, traitOf } from '@/games/persona';
import { colors, fonts, radius, shadow } from '@/theme';
import type { Expression, Person } from '@/types';
import { Avatar } from '../Avatar';

/**
 * 선생님/친구 카드: 아이가 고른 성격 색 배경 위에 아바타,
 * 모서리에 닮은 동물과 모양 배지, 아래에 성격 스티커.
 */
export function PersonCard({
  person,
  size = 120,
  expression = 'happy',
  showTraits = true,
  showName = true,
}: {
  person: Person;
  size?: number;
  expression?: Expression;
  showTraits?: boolean;
  showName?: boolean;
}) {
  const p = person.persona;
  const bg = colorOf(p?.color)?.color ?? '#EAF6FF';
  const animal = animalOf(p?.animal);
  const shape = shapeOf(p?.shape);
  const badge = Math.max(26, size * 0.28);
  return (
    <View style={{ alignItems: 'center', width: size + 16 }}>
      <View style={{ width: size + 8, height: size + 8 }}>
        <View style={[styles.frame, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, backgroundColor: bg }]}>
          <View style={{ marginTop: size * 0.04 }}>
            <Avatar avatar={person.avatar} size={size * 0.92} expression={expression} />
          </View>
        </View>
        {shape && (
          <View style={[styles.badge, { left: -4, top: -4, width: badge, height: badge, borderRadius: badge / 2 }]}>
            <Text style={{ fontSize: badge * 0.6 }}>{shape.emoji}</Text>
          </View>
        )}
        {animal && (
          <View style={[styles.badge, { right: -6, bottom: -2, width: badge * 1.2, height: badge * 1.2, borderRadius: badge * 0.6 }]}>
            <Text style={{ fontSize: badge * 0.75 }}>{animal.emoji}</Text>
          </View>
        )}
      </View>
      {showName && (
        <Text style={[styles.name, { fontSize: Math.max(13, size * 0.13) }]} numberOfLines={1}>
          {callName(person.name, person.kind)}
        </Text>
      )}
      {showTraits && p && p.traits.length > 0 && (
        <View style={styles.traits}>
          {p.traits.map((t) => {
            const c = traitOf(t);
            return c ? (
              <Text key={t} style={styles.trait}>
                {c.emoji} {c.label}
              </Text>
            ) : null;
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden', borderWidth: 4, borderColor: '#FFFFFF' },
  badge: {
    position: 'absolute',
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    shadowOpacity: 0.15,
  },
  name: { fontFamily: fonts.title, color: colors.ink, marginTop: 6 },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 4 },
  trait: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
