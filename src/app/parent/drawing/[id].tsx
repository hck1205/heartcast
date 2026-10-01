import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ArtCanvas } from '@/components/art/ArtCanvas';
import { drawingTitle } from '@/components/art/DrawingStrip';
import { NoteBox } from '@/components/report/NoteBox';
import { Panel, ParentShell, Section } from '@/components/report/ParentShell';
import { describeDrawing } from '@/games/art';
import { avatarFor, makeWho } from '@/games/people';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';

/** 부모용 그림 상세: 그림을 그대로 크게 + 아이가 표현한 것 한 줄씩 + 대화 기록 */
export default function DrawingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, drawings } = useApp();
  const { width } = useWindowDimensions();
  const d = drawings.find((x) => x.id === id);
  if (!profile) return null;
  if (!d)
    return (
      <ParentShell title="그림">
        <Text style={styles.body}>그림을 찾을 수 없어요.</Text>
      </ParentShell>
    );
  const lines = describeDrawing(d, profile.people, profile.child.name);
  const w = Math.min(width - 32, 480);

  return (
    <ParentShell title={drawingTitle(d, profile)}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <ArtCanvas drawing={d} avatarOf={avatarFor(profile)} labelOf={makeWho(profile.people, profile.child.name)} width={w} />
        <Text style={styles.date}>{new Date(d.createdAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
      </View>

      <Section title="아이가 표현한 것">
        <Panel>
          {lines.map((l) => (
            <Text key={l} style={styles.body}>
              • {l}
            </Text>
          ))}
        </Panel>
      </Section>

      <Panel style={{ backgroundColor: colors.skySoft, borderColor: colors.skySoft }}>
        <Text style={styles.tip}>
          그림은 아이의 그날 마음이에요. 해석하기보다 “이건 누구야? 무슨 말 하고 있어? 그때 너는 어디 있었어?”처럼 아이가 직접 설명하게 해 주세요. 아이가 한 말은 아래에 그대로 적어 두면 흐름을 보는 데 도움이 돼요.
        </Text>
      </Panel>

      <NoteBox targetId={d.subjectId} />
    </ParentShell>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 24 },
  date: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted },
  tip: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 21 },
});
