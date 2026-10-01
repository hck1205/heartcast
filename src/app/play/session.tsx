import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FaceGame } from '@/components/games/FaceGame';
import { PortraitGame } from '@/components/games/PortraitGame';
import { Reward } from '@/components/games/Reward';
import { gameStyles, type Answer } from '@/components/games/shared';
import { StoryGame } from '@/components/games/StoryGame';
import { WeatherGame } from '@/components/games/WeatherGame';
import { Maru } from '@/components/Mascot';
import { ProgressBar, SkyBackground } from '@/components/ui';
import { SCENES, STICKERS } from '@/games/content';
import { planSession } from '@/games/planner';
import { promptFor } from '@/games/prompts';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { uuid } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors } from '@/theme';
import type { PlayResponse } from '@/types';

const CHEERS = ['고마워!', '알려줘서 고마워~', '좋아, 다음 날씨로 슝!', '우와, 그랬구나!', '멋지게 골랐어!'];

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

  // 놀이마다 바탕색만 살짝 다르게 (장식 없음)
  const bg =
    step.game === 'story'
      ? { top: SCENES.find((s) => s.id === step.sceneId)!.bg, bottom: colors.bg }
      : step.game === 'face'
        ? { top: '#FFF1E0', bottom: colors.bg }
        : step.game === 'portrait'
          ? { top: '#F1ECFF', bottom: colors.bg }
          : { top: colors.skySoft, bottom: colors.bg };

  return (
    <SkyBackground top={bg.top} bottom={bg.bottom} hills={step.game === 'weather'}>
      <View style={gameStyles.header}>
        <Pressable accessibilityLabel="그만하기" onPress={() => router.back()} style={gameStyles.close}>
          <Text style={gameStyles.closeText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar step={idx + (picked ? 1 : 0)} total={steps.length} />
        </View>
        <View style={gameStyles.close} />
      </View>

      <ScrollView contentContainerStyle={gameStyles.body}>
        <Pressable onPress={() => say(prompt)} style={gameStyles.prompt} accessibilityHint="다시 듣기">
          <Text style={gameStyles.promptText}>{prompt}</Text>
          <Text style={gameStyles.speaker}>🔊</Text>
        </Pressable>

        {step.game === 'weather' && <WeatherGame step={step} profile={profile} picked={picked} onPick={choose} />}
        {step.game === 'face' && <FaceGame step={step} profile={profile} picked={picked} onPick={choose} />}
        {step.game === 'story' && <StoryGame step={step} profile={profile} picked={picked} onPick={choose} />}
        {step.game === 'portrait' && <PortraitGame step={step} profile={profile} picked={picked} onPick={choose} />}

        {!picked && step.game !== 'portrait' && (
          <Pressable onPress={() => choose({ value: 'unknown', score: null, fear: false })} style={gameStyles.unknown}>
            <Text style={gameStyles.unknownText}>🤔 잘 모르겠어</Text>
          </Pressable>
        )}
      </ScrollView>

      {cheer && (
        <View style={gameStyles.cheer} pointerEvents="none">
          <Maru size={36} mood="wink" />
          <Text style={gameStyles.cheerText}>{cheer}</Text>
        </View>
      )}
    </SkyBackground>
  );
}
