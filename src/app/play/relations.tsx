import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { AskBar, KidHeader } from '@/components/kid/KidTop';
import { BigButton, Confetti, Dots, Screen } from '@/components/ui';
import { edgeSentence, makeWho, NOBODY, PAIR_CHOICES, planQuests, questPrompt, relationOf, relationResponse, SELF, UNKNOWN, type RelationId } from '@/games/relations';
import { josa } from '@/lib/josa';
import { celebrate, say, tap, useSayOnChange } from '@/lib/feedback';
import { uuid } from '@/lib/util';
import { avatarFor } from '@/games/people';
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
  /** 두 사람 질문에서 고른 관계 */
  const [pairRel, setPairRel] = useState<RelationId | null>(null);
  const [done, setDone] = useState(quests.length === 0);
  const [pop] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const who = makeWho(people, '나', { kid: true });
  const quest = quests[qi];
  const prompt = done ? (quests.length ? '다 했어! 고마워!' : '공방에서 선생님과 친구를 먼저 만들어 봐!') : quest ? questPrompt(quest, who) : '';

  // 질문이 바뀔 때만 읽어준다
  useSayOnChange(prompt, `${qi}-${done}`, 350);
  useEffect(() => {
    if (done && quests.length) celebrate();
  }, [done, quests.length]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!profile) return null;

  const avatarOf = avatarFor(profile);

  const next = () => {
    timer.current = setTimeout(() => {
      setAnswer(null);
      setPairRel(null);
      if (qi + 1 < quests.length) setQi(qi + 1);
      else setDone(true);
    }, 1800);
  };

  /** 두 사람 질문: 관계 스티커 고르기 (모르면 rel 없이 'unknown') */
  const choosePair = (rel: RelationId | null) => {
    if (!quest?.other || answer) return;
    tap();
    const other = quest.other;
    setAnswer(rel ? other : UNKNOWN);
    setPairRel(rel);
    app.saveRelations([relationResponse(quest.subject, rel ?? 'close', rel ? other : UNKNOWN, uuid())], 1).catch(() => {});
    if (rel) {
      say(`${edgeSentence({ rel, from: quest.subject, to: other }, who)}!`);
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    } else say('괜찮아, 몰라도 돼!');
    next();
  };

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
    next();
  };

  const linkRel = quest?.other ? pairRel : quest?.rel;
  const second = quest?.other ? (pairRel ? quest.other : null) : answer && answer !== NOBODY && answer !== UNKNOWN ? answer : null;

  return (
    <Screen>
      <KidHeader onClose={() => router.back()} center={!done ? <Dots index={qi} total={quests.length} /> : undefined} />
      <AskBar text={prompt} mood={done ? 'wow' : 'happy'} size="lg" />

      {done ? (
        <View style={styles.end}>
          {quests.length ? <Text style={styles.stars}>⭐ 별 {quests.length}개!</Text> : null}
          <BigButton label={quests.length ? '다 했어' : '공방 가기'} onPress={() => (quests.length ? router.back() : router.replace('/play/workshop'))} />
        </View>
      ) : quest ? (
        <>
          {/* 주인공 ─ 스티커 ─ 고른 사람 */}
          <View style={styles.stage}>
            <Face avatar={avatarOf(quest.other === SELF ? SELF : quest.subject)} name={who(quest.other === SELF ? SELF : quest.subject)} size={answer || quest.other ? 92 : 112} />
            {quest.other && !second && <Text style={styles.qmark}>?</Text>}
            {second && linkRel && (
              <Animated.View style={[styles.link, { transform: [{ scale: pop }] }]}>
                <Text style={styles.linkEmoji}>{relationOf(linkRel)!.emoji}</Text>
                <View style={[styles.linkLine, { backgroundColor: relationOf(linkRel)!.color }]} />
              </Animated.View>
            )}
            {quest.other ? (
              <Face avatar={avatarOf(quest.other === SELF ? quest.subject : quest.other)} name={who(quest.other === SELF ? quest.subject : quest.other)} size={92} />
            ) : (
              second && (
                <Animated.View style={{ transform: [{ scale: pop }] }}>
                  <Face avatar={avatarOf(second)} name={who(second)} size={92} />
                </Animated.View>
              )
            )}
          </View>

          {quest.other ? (
            <ScrollView key={`p${qi}`} contentContainerStyle={styles.grid} style={[styles.sheet, answer ? { opacity: 0.4 } : null]}>
              {PAIR_CHOICES.map((rel) => {
                const def = relationOf(rel)!;
                const label = rel === 'yell' ? `${josa(who(quest.subject), '이/가')} 화내요` : def.label;
                return (
                  <Pressable key={rel} accessibilityLabel={label} disabled={!!answer} onPress={() => choosePair(rel)} style={[styles.card, pairRel === rel && styles.cardOn]}>
                    <Text style={styles.big}>{def.emoji}</Text>
                    <Text style={styles.name} numberOfLines={2}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable accessibilityLabel="몰라" disabled={!!answer} onPress={() => choosePair(null)} style={[styles.card, styles.soft]}>
                <Text style={styles.big}>🤔</Text>
                <Text style={styles.name}>몰라</Text>
              </Pressable>
            </ScrollView>
          ) : (

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
          )}
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
  qmark: { fontFamily: fonts.title, fontSize: 40, color: colors.inkMuted, marginHorizontal: 12 },
  end: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  stars: { fontFamily: fonts.title, fontSize: 28, color: colors.ink, textAlign: 'center' },
});
