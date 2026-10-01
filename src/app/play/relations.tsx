import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Maru } from '@/components/Mascot';
import { BigButton, Confetti, Dots, Screen } from '@/components/ui';
import { edgeSentence, makeWho, NOBODY, planQuests, questPrompt, relationOf, relationResponse, SELF, UNKNOWN } from '@/games/relations';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { uuid } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { AvatarConfig } from '@/types';

/**
 * 관계도 놀이 (아이용): 질문 3개.
 * 위에 질문과 주인공 얼굴, 아래에 큰 얼굴 카드. 누르면 두 얼굴이 스티커로 이어지고 다음 질문으로.
 * 전체 관계 지도는 부모 화면에서만 본다.
 */
export default function RelationsGame() {
  const app = useApp();
  const profile = app.profile;
  const people = profile?.people ?? [];
  const [quests] = useState(() => planQuests(people, app.responses));
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(quests.length === 0);
  const [pop] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const who = makeWho(people, '나', { kid: true });
  const quest = quests[qi];
  const prompt = done ? (quests.length ? '다 했어! 고마워!' : '공방에서 선생님과 친구를 먼저 만들어 봐!') : quest ? questPrompt(quest, who) : '';

  useEffect(() => {
    const t = setTimeout(() => say(prompt), 350);
    if (done && quests.length) celebrate();
    return () => clearTimeout(t);
    // 질문이 바뀔 때만 읽어준다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, done]);
  useEffect(
    () => () => {
      stopSpeaking();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!profile) return null;

  const avatarOf = (id: string): AvatarConfig | null => (id === SELF ? profile.child.avatar : (people.find((p) => p.id === id)?.avatar ?? null));

  const choose = (to: string) => {
    if (!quest || answer) return;
    tap();
    setAnswer(to);
    const r = relationResponse(quest.subject, quest.rel, to, uuid());
    app.saveRelations([r], 1).catch(() => {});
    if (to === NOBODY || to === UNKNOWN) say(to === NOBODY ? '그렇구나. 알려줘서 고마워!' : '괜찮아, 몰라도 돼!');
    else {
      say(`${edgeSentence({ rel: quest.rel, from: quest.subject, to }, who)}!`);
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    }
    timer.current = setTimeout(() => {
      setAnswer(null);
      if (qi + 1 < quests.length) setQi(qi + 1);
      else setDone(true);
    }, 1800);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable accessibilityLabel="그만하기" onPress={() => router.back()} style={styles.iconBtn}>
          <Text style={styles.iconText}>✕</Text>
        </Pressable>
        {!done && <Dots index={qi} total={quests.length} />}
        <View style={styles.iconBtn} />
      </View>

      <Pressable onPress={() => say(prompt)} style={styles.ask} accessibilityHint="다시 듣기">
        <Maru size={36} mood={done ? 'wow' : 'happy'} />
        <Text style={styles.askText}>{prompt}</Text>
        <Text style={styles.speaker}>🔊</Text>
      </Pressable>

      {done ? (
        <View style={styles.end}>
          {quests.length ? <Text style={styles.stars}>⭐ 별 {quests.length}개!</Text> : null}
          <BigButton label={quests.length ? '다 했어' : '공방 가기'} onPress={() => (quests.length ? router.back() : router.replace('/play/workshop'))} />
        </View>
      ) : quest ? (
        <>
          {/* 주인공 ─ 스티커 ─ 고른 사람 */}
          <View style={styles.stage}>
            <Face avatar={avatarOf(quest.subject)} name={who(quest.subject)} size={answer ? 92 : 112} />
            {answer && answer !== NOBODY && answer !== UNKNOWN && (
              <Animated.View style={[styles.link, { transform: [{ scale: pop }] }]}>
                <Text style={styles.linkEmoji}>{relationOf(quest.rel)!.emoji}</Text>
                <View style={[styles.linkLine, { backgroundColor: relationOf(quest.rel)!.color }]} />
              </Animated.View>
            )}
            {answer && answer !== NOBODY && answer !== UNKNOWN && (
              <Animated.View style={{ transform: [{ scale: pop }] }}>
                <Face avatar={avatarOf(answer)} name={who(answer)} size={92} />
              </Animated.View>
            )}
          </View>

          <ScrollView key={qi} contentContainerStyle={styles.grid} style={[styles.sheet, answer ? { opacity: 0.4 } : null]}>
            {quest.candidates.map((id) => (
              <Pressable key={id} accessibilityLabel={who(id)} disabled={!!answer} onPress={() => choose(id)} style={[styles.card, answer === id && styles.cardOn]}>
                <Face avatar={avatarOf(id)} name={who(id)} size={76} />
              </Pressable>
            ))}
            {quest.allowNobody && (
              <Pressable accessibilityLabel="없어" disabled={!!answer} onPress={() => choose(NOBODY)} style={[styles.card, styles.soft]}>
                <Text style={styles.big}>🙅</Text>
                <Text style={styles.name}>없어</Text>
              </Pressable>
            )}
            <Pressable accessibilityLabel="몰라" disabled={!!answer} onPress={() => choose(UNKNOWN)} style={[styles.card, styles.soft]}>
              <Text style={styles.big}>🤔</Text>
              <Text style={styles.name}>몰라</Text>
            </Pressable>
          </ScrollView>
        </>
      ) : null}
      {done && quests.length > 0 && <Confetti />}
    </Screen>
  );
}

function Face({ avatar, name, size }: { avatar: AvatarConfig | null; name: string; size: number }) {
  return (
    <View style={{ alignItems: 'center', width: size + 12 }}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatar ? <Avatar avatar={avatar} size={size} /> : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4 },
  iconBtn: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: colors.inkSoft, fontFamily: fonts.body },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 4, minHeight: 56 },
  askText: { flex: 1, fontFamily: fonts.title, fontSize: 22, lineHeight: 30, color: colors.ink },
  speaker: { fontSize: 18, opacity: 0.6 },
  stage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 150, paddingVertical: 8 },
  link: { alignItems: 'center', width: 56 },
  linkEmoji: { fontSize: 30 },
  linkLine: { height: 5, width: 56, borderRadius: 3, marginTop: 2 },
  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, padding: 14, paddingBottom: 28 },
  card: {
    width: 104,
    height: 116,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  soft: { borderStyle: 'dashed' },
  circle: { overflow: 'hidden', backgroundColor: colors.skySoft, alignItems: 'center' },
  name: { fontFamily: fonts.title, fontSize: 15, color: colors.ink, marginTop: 4 },
  big: { fontSize: 40 },
  end: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  stars: { fontFamily: fonts.title, fontSize: 28, color: colors.ink, textAlign: 'center' },
});
