import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { changeLine, compareDiary, diarySentence, type DiaryPage } from '@/games/diary';
import { say } from '@/lib/feedback';
import { colors, fonts, radius } from '@/theme';
import type { AvatarConfig } from '@/types';
import { BigButton } from '../ui';
import { DiaryPaper } from './DiaryPaper';

/** 그림일기 완성: 일기 문장을 읽어 주고, 이때 처음으로 지난 장과 비교해 보여준다 */
export function DiaryDone({
  page,
  prev,
  who,
  avatar,
  me,
  width,
  onAnother,
  onFinish,
}: {
  page: DiaryPage;
  prev?: DiaryPage;
  who: string;
  avatar: AvatarConfig;
  me: AvatarConfig;
  width: number;
  onAnother: () => void;
  onFinish: () => void;
}) {
  const { changed, same } = compareDiary(prev, page);
  const sentence = diarySentence(page, who);
  const lines = changed.slice(0, 4).map(changeLine);
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <DiaryPaper page={page} name={who} avatar={avatar} me={me} width={width} />
      <Pressable onPress={() => say(sentence)} style={styles.sentence} accessibilityHint="다시 듣기">
        <Text style={styles.sentenceText}>{sentence}</Text>
      </Pressable>
      <View style={styles.compare}>
        <Text style={styles.compareTitle}>{prev ? '지난번이랑 비교해 볼까?' : '첫 일기야! 🎉'}</Text>
        {lines.map((l) => (
          <Pressable key={l} onPress={() => say(l)}>
            <Text style={styles.compareLine}>🔁 {l}</Text>
          </Pressable>
        ))}
        {same[0] && <Text style={styles.compareLine}>✨ {same[0].device.label}: 오늘도 {same[0].after.map((p) => p.label).join(', ')}!</Text>}
        {prev && !lines.length && !same.length && <Text style={styles.compareLine}>오늘은 지난번과 다른 칸을 꾸몄어!</Text>}
      </View>
      <Text style={styles.stars}>⭐ 별 2개!</Text>
      <View style={styles.row}>
        <BigButton small variant="secondary" label="다른 사람 일기" onPress={onAnother} style={{ flex: 1 }} />
        <BigButton small label="다 했어" onPress={onFinish} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 40 },
  sentence: { backgroundColor: '#FFFDF6', borderRadius: radius.lg, borderWidth: 1, borderColor: '#EBDDBF', padding: 14 },
  sentenceText: { fontFamily: fonts.title, fontSize: 18, lineHeight: 28, color: colors.ink },
  compare: { backgroundColor: colors.skySoft, borderRadius: radius.lg, padding: 14, gap: 8 },
  compareTitle: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  compareLine: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  stars: { fontFamily: fonts.title, fontSize: 22, color: colors.ink, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8 },
});
