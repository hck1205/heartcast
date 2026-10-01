import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DrawingStrip } from '@/components/art/DrawingStrip';
import { RelationMap } from '@/components/relations/RelationMap';
import { TrendBadge } from '@/components/report/charts';
import { Panel, ParentShell, Section } from '@/components/report/ParentShell';
import { SignalCard } from '@/components/report/SignalCard';
import { PersonCard as MiniCard } from '@/components/studio/PersonCard';
import { Tabs } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { TOPICS } from '@/games/content';
import { callName } from '@/games/persona';
import { currentEdges, SELF } from '@/games/relations';
import { buildReport, describeResponse, weatherLabel, type TargetSummary } from '@/report/analyze';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { Person } from '@/types';

/** 부모 리포트: 한 줄 요약 → 이야기 나눠볼 것 → 사람 목록 → 하루 속 순간들 → 최근 기록 */
export default function ParentReport() {
  const { profile, responses, drawings } = useApp();
  const [range, setRange] = useState<'7' | '30'>('7');
  const days = Number(range);
  const report = useMemo(() => buildReport(responses, profile?.people ?? [], new Date(), days, profile?.child.name), [responses, profile, days]);
  if (!profile) return null;
  const name = profile.child.name;
  const recent = [...responses].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const signals = report.signals.slice(0, 3);
  const people = [...report.teachers, ...report.friends];
  const edges = currentEdges(responses, profile.people);

  return (
    <ParentShell
      title={`${name}의 마음 리포트`}
      back={false}
      right={
        <Pressable accessibilityLabel="설정" onPress={() => router.push('/parent/settings')} hitSlop={8}>
          <Text style={styles.settings}>설정</Text>
        </Pressable>
      }
    >
      <Tabs
        items={[
          { id: '7', label: '최근 7일' },
          { id: '30', label: '최근 30일' },
        ]}
        value={range}
        onChange={setRange}
      />

      {/* 한 줄 요약 */}
      <Panel style={styles.hero}>
        {report.overall.weather ? <WeatherIcon code={report.overall.weather} size={64} /> : <Text style={{ fontSize: 40 }}>🌫️</Text>}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.heroTitle}>{report.overall.weather ? `대체로 ${weatherLabel(report.overall.weather)}` : '아직 기록이 없어요'}</Text>
          <Text style={styles.heroSub}>
            {report.from.slice(5).replace('-', '/')}~{report.to.slice(5).replace('-', '/')} · 놀이 {report.sessionCount}번
          </Text>
        </View>
      </Panel>
      <Text style={styles.note}>아이의 선택은 그날 기분에 따라 달라질 수 있어요. 한두 번보다 흐름을 봐 주세요.</Text>

      <Section title="이야기 나눠볼 것">
        {signals.length ? (
          signals.map((s) => <SignalCard key={s.id} signal={s} />)
        ) : (
          <Panel>
            <Text style={styles.body}>특별히 눈에 띄는 신호는 없어요.</Text>
          </Panel>
        )}
        <Pressable onPress={() => router.push('/parent/talk')} hitSlop={6}>
          <Text style={styles.link}>오늘의 그랬구나 대화 카드 ›</Text>
        </Pressable>
      </Section>

      <Section title="선생님 · 친구">
        <View style={styles.list}>
          {people.map((t, i) => (
            <PersonRow key={t.targetId} s={t} person={profile.people.find((p) => p.id === t.targetId)!} last={i === people.length - 1} />
          ))}
        </View>
      </Section>

      <Section title="아이가 그린 그림" sub="표정 · 말풍선 · 스탬프 · 크레용으로 그린 선생님과 우리 반이에요">
        <DrawingStrip drawings={drawings} profile={profile} />
      </Section>

      <Section title="관계도" sub="아이가 이은 선생님 · 친구 · 어른 사이의 관계예요">
        <Pressable onPress={() => router.push('/parent/relations')} style={({ pressed }) => [styles.mapCard, pressed && { opacity: 0.8 }]}>
          {edges.length ? (
            <RelationMap
              nodes={[
                { id: SELF, name: name, kind: 'self', avatar: profile.child.avatar },
                ...profile.people.map((p) => ({ id: p.id, name: callName(p.name, p.kind, p.role), kind: p.kind, avatar: p.avatar })),
              ]}
              edges={edges}
              height={260}
            />
          ) : (
            <Text style={[styles.body, { padding: 8 }]}>아직 관계도 놀이 기록이 없어요.</Text>
          )}
          <Text style={[styles.link, { textAlign: 'right' }]}>관계도 자세히 보기 ›</Text>
        </Pressable>
      </Section>

      <Section title="하루 속 순간들">
        <View style={styles.topics}>
          {[report.self, ...report.topics].filter(Boolean).map((t) => {
            const topic = TOPICS[t!.targetId as keyof typeof TOPICS];
            return (
              <View key={t!.targetId} style={styles.topic}>
                {t!.weather ? <WeatherIcon code={t!.weather} size={32} /> : <Text style={styles.none}>–</Text>}
                <Text style={styles.topicName}>{topic.id === 'self' ? '아이 마음' : topic.name.replace(' 시간', '')}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="최근 고른 것">
        <View style={styles.list}>
          {recent.length === 0 && <Text style={[styles.body, { padding: 16 }]}>아직 놀이 기록이 없어요.</Text>}
          {recent.map((r, i) => {
            const d = describeResponse(r, profile.people, profile.child.name);
            return (
              <View key={r.id} style={[styles.row, i === recent.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={{ fontSize: 20 }}>{d.emoji}</Text>
                <Text style={[styles.body, { flex: 1 }]}>{d.text}</Text>
                <Text style={styles.time}>{new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      <Pressable onPress={() => router.replace('/play')} style={styles.backToKid} hitSlop={6}>
        <Text style={styles.link}>아이 화면으로 돌아가기</Text>
      </Pressable>
    </ParentShell>
  );
}

/** 사람 한 줄: 아바타 · 이름 · 추세 · 날씨 · › */
function PersonRow({ s, person, last }: { s: TargetSummary; person: Person; last: boolean }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/parent/person/[id]', params: { id: s.targetId } })}
      style={({ pressed }) => [styles.row, last && { borderBottomWidth: 0 }, pressed && { backgroundColor: colors.bg }]}
    >
      <MiniCard person={person} size={44} expression="calm" showName={false} showTraits={false} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.name}>{s.name}</Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Text style={styles.meta}>{s.weather ? weatherLabel(s.weather) : '기록 없음'}</Text>
          <TrendBadge trend={s.trend} />
          {s.fearCount > 0 && <Text style={styles.fear}>무서움 {s.fearCount}</Text>}
        </View>
      </View>
      {s.weather && <WeatherIcon code={s.weather} size={36} />}
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settings: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroTitle: { fontFamily: fonts.body, fontWeight: '700', fontSize: 21, color: colors.ink },
  heroSub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted, lineHeight: 18, marginTop: -12, paddingHorizontal: 4 },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 20 },
  link: { fontFamily: fonts.body, fontSize: 14, fontWeight: '600', color: colors.primaryDark },
  list: { backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: { fontFamily: fonts.body, fontWeight: '700', fontSize: 15, color: colors.ink },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  fear: { fontFamily: fonts.body, fontSize: 11, fontWeight: '700', color: colors.signal.talk },
  chev: { fontSize: 22, color: colors.inkMuted },
  topics: { flexDirection: 'row', gap: 8 },
  topic: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  topicName: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  none: { fontSize: 20, color: colors.inkMuted, height: 32, lineHeight: 32 },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  mapCard: { backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 10, gap: 4 },
  backToKid: { alignSelf: 'center', padding: 8 },
});
