import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { compareDiary, diarySentence, parentWords, pickedDevices, type DiaryPage } from '@/games/diary';
import { nameOf } from '@/games/persona';
import { shortDate } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';
import type { Person, Profile } from '@/types';
import { DiaryPaper, diaryDate } from '../diary/DiaryPaper';

/**
 * 부모용 그림일기 한 장: 작은 그림 + 칸별로 고른 것(부모용 뜻풀이).
 * 바로 앞 장과 달라진 칸은 "이전 → 오늘"로 강조한다.
 */
export function DiaryCard({ page, prev, person, profile }: { page: DiaryPage; prev?: DiaryPage; person: Person; profile: Profile }) {
  const { changed } = compareDiary(prev, page);
  const changedIds = new Map(changed.map((c) => [c.device.id, c]));
  const who = nameOf(person);
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{diaryDate(page.at)}</Text>
      <View style={styles.row}>
        <DiaryPaper page={page} name={who} avatar={person.avatar} me={profile.child.avatar} width={132} compact />
        <View style={styles.list}>
          {pickedDevices(page).map(({ device, picks }) => {
            const ch = changedIds.get(device.id);
            return (
              <Text key={device.id} style={[styles.item, ch && styles.changed]}>
                <Text style={styles.key}>{device.label} </Text>
                {ch ? `${parentWords(ch.before)} → ` : ''}
                {parentWords(picks)}
              </Text>
            );
          })}
        </View>
      </View>
      <Text style={styles.sentence}>“{diarySentence(page, who)}”</Text>
    </View>
  );
}

/** 리포트 첫 화면: 최근 그림일기 줄 (누르면 그 사람 상세로) */
export function DiaryStrip({ pages, profile }: { pages: DiaryPage[]; profile: Profile }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }}>
      {pages.map((pg) => {
        const p = profile.people.find((x) => x.id === pg.personId);
        if (!p) return null;
        return (
          <Pressable
            key={pg.id}
            accessibilityLabel={`${nameOf(p)} 그림일기 보기`}
            onPress={() => router.push({ pathname: '/parent/person/[id]', params: { id: p.id } })}
            style={styles.thumb}
          >
            <DiaryPaper page={pg} name={nameOf(p)} avatar={p.avatar} me={profile.child.avatar} width={128} compact />
            <Text style={styles.thumbName} numberOfLines={1}>
              {nameOf(p)}
            </Text>
            <Text style={styles.thumbDate}>{shortDate(pg.at)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 12, gap: 8 },
  date: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  list: { flex: 1, gap: 3 },
  item: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.ink },
  changed: { backgroundColor: '#FFF1D6', borderRadius: 4 },
  key: { fontWeight: '700', color: colors.inkSoft },
  sentence: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.inkSoft },
  thumb: { width: 128, gap: 2 },
  thumbName: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.ink },
  thumbDate: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
});
