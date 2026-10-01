import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Panel, ParentShell, Section } from '@/components/report/ParentShell';
import { KIND_RING, RelationMap } from '@/components/relations/RelationMap';
import { callName } from '@/games/persona';
import { currentEdges, edgeSentence, makeWho, NOBODY, parseRelationValue, relationOf, RELATIONS, SELF, UNKNOWN } from '@/games/relations';
import { sceneStats } from '@/games/art';
import { describeRelation } from '@/report/analyze';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });

/** 부모용 관계도: 아이가 이은 지금의 관계 지도 + 걱정되는 선 / 좋은 선 / 대답 기록 */
export default function ParentRelations() {
  const { profile, responses, drawings } = useApp();
  const data = useMemo(() => {
    if (!profile) return null;
    const people = profile.people;
    const edges = currentEdges(responses, people).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const who = makeWho(people, profile.child.name);
    const rel = responses.filter((r) => r.game === 'relation').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const answers = rel.filter((r) => {
      const p = parseRelationValue(r.value);
      return p && !p.removed && (p.to === NOBODY || p.to === UNKNOWN);
    });
    return { edges, who, rel, answers };
  }, [profile, responses]);
  if (!profile || !data) return null;
  const { edges, who, rel, answers } = data;
  const worry = edges.filter((e) => relationOf(e.rel)!.score < 0);
  const good = edges.filter((e) => relationOf(e.rel)!.score >= 0);
  const nodes = [
    { id: SELF, name: profile.child.name, kind: 'self' as const, avatar: profile.child.avatar },
    ...profile.people.map((p) => ({ id: p.id, name: callName(p.name, p.kind, p.role), kind: p.kind, avatar: p.avatar })),
  ];

  return (
    <ParentShell title="관계도">
      <Panel style={{ padding: 8 }}>
        {edges.length ? (
          <RelationMap nodes={nodes} edges={edges} height={Math.min(460, 90 + nodes.length * 22)} />
        ) : (
          <Text style={[styles.body, { padding: 16 }]}>아직 이어진 선이 없어요. 아이 화면의 “관계도” 놀이에서 마루가 질문하며 관계를 이어요.</Text>
        )}
      </Panel>

      <View style={styles.legend}>
        {(
          [
            ['self', profile.child.name],
            ['teacher', '선생님'],
            ['friend', '친구'],
            ['parent', '어른'],
          ] as const
        ).map(([k, label]) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.dot, { borderColor: KIND_RING[k] }]} />
            <Text style={styles.small}>{label}</Text>
          </View>
        ))}
        <Text style={styles.small}>· 점선은 조심스러운 관계, 화살표는 방향이에요</Text>
      </View>

      <Section title="살펴볼 연결" sub="아이 마음의 지도예요. 사실 확인보다 '왜 그렇게 이었어?'를 궁금해해 주세요.">
        <View style={styles.list}>
          {worry.length === 0 && <Text style={[styles.body, { padding: 14 }]}>걱정되는 선은 없어요.</Text>}
          {worry.map((e, i) => (
            <Row key={e.key} emoji={relationOf(e.rel)!.emoji} text={edgeSentence(e, who)} date={dateOf(e.createdAt)} last={i === worry.length - 1} color={relationOf(e.rel)!.color} />
          ))}
        </View>
      </Section>

      <Section title="좋은 연결">
        <View style={styles.list}>
          {good.length === 0 && <Text style={[styles.body, { padding: 14 }]}>아직 없어요.</Text>}
          {good.map((e, i) => (
            <Row key={e.key} emoji={relationOf(e.rel)!.emoji} text={edgeSentence(e, who)} date={dateOf(e.createdAt)} last={i === good.length - 1} />
          ))}
        </View>
      </Section>

      {answers.length > 0 && (
        <Section title="'아무도 없어' · '잘 모르겠어' 대답">
          <View style={styles.list}>
            {answers.slice(0, 6).map((r, i, xs) => {
              const d = describeRelation(r, profile.people, profile.child.name);
              return <Row key={r.id} emoji={d.emoji} text={d.text} date={dateOf(r.createdAt)} last={i === xs.length - 1} />;
            })}
          </View>
        </Section>
      )}

      {(() => {
        const scene = [...drawings].filter((d) => d.kind === 'scene').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        if (!scene) return null;
        const st = sceneStats(scene, profile.people);
        const pairs = st.neighbors.map(([a, b]) => `${who(a)} – ${who(b)}`);
        return (
          <Section title="우리 반 그림에서" sub={`${dateOf(scene.createdAt)}에 그린 그림 기준이에요`}>
            <View style={styles.list}>
              <Row emoji="🤝" text={`서로 옆에 그린 사람: ${pairs.length ? pairs.join(', ') : '없음'}`} date="" last={!st.missingTeachers.length} />
              {st.missingTeachers.length > 0 && <Row emoji="❔" text={`그리지 않은 선생님: ${st.missingTeachers.map(who).join(', ')}`} date="" last />}
            </View>
          </Section>
        );
      })()}

      <Section title="관계 스티커 뜻">
        <Panel style={styles.stickers}>
          {RELATIONS.map((r) => (
            <Text key={r.id} style={styles.sticker}>
              {r.emoji} {r.label}
            </Text>
          ))}
        </Panel>
      </Section>

      {rel.length > 0 && (
        <Section title="최근 관계도 기록">
          <View style={styles.list}>
            {rel.slice(0, 8).map((r, i, xs) => {
              const d = describeRelation(r, profile.people, profile.child.name);
              return <Row key={r.id} emoji={d.emoji} text={d.text} date={dateOf(r.createdAt)} last={i === xs.length - 1} />;
            })}
          </View>
        </Section>
      )}
    </ParentShell>
  );
}

function Row({ emoji, text, date, last, color }: { emoji: string; text: string; date: string; last: boolean; color?: string }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[styles.body, { flex: 1 }, color ? { fontWeight: '700' } : null]}>{text}</Text>
      <Text style={styles.small}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 20 },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: -12, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, backgroundColor: colors.paper },
  list: { backgroundColor: colors.paper, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  stickers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sticker: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
