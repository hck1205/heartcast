import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { displayName, resolveTarget, TargetStage } from '@/components/games/Target';
import { Floating, Maru } from '@/components/Mascot';
import { BigButton, Confetti, SkyBackground } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { FACES, SCENES, STICKERS, TOPICS, WEATHERS, type Reaction } from '@/games/content';
import { planSession, type Step } from '@/games/planner';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { PersonaPicker } from '@/components/studio/pickers';
import { PersonCard } from '@/components/studio/PersonCard';
import { EMPTY_PERSONA, facetQuestion, findChoice } from '@/games/persona';
import { withoutHeadwear } from '@/lib/avatar';
import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius, shadow } from '@/theme';
import type { Person, PlayResponse, Profile, TopicId } from '@/types';

const CHEERS = ['고마워!', '알려줘서 고마워~', '좋아, 다음 날씨로 슝!', '우와, 그랬구나!', '멋지게 골랐어!'];

type Answer = { value: string; score: number | null; fear: boolean };

function promptFor(step: Step, profile: Profile): string {
  const t = resolveTarget(profile, step.targetType, step.targetId);
  if (!t) return '';
  if (step.game === 'weather') {
    if (t.kind === 'topic') return TOPICS[step.targetId as TopicId].weatherPrompt;
    const who = displayName(t.person);
    return t.person.kind === 'teacher'
      ? `${who} 머리 위에는 오늘 어떤 날씨가 떠 있을까?`
      : `${josa(who, '이랑/랑')} 놀 때는 어떤 날씨야?`;
  }
  if (step.game === 'face') {
    if (t.kind === 'topic') return '오늘 내 얼굴은 어땠어?';
    return `오늘 ${josa(displayName(t.person), '은/는')} 어떤 얼굴이었어?`;
  }
  if (step.game === 'portrait' && t.kind === 'person') {
    const who = displayName(t.person);
    if (step.facet === 'trait') return `오늘 ${who}에게 어울리는 스티커 하나를 골라줘!`;
    return `오늘 ${facetQuestion(step.facet ?? 'animal', t.person.name, t.person.kind)}`;
  }
  const scene = SCENES.find((s) => s.id === step.sceneId)!;
  return scene.prompt.replace('{name}', t.kind === 'person' ? t.person.name : '');
}

export default function Session() {
  const app = useApp();
  const profile = app.profile!;
  const steps = useMemo(() => planSession(profile.people, app.responses), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [sessionId] = useState(() => uuid());
  const [startedAt] = useState(() => new Date().toISOString());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [answers, setAnswers] = useState<PlayResponse[]>([]);
  const [cheer, setCheer] = useState<string | null>(null);
  const [phase, setPhase] = useState<'play' | 'saving' | 'reward' | 'error'>('play');
  const [sticker] = useState(() => STICKERS[Math.floor(Math.random() * STICKERS.length)]);
  const stepStart = useRef(0);

  const step = steps[idx];
  const prompt = step ? promptFor(step, profile) : '';

  useEffect(() => {
    stepStart.current = Date.now();
    if (phase === 'play' && prompt) {
      const t = setTimeout(() => say(prompt), 350);
      return () => clearTimeout(t);
    }
  }, [idx, prompt, phase]);

  useEffect(() => () => stopSpeaking(), []);

  const finish = async (all: PlayResponse[]) => {
    setPhase('saving');
    try {
      await app.recordSession({ id: sessionId, startedAt, finishedAt: new Date().toISOString() }, all, sticker);
      celebrate();
      setPhase('reward');
      say(`와! 오늘 날씨 모험 끝! 새 스티커를 받았어!`);
    } catch {
      setPhase('error');
    }
  };

  const choose = (a: Answer) => {
    if (picked) return;
    tap();
    setPicked(a);
    const c = CHEERS[Math.floor(Math.random() * CHEERS.length)];
    setCheer(c);
    say(c);
    const r: PlayResponse = {
      id: uuid(),
      sessionId,
      targetType: step.targetType,
      targetId: step.targetId,
      game: step.game,
      value: a.value,
      score: a.score,
      fear: a.fear,
      hesitationMs: Date.now() - stepStart.current,
      createdAt: new Date().toISOString(),
    };
    const all = [...answers, r];
    setAnswers(all);
    setTimeout(() => {
      if (idx + 1 < steps.length) {
        setPicked(null);
        setCheer(null);
        setIdx(idx + 1);
      } else finish(all);
    }, 1300);
  };

  if (phase === 'reward' || phase === 'saving' || phase === 'error') {
    return <Reward phase={phase} sticker={sticker} count={answers.length} onRetry={() => finish(answers)} />;
  }

  const bg =
    step.game === 'story'
      ? { top: SCENES.find((s) => s.id === step.sceneId)!.bg, bottom: '#FFFFFF' }
      : step.game === 'face'
        ? { top: '#FFD9A8', bottom: '#FFF6EA' }
        : step.game === 'portrait'
          ? { top: '#E4D9FF', bottom: '#FAF7FF' }
          : { top: colors.skyTop, bottom: colors.skyBottom };

  return (
    <SkyBackground top={bg.top} bottom={bg.bottom} hills={step.game === 'weather'}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="그만하기" onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.progress}>
          {steps.map((_, i) => (
            <Text key={i} style={styles.progressIcon}>
              {i < idx || (i === idx && picked) ? '☀️' : i === idx ? '⛅' : '☁️'}
            </Text>
          ))}
        </View>
        <View style={styles.close} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={() => say(prompt)} style={styles.prompt} accessibilityHint="다시 듣기">
          <Text style={styles.promptText}>{prompt}</Text>
          <Text style={styles.speaker}>🔊</Text>
        </Pressable>

        {step.game === 'weather' && <WeatherGame step={step} profile={profile} picked={picked} onPick={choose} />}
        {step.game === 'face' && <FaceGame step={step} profile={profile} picked={picked} onPick={choose} />}
        {step.game === 'story' && <StoryGame step={step} profile={profile} picked={picked} onPick={choose} />}
        {step.game === 'portrait' && <PortraitGame step={step} profile={profile} picked={picked} onPick={choose} />}

        {!picked && step.game !== 'portrait' && (
          <Pressable onPress={() => choose({ value: 'unknown', score: null, fear: false })} style={styles.unknown}>
            <Text style={styles.unknownText}>🤔 잘 모르겠어</Text>
          </Pressable>
        )}
      </ScrollView>

      {cheer && (
        <View style={styles.cheer} pointerEvents="none">
          <Floating distance={6} duration={500}>
            <Maru size={70} mood="wink" />
          </Floating>
          <Text style={styles.cheerText}>{cheer}</Text>
        </View>
      )}
    </SkyBackground>
  );
}

type GameProps = { step: Step; profile: Profile; picked: Answer | null; onPick: (a: Answer) => void };

function WeatherGame({ step, profile, picked, onPick }: GameProps) {
  return (
    <View style={{ gap: 16 }}>
      <TargetStage
        profile={profile}
        targetType={step.targetType}
        targetId={step.targetId}
        sticker={picked && picked.value !== 'unknown' ? <WeatherIcon code={picked.value as any} size={92} /> : undefined}
      />
      <View style={styles.stickerRow}>
        {WEATHERS.map((w) => (
          <Pressable
            key={w.code}
            accessibilityLabel={w.label}
            onPress={() => onPick({ value: w.code, score: w.score, fear: false })}
            style={[styles.stickerBtn, picked?.value === w.code && styles.pickedBtn, picked && picked.value !== w.code && styles.dim]}
          >
            <WeatherIcon code={w.code} size={54} />
            <Text style={styles.stickerLabel}>{w.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FaceGame({ step, profile, picked, onPick }: GameProps) {
  const t = resolveTarget(profile, step.targetType, step.targetId);
  const avatar = t?.kind === 'person' ? t.person.avatar : profile.child.avatar;
  return (
    <View style={{ gap: 16 }}>
      <TargetStage
        profile={profile}
        targetType={step.targetType}
        targetId={step.targetId}
        expression={(picked?.value as any) ?? 'neutral'}
        hideFace={!picked || picked.value === 'unknown'}
        sticker={<Text style={{ fontSize: 56 }}>{picked ? '💭' : '🪞'}</Text>}
      />
      <View style={styles.faceGrid}>
        {FACES.map((f) => (
          <Pressable
            key={f.code}
            accessibilityLabel={f.label}
            onPress={() => onPick({ value: f.code, score: f.score, fear: f.fear })}
            style={[styles.faceBtn, picked?.value === f.code && styles.pickedBtn, picked && picked.value !== f.code && styles.dim]}
          >
            <View style={styles.faceCrop}>
              <Avatar avatar={withoutHeadwear(avatar)} expression={f.code} size={96} />
            </View>
            <Text style={styles.stickerLabel}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function shuffleOnce<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 오늘의 선생님 이미지: 선생님 카드 옆에 동물·색·모양·성격 중 하나를 고른다 */
function PortraitGame({ step, profile, picked, onPick }: GameProps) {
  const t = resolveTarget(profile, step.targetType, step.targetId);
  const facet = step.facet ?? 'animal';
  if (!t || t.kind !== 'person') return null;
  const chosenId = picked?.value.split(':')[1] ?? null;
  // 예전에 고른 이미지는 숨기고(답을 따라 하지 않도록) 오늘 고른 답만 카드에 보여준다
  const preview: Person = {
    ...t.person,
    persona: {
      ...EMPTY_PERSONA,
      ...(chosenId && chosenId !== 'unknown' && facet !== 'trait' ? { [facet]: chosenId } : {}),
      traits: chosenId && chosenId !== 'unknown' && facet === 'trait' ? [chosenId] : [],
    },
  };
  return (
    <View style={{ gap: 14, alignItems: 'center' }}>
      <Floating distance={5}>
        <PersonCard person={preview} size={150} showTraits />
      </Floating>
      <PersonaPicker
        facet={facet}
        value={chosenId}
        dimOthers
        onChange={(v) => {
          if (picked || typeof v !== 'string') return;
          const c = findChoice(facet, v);
          onPick({ value: `${facet}:${c ? c.id : 'unknown'}`, score: c ? c.score : null, fear: c ? c.fear : false });
        }}
      />
    </View>
  );
}

function StoryGame({ step, profile, picked, onPick }: GameProps) {
  const scene = SCENES.find((s) => s.id === step.sceneId)!;
  const t = resolveTarget(profile, step.targetType, step.targetId);
  // 위치에 따른 선택 편향을 줄이려고 보기 순서를 섞는다
  const options = useMemo(() => shuffleOnce(scene.reactions), [scene]);
  const shake = useShake(scene.id);
  if (!t || t.kind !== 'person') return null;
  return (
    <View style={{ gap: 14 }}>
      <Animated.View style={[styles.sceneCard, { transform: [{ rotate: shake }] }]}>
        <Text style={{ fontSize: 64 }}>{scene.emoji}</Text>
        <Text style={styles.sceneTitle}>{scene.title}</Text>
      </Animated.View>
      <View style={styles.reactionGrid}>
        {options.map((r: Reaction) => (
          <Pressable
            key={r.code}
            accessibilityLabel={r.label}
            onPress={() => onPick({ value: `${scene.id}:${r.code}`, score: r.score, fear: r.fear })}
            style={[
              styles.reactionBtn,
              picked?.value === `${scene.id}:${r.code}` && styles.pickedBtn,
              picked && picked.value !== `${scene.id}:${r.code}` && styles.dim,
            ]}
          >
            <View style={styles.faceCrop}>
              <Avatar avatar={withoutHeadwear(t.person.avatar)} expression={r.face} size={84} />
            </View>
            <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
            <Text style={styles.reactionLabel}>{r.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function useShake(key: string) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    v.setValue(0);
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(v, { toValue: -1, duration: 120, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [key, v]);
  return v.interpolate({ inputRange: [-1, 1], outputRange: ['-4deg', '4deg'] });
}

function Reward({ phase, sticker, count, onRetry }: { phase: 'saving' | 'reward' | 'error'; sticker: string; count: number; onRetry: () => void }) {
  const [opened, setOpened] = useState(false);
  const pop = useState(() => new Animated.Value(0))[0];
  const open = () => {
    tap();
    setOpened(true);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 3, tension: 90 }).start();
  };
  return (
    <SkyBackground top="#FFE8A3" bottom="#FFF9E8">
      <View style={styles.rewardWrap}>
        {phase === 'saving' && <Text style={styles.rewardTitle}>하늘에 날씨를 저장하는 중… ☁️</Text>}
        {phase === 'error' && (
          <>
            <Text style={styles.rewardTitle}>앗, 저장이 안 됐어요 😢</Text>
            <BigButton label="다시 저장하기" icon="🔄" onPress={onRetry} />
          </>
        )}
        {phase === 'reward' && (
          <>
            <Text style={styles.rewardTitle}>날씨 모험 끝! 🎉</Text>
            <Text style={styles.rewardSub}>⭐ 별 {count}개를 모았어요</Text>
            <Pressable onPress={open} disabled={opened} style={styles.gift} accessibilityLabel="선물 열기">
              {opened ? (
                <Animated.Text style={{ fontSize: 120, transform: [{ scale: pop }] }}>{sticker}</Animated.Text>
              ) : (
                <Floating distance={10} duration={600}>
                  <Text style={{ fontSize: 120 }}>🎁</Text>
                </Floating>
              )}
            </Pressable>
            <Text style={styles.rewardSub}>{opened ? '새 스티커를 받았어!' : '선물 상자를 눌러봐!'}</Text>
            {opened && (
              <View style={{ gap: 10, alignSelf: 'stretch' }}>
                <BigButton label="스티커북 보기" icon="📒" color={colors.lilac} onPress={() => router.replace('/play/stickers')} />
                <BigButton label="마을로 돌아가기" icon="🏡" onPress={() => router.replace('/play')} />
              </View>
            )}
          </>
        )}
      </View>
      {phase === 'reward' && <Confetti />}
    </SkyBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 6 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 22, color: colors.inkSoft },
  progress: { flexDirection: 'row', gap: 4 },
  progressIcon: { fontSize: 22 },
  body: { padding: 16, gap: 14, paddingBottom: 40 },
  prompt: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadow,
  },
  promptText: { flex: 1, fontFamily: fonts.title, fontSize: 22, lineHeight: 31, color: colors.ink },
  speaker: { fontSize: 26 },
  stickerRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  stickerBtn: {
    width: 68,
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadow,
  },
  stickerLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: 2, textAlign: 'center' },
  pickedBtn: { borderColor: colors.primary, transform: [{ scale: 1.08 }] },
  dim: { opacity: 0.35 },
  faceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  faceBtn: {
    width: 100,
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingBottom: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadow,
  },
  faceCrop: { height: 78, overflow: 'hidden', alignItems: 'center' },
  sceneCard: {
    alignSelf: 'center',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    ...shadow,
  },
  sceneTitle: { fontFamily: fonts.title, fontSize: 20, color: colors.ink },
  reactionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  reactionBtn: {
    width: 150,
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadow,
  },
  reactionLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.ink, textAlign: 'center', lineHeight: 19 },
  unknown: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.75)' },
  unknownText: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft },
  cheer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingRight: 22,
    paddingLeft: 8,
    ...shadow,
  },
  cheerText: { fontFamily: fonts.title, fontSize: 22, color: colors.primaryDark },
  rewardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  rewardTitle: { fontFamily: fonts.title, fontSize: 32, color: colors.ink, textAlign: 'center' },
  rewardSub: { fontFamily: fonts.body, fontSize: 19, color: colors.inkSoft },
  gift: { height: 170, justifyContent: 'center' },
});
