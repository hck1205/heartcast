import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { MoodLine, TrendBadge, WeatherBar } from '@/components/report/charts';
import { NoteBox } from '@/components/report/NoteBox';
import { Panel, ParentShell, Section } from '@/components/report/ParentShell';
import { SignalCard } from '@/components/report/SignalCard';
import { PortraitSection } from '@/components/report/PortraitSection';
import { PersonCard } from '@/components/studio/PersonCard';
import { BigButton } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { FACES, SCENES } from '@/games/content';
import { withoutHeadwear } from '@/lib/avatar';
import { buildReport, describeResponse, faceEmoji, weatherLabel } from '@/report/analyze';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

export default function PersonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, responses } = useApp();
  const { width } = useWindowDimensions();
  const report14 = useMemo(() => buildReport(responses, profile?.people ?? [], new Date(), 14), [responses, profile]);
  const person = profile?.people.find((p) => p.id === id);
  if (!profile || !person) return null;

  const s = [...report14.teachers, ...report14.friends].find((x) => x.targetId === id)!;
  const signals = report14.signals.filter((x) => x.targetId === id);
  const mine = responses.filter((r) => r.targetId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const faceTally = FACES.map((f) => ({ ...f, n: mine.filter((r) => r.game === 'face' && r.value === f.code).length })).filter((f) => f.n);
  const stories = mine.filter((r) => r.game === 'story').slice(0, 6);

  return (
    <ParentShell title={s.name}>
      <Panel style={{ alignItems: 'center', backgroundColor: '#EAF6FF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <PersonCard person={person} size={110} expression="calm" showName={false} showTraits={false} />
          {s.weather && <WeatherIcon code={s.weather} size={80} />}
        </View>
        <Text style={styles.big}>최근 2주: {s.weather ? `'${weatherLabel(s.weather)}'` : '기록 없음'}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TrendBadge trend={s.trend} />
          <Text style={styles.meta}>답 {s.answered}개</Text>
        </View>
      </Panel>

      {signals.map((sig) => (
        <SignalCard key={sig.id} signal={sig} />
      ))}

      <PortraitSection person={person} responses={responses} />

      <Section title="날씨 흐름 (14일)" sub="-2(천둥) ~ +2(맑음). 하루에 여러 번 고르면 평균이에요">
        <Panel>
          <MoodLine daily={s.daily} width={Math.min(width, 720) - 64} />
          <WeatherBar distribution={s.distribution} />
        </Panel>
      </Section>

      {faceTally.length > 0 && (
        <Section title="아이가 고른 얼굴">
          <Panel style={styles.faceRow}>
            {faceTally.map((f) => (
              <View key={f.code} style={styles.faceItem}>
                <Avatar avatar={withoutHeadwear(person.avatar)} expression={f.code} size={58} />
                <Text style={styles.meta}>
                  {faceEmoji[f.code]} {f.parentLabel} {f.n}
                </Text>
              </View>
            ))}
          </Panel>
        </Section>
      )}

      {stories.length > 0 && (
        <Section title="이야기 장면에서 떠올린 모습" sub="상황 그림을 보고 선생님이 어떻게 할지 고른 답이에요">
          <Panel style={{ gap: 10 }}>
            {stories.map((r) => {
              const [sceneId, code] = r.value.split(':');
              const scene = SCENES.find((x) => x.id === sceneId);
              const re = scene?.reactions.find((x) => x.code === code);
              return (
                <View key={r.id} style={[styles.storyRow, re?.fear && styles.storyFear]}>
                  <Text style={{ fontSize: 28 }}>{scene?.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storyTitle}>{scene?.title}</Text>
                    <Text style={styles.meta}>
                      → {re?.emoji} {re?.parentLabel ?? (r.value === 'unknown' ? '잘 모르겠어' : code)}
                    </Text>
                  </View>
                  <Text style={styles.date}>{new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</Text>
                </View>
              );
            })}
          </Panel>
        </Section>
      )}

      <Section title="전체 기록">
        <Panel style={{ gap: 8 }}>
          {mine.slice(0, 12).map((r) => {
            const d = describeResponse(r, profile.people);
            return (
              <Text key={r.id} style={styles.line}>
                {d.emoji} {new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} · {d.text}
              </Text>
            );
          })}
          {!mine.length && <Text style={styles.line}>아직 기록이 없어요</Text>}
        </Panel>
      </Section>

      <BigButton
        label="그랬구나 대화 카드"
        icon="💛"
        onPress={() => router.push({ pathname: '/parent/talk', params: signals[0] ? { signal: signals[0].id } : {} })}
      />
      <NoteBox targetId={person.id} />
    </ParentShell>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: fonts.title, fontSize: 22, color: colors.ink, marginTop: 6 },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  faceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  faceItem: { alignItems: 'center' },
  storyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: radius.sm },
  storyFear: { backgroundColor: '#FFF1EC' },
  storyTitle: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  line: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 21 },
});
