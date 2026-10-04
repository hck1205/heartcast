import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { diaryPages } from '@/games/diary';
import { peopleGroups } from '@/games/people';
import { nameOf } from '@/games/persona';
import { isSameDay } from '@/lib/dates';
import { colors, fonts, radius } from '@/theme';
import type { Person, PlayResponse } from '@/types';
import { PersonCard } from '../studio/PersonCard';

/** 그림일기 첫 단계: 누구 일기를 쓸지 고른다 (오늘 이미 쓴 사람에게는 ✓) */
export function DiaryPick({ people, responses, onPick }: { people: Person[]; responses: PlayResponse[]; onPick: (p: Person) => void }) {
  const wroteToday = (id: string) => diaryPages(responses, id).some((pg) => isSameDay(pg.at, new Date()));
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      {peopleGroups(people).map((g) => (
        <View key={g.kind} style={{ gap: 8 }}>
          <Text style={styles.group}>{g.label}</Text>
          <View style={styles.cards}>
            {g.people.map((p) => (
              <Pressable key={p.id} accessibilityLabel={`${nameOf(p)} 일기 쓰기`} onPress={() => onPick(p)} style={styles.card}>
                <PersonCard person={p} size={76} showTraits={false} />
                {wroteToday(p.id) && <Text style={styles.done}>✓ 오늘 씀</Text>}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 18, paddingBottom: 40 },
  group: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: 104, alignItems: 'center', paddingVertical: 8, borderRadius: radius.lg, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  done: { fontFamily: fonts.title, fontSize: 12, color: colors.primaryDark },
});
