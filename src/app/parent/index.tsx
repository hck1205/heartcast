import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { DayStrip, TrendBadge, WeatherBar } from '@/components/report/charts';
import { Panel, ParentShell, Section } from '@/components/report/ParentShell';
import { SignalCard } from '@/components/report/SignalCard';
import { WeatherIcon } from '@/components/WeatherIcon';
import { TOPICS } from '@/games/content';
import { buildReport, describeResponse, weatherLabel, type TargetSummary } from '@/report/analyze';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { Person } from '@/types';

const RANGES = [
  { days: 7, label: '최근 7일' },
  { days: 30, label: '최근 30일' },
];

export default function ParentReport() {
  const { profile, responses } = useApp();
  const [days, setDays] = useState(7);
  const report = useMemo(() => buildReport(responses, profile?.people ?? [], new Date(), days), [responses, profile, days]);
  if (!profile) return null;
  const name = profile.child.name;
  const recent = [...responses].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <ParentShell
      title={`${name}의 마음날씨 리포트`}
      back={false}
      right={
        <Pressable accessibilityLabel="설정" onPress={() => router.push('/parent/settings')}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </Pressable>
      }
    >
      <View style={styles.ranges}>
        {RANGES.map((r) => (
          <Pressable key={r.days} onPress={() => setDays(r.days)} style={[styles.range, days === r.days && styles.rangeOn]}>
            <Text style={[styles.rangeText, days === r.days && { color: '#fff' }]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* 한 줄 요약 */}
      <Panel style={styles.hero}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {report.overall.weather ? <WeatherIcon code={report.overall.weather} size={92} /> : <Text style={{ fontSize: 60 }}>🌫️</Text>}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.heroLabel}>
              {report.from.slice(5).replace('-', '/')} ~ {report.to.slice(5).replace('-', '/')}
            </Text>
            <Text style={styles.heroTitle}>
              {report.overall.weather ? `대체로 '${weatherLabel(report.overall.weather)}'` : '아직 기록이 없어요'}
            </Text>
            <Text style={styles.heroSub}>
              놀이 {report.sessionCount}번 · 고른 답 {report.responseCount}개
            </Text>
          </View>
        </View>
        {report.classroom && (
          <View style={{ gap: 6 }}>
            <Text style={styles.miniTitle}>🏫 교실 하늘 (매일)</Text>
            <DayStrip daily={report.classroom.daily.slice(-7)} />
          </View>
        )}
      </Panel>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          ℹ️ 아이의 선택은 그날 기분이나 놀이 자체에 따라 달라질 수 있어요. 한두 번의 답보다 <Text style={{ color: colors.ink }}>흐름</Text>을 봐 주시고, 판단보다 대화의 실마리로 써 주세요.
        </Text>
      </View>

      <Section title="함께 이야기 나눠볼 것" sub="눌러서 '그랬구나' 대화 카드를 볼 수 있어요">
        {report.signals.length ? (
          report.signals.map((s) => <SignalCard key={s.id} signal={s} />)
        ) : (
          <Panel>
            <Text style={styles.body}>특별히 눈에 띄는 신호는 없어요 🌤️</Text>
          </Panel>
        )}
        <Pressable onPress={() => router.push('/parent/talk')} style={styles.dailyLink}>
          <Text style={styles.dailyLinkText}>💛 오늘의 그랬구나 대화 카드 ›</Text>
        </Pressable>
      </Section>

      <Section title="선생님 마음날씨" sub="아이가 선생님 아바타에 붙인 날씨·얼굴·이야기 반응을 모았어요">
        {report.teachers.map((t) => (
          <PersonCard key={t.targetId} s={t} person={profile.people.find((p) => p.id === t.targetId)!} />
        ))}
      </Section>

      {report.friends.length > 0 && (
        <Section title="친구 마음날씨">
          {report.friends.map((t) => (
            <PersonCard key={t.targetId} s={t} person={profile.people.find((p) => p.id === t.targetId)!} compact />
          ))}
        </Section>
      )}

      <Section title="하루 속 순간들">
        <View style={styles.topicGrid}>
          {[report.self, ...report.topics].filter(Boolean).map((t) => (
            <TopicTile key={t!.targetId} s={t!} />
          ))}
        </View>
      </Section>

      <Section title="최근 아이가 고른 것">
        <Panel style={{ gap: 12 }}>
          {recent.length === 0 && <Text style={styles.body}>아직 놀이 기록이 없어요. 아이와 날씨 놀이를 시작해 보세요!</Text>}
          {recent.map((r) => {
            const d = describeResponse(r, profile.people);
            return (
              <View key={r.id} style={styles.timelineRow}>
                <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.body}>{d.text}</Text>
                  <Text style={styles.time}>
                    {new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                    {r.hesitationMs > 8000 ? ' · 오래 고민했어요' : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </Panel>
      </Section>

      <Pressable onPress={() => router.replace('/play')} style={styles.backToKid}>
        <Text style={styles.backToKidText}>🌈 아이 놀이 화면으로 돌아가기</Text>
      </Pressable>
    </ParentShell>
  );
}

function PersonCard({ s, person, compact }: { s: TargetSummary; person: Person; compact?: boolean }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/parent/person/[id]', params: { id: s.targetId } })}>
      <Panel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar avatar={person.avatar} size={compact ? 52 : 64} expression="calm" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.personName}>{s.name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={styles.personWeather}>{s.weather ? weatherLabel(s.weather) : '기록 없음'}</Text>
              <TrendBadge trend={s.trend} />
              {s.fearCount > 0 && <Text style={styles.fear}>😨 무서운 장면 {s.fearCount}</Text>}
            </View>
          </View>
          {s.weather && <WeatherIcon code={s.weather} size={compact ? 46 : 58} />}
        </View>
        {!compact && <DayStrip daily={s.daily.slice(-7)} size={24} />}
        <WeatherBar distribution={s.distribution} showLegend={!compact} />
        <Text style={styles.more}>자세히 보기 ›</Text>
      </Panel>
    </Pressable>
  );
}

function TopicTile({ s }: { s: TargetSummary }) {
  const t = TOPICS[s.targetId as keyof typeof TOPICS];
  return (
    <View style={styles.topic}>
      <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
      <Text style={styles.topicName}>{t.id === 'self' ? '아이 자신의 마음' : t.name}</Text>
      {s.weather ? <WeatherIcon code={s.weather} size={44} /> : <Text style={styles.time}>기록 없음</Text>}
      <Text style={styles.time}>{s.weather ? weatherLabel(s.weather) : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ranges: { flexDirection: 'row', backgroundColor: '#EEE9E0', borderRadius: radius.pill, padding: 4, alignSelf: 'center' },
  range: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: radius.pill },
  rangeOn: { backgroundColor: colors.ink },
  rangeText: { fontFamily: fonts.title, fontSize: 14, color: colors.inkSoft },
  hero: { backgroundColor: '#EAF6FF' },
  heroLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  heroTitle: { fontFamily: fonts.title, fontSize: 24, color: colors.ink },
  heroSub: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  miniTitle: { fontFamily: fonts.title, fontSize: 14, color: colors.inkSoft },
  note: { backgroundColor: '#F4F1EA', borderRadius: radius.md, padding: 12 },
  noteText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 },
  dailyLink: { alignSelf: 'flex-start', paddingVertical: 4 },
  dailyLinkText: { fontFamily: fonts.title, fontSize: 15, color: colors.primaryDark },
  personName: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  personWeather: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  fear: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.signal.talk,
    backgroundColor: '#FFF1EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  more: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, textAlign: 'right' },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topic: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  topicName: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  timelineRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  backToKid: { alignSelf: 'center', padding: 12 },
  backToKidText: { fontFamily: fonts.title, fontSize: 15, color: colors.sky },
});
