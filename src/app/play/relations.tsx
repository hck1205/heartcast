import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Maru } from '@/components/Mascot';
import { RelationMap, type MapNode } from '@/components/relations/RelationMap';
import { BigButton, Confetti, Dots, Screen } from '@/components/ui';
import { callName } from '@/games/persona';
import {
  currentEdges,
  edgeKey,
  edgeSentence,
  edgesBetween,
  makeWho,
  NOBODY,
  planQuests,
  questPrompt,
  relationOf,
  relationResponse,
  RELATIONS,
  SELF,
  UNKNOWN,
  type Edge,
  type RelationId,
} from '@/games/relations';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { PlayResponse } from '@/types';

type Phase = 'quest' | 'done' | 'free';

/**
 * 관계도 놀이.
 * 1) 마루가 묻는 5문항: "하준이는 누구랑 제일 친해?" → 사람을 누르면 선이 이어진다.
 * 2) 내 맘대로 잇기: 두 사람을 차례로 누르고 관계 스티커를 붙인다. 스티커를 누르면 지울 수 있다.
 */
export default function RelationsGame() {
  const app = useApp();
  const profile = app.profile;
  const people = profile?.people ?? [];
  const [quests] = useState(() => planQuests(people, app.responses));
  const [phase, setPhase] = useState<Phase>(quests.length ? 'quest' : 'free');
  const [qi, setQi] = useState(0);
  const [added, setAdded] = useState<PlayResponse[]>([]);
  const [fresh, setFresh] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [edgeToRemove, setEdgeToRemove] = useState<Edge | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const who = makeWho(people, '나', { kid: true });
  const quest = phase === 'quest' ? quests[qi] : undefined;
  const prompt =
    phase === 'quest' && quest
      ? questPrompt(quest, who)
      : phase === 'done'
        ? '관계도 완성! 우리 반이 이렇게 이어져 있구나.'
        : picked.length === 0
          ? '두 사람을 차례로 눌러서 이어 봐!'
          : picked.length === 1
            ? `${josa(who(picked[0]), '이랑/랑')} 누구를 이어 볼까?`
            : `${josa(who(picked[0]), '이랑/랑')} ${josa(who(picked[1]), '은/는')} 어떤 사이야?`;

  useEffect(() => {
    const t = setTimeout(() => say(prompt), 350);
    if (phase === 'done') celebrate();
    return () => clearTimeout(t);
    // 질문이 바뀔 때만 읽어준다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qi, picked.length]);
  useEffect(
    () => () => {
      stopSpeaking();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!profile) return null;

  const all = [...app.responses, ...added.filter((a) => !app.responses.some((r) => r.id === a.id))];
  const edges = currentEdges(all, people);
  const nodes: MapNode[] = [
    { id: SELF, name: '나', kind: 'self', avatar: profile.child.avatar },
    ...people.map((p) => ({ id: p.id, name: callName(p.name, p.kind), kind: p.kind, avatar: p.avatar })),
  ];

  const record = (from: string, rel: RelationId, to: string, opts: { removed?: boolean; star?: boolean } = {}) => {
    const r = relationResponse(from, rel, to, uuid(), { removed: opts.removed });
    setAdded((xs) => [...xs, r]);
    app.saveRelations([r], opts.star ? 1 : 0).catch(() => {});
    return r;
  };

  const answer = (to: string) => {
    if (!quest || busy) return;
    tap();
    setBusy(true);
    record(quest.subject, quest.rel, to, { star: true });
    if (to === NOBODY || to === UNKNOWN) {
      setFresh(null);
      say(to === NOBODY ? '그렇구나. 알려줘서 고마워!' : '괜찮아, 잘 몰라도 돼!');
    } else {
      setFresh(edgeKey(quest.rel, quest.subject, to));
      say(`${edgeSentence({ rel: quest.rel, from: quest.subject, to }, who)}!`);
    }
    timer.current = setTimeout(() => {
      setBusy(false);
      setFresh(null);
      if (qi + 1 < quests.length) setQi(qi + 1);
      else setPhase('done');
    }, 1600);
  };

  const pressNode = (id: string) => {
    if (phase === 'quest') return answer(id);
    if (phase !== 'free') return;
    tap();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 2 ? [id] : [...p, id]));
  };

  const connect = (rel: RelationId) => {
    const [a, b] = picked;
    tap();
    record(a, rel, b);
    setFresh(edgeKey(rel, a, b));
    say(`${edgeSentence({ rel, from: a, to: b }, who)}!`);
    setPicked([]);
  };

  const between = picked.length === 2 ? edgesBetween(edges, picked[0], picked[1]) : [];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityLabel="그만하기" onPress={() => router.back()} style={styles.iconBtn}>
          <Text style={styles.iconText}>✕</Text>
        </Pressable>
        {phase === 'quest' ? <Dots index={qi} total={quests.length} /> : <Text style={styles.title}>{phase === 'free' ? '내 맘대로 잇기' : '관계도'}</Text>}
        <View style={styles.iconBtn} />
      </View>

      <Pressable onPress={() => say(prompt)} style={styles.ask} accessibilityHint="다시 듣기">
        <Maru size={36} mood={phase === 'done' ? 'wow' : 'happy'} />
        <Text style={styles.askText}>{prompt}</Text>
        <Text style={styles.speaker}>🔊</Text>
      </Pressable>

      <View style={styles.mapWrap}>
        {people.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>우리 반 공방에서 선생님과 친구를 먼저 만들어 봐!</Text>
            <BigButton small label="공방 가기" onPress={() => router.replace('/play/workshop')} />
          </View>
        ) : (
          <RelationMap
            nodes={nodes}
            edges={edges}
            focus={quest?.subject}
            selectable={quest ? quest.candidates : undefined}
            selected={phase === 'free' ? picked : []}
            dimOthers={phase === 'quest'}
            fresh={fresh}
            onPressNode={phase === 'done' ? undefined : pressNode}
            onPressEdge={
              phase === 'free'
                ? (e) => {
                    tap();
                    setPicked([]);
                    setEdgeToRemove(e);
                  }
                : undefined
            }
          />
        )}
      </View>

      {/* 아래 판 */}
      <View style={styles.sheet}>
        {phase === 'quest' && quest && (
          <View style={styles.row}>
            {quest.allowNobody && <BigButton small variant="secondary" label="아무도 없어" disabled={busy} onPress={() => answer(NOBODY)} style={{ flex: 1 }} />}
            <BigButton small variant="ghost" label="🤔 잘 모르겠어" disabled={busy} onPress={() => answer(UNKNOWN)} style={{ flex: 1 }} />
          </View>
        )}

        {phase === 'done' && (
          <View style={{ gap: 8 }}>
            <Text style={styles.stars}>⭐ 별 {quests.length}개를 모았어요!</Text>
            <BigButton label="내 맘대로 더 잇기" onPress={() => setPhase('free')} />
            <BigButton variant="ghost" label="다 했어" onPress={() => router.back()} />
          </View>
        )}

        {phase === 'free' && edgeToRemove && (
          <View style={{ gap: 8 }}>
            <Text style={styles.sheetTitle}>
              {relationOf(edgeToRemove.rel)!.emoji} {edgeSentence(edgeToRemove, who)}
            </Text>
            <View style={styles.row}>
              <BigButton
                small
                variant="secondary"
                label="이 선 지우기"
                onPress={() => {
                  record(edgeToRemove.from, edgeToRemove.rel, edgeToRemove.to, { removed: true });
                  say('선을 지웠어');
                  setEdgeToRemove(null);
                }}
                style={{ flex: 1 }}
              />
              <BigButton small label="그대로 둘래" onPress={() => setEdgeToRemove(null)} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {phase === 'free' && !edgeToRemove && picked.length === 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stickers}>
            {RELATIONS.map((r) => {
              const has = between.some((e) => e.rel === r.id);
              return (
                <Pressable key={r.id} accessibilityLabel={r.label} disabled={has} onPress={() => connect(r.id)} style={[styles.sticker, { borderColor: r.color }, has && { opacity: 0.4 }]}>
                  <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
                  <Text style={styles.stickerText}>{r.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {phase === 'free' && !edgeToRemove && picked.length < 2 && (
          <View style={{ gap: 6 }}>
            <Text style={styles.helper}>스티커를 누르면 그 선을 지울 수 있어요</Text>
            <BigButton variant="secondary" small label="다 했어" onPress={() => router.back()} />
          </View>
        )}
      </View>
      {phase === 'done' && <Confetti />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4 },
  iconBtn: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: colors.inkSoft, fontFamily: fonts.body },
  title: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 4, minHeight: 56 },
  askText: { flex: 1, fontFamily: fonts.title, fontSize: 21, lineHeight: 28, color: colors.ink },
  speaker: { fontSize: 18, opacity: 0.6 },
  mapWrap: { flex: 1, marginHorizontal: 8, marginVertical: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  emptyText: { fontFamily: fonts.title, fontSize: 18, color: colors.inkSoft, textAlign: 'center' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    minHeight: 96,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: 8 },
  stars: { fontFamily: fonts.title, fontSize: 18, color: colors.ink, textAlign: 'center' },
  sheetTitle: { fontFamily: fonts.title, fontSize: 17, color: colors.ink, textAlign: 'center' },
  stickers: { gap: 8, paddingVertical: 2 },
  sticker: {
    width: 78,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  stickerText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
});
