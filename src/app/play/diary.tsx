import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DiaryDone } from '@/components/diary/DiaryDone';
import { DiaryPaper } from '@/components/diary/DiaryPaper';
import { DiaryPick } from '@/components/diary/DiaryPick';
import { ChoiceTray, DeviceGrid } from '@/components/diary/DiaryTools';
import { AskBar, KidHeader } from '@/components/kid/KidTop';
import { BigButton, Confetti, Screen } from '@/components/ui';
import { deviceOf, DIARY_DEVICES, diaryPages, diaryResponses, emptyPage, filledCount, togglePick, type DiaryDeviceId, type DiaryPage } from '@/games/diary';
import { nameOf } from '@/games/persona';
import { celebrate, useSayOnChange } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';
import type { Person } from '@/types';

type Step = 'pick' | 'write' | 'done';

/**
 * 그림일기 (아이용): 사람 한 명을 골라 "오늘 이 사람은 나에게 어땠어?"를 칸 14개로 꾸민다.
 * 칸은 모두 선택. 다 쓰면 일기 문장을 읽어 주고, 그때 처음으로 지난 일기와 비교해 보여준다
 * (쓰는 동안 지난 답을 보여주면 따라 고르기 쉬워서).
 */
export default function DiaryGame() {
  const app = useApp();
  const profile = app.profile;
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>('pick');
  const [person, setPerson] = useState<Person | null>(null);
  const [page, setPage] = useState<DiaryPage | null>(null);
  const [active, setActive] = useState<DiaryDeviceId | null>(null);
  const [prev, setPrev] = useState<DiaryPage | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const who = person ? nameOf(person) : '';
  const prompt =
    step === 'pick'
      ? '누구 일기를 써 볼까?'
      : step === 'done'
        ? '일기 완성! 정말 잘 썼어!'
        : active
          ? deviceOf(active)!.question(who)
          : `오늘 ${josa(who, '은/는')} 어땠어? 칸을 눌러서 꾸며 봐!`;
  useSayOnChange(prompt);
  useEffect(() => {
    if (step === 'done') celebrate();
  }, [step]);

  if (!profile) return null;
  const paperW = Math.min(width - 32, 400);

  const start = (p: Person) => {
    setPerson(p);
    setPage(emptyPage(p.id));
    setActive(null);
    setStep('write');
  };

  const finish = async () => {
    if (!page || !person) return;
    setSaving(true);
    const done = { ...page, at: new Date().toISOString() };
    // 비교할 지난 장은 저장하기 전에 잡아 둔다
    setPrev(diaryPages(app.responses, person.id).at(-1));
    try {
      await app.saveDiary(diaryResponses(done));
      setPage(done);
      setStep('done');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'pick') {
    return (
      <Screen>
        <KidHeader onClose={() => router.back()} center="📔 그림일기" />
        <AskBar text={prompt} />
        <DiaryPick people={profile.people} responses={app.responses} onPick={start} />
      </Screen>
    );
  }

  if (!person || !page) return null;
  const me = profile.child.avatar;

  if (step === 'done') {
    return (
      <Screen>
        <KidHeader onClose={() => router.back()} center="📔 그림일기" />
        <AskBar text={prompt} mood="wow" size="sm" />
        <DiaryDone page={page} prev={prev} who={who} avatar={person.avatar} me={me} width={paperW} onAnother={() => setStep('pick')} onFinish={() => router.back()} />
        <Confetti />
      </Screen>
    );
  }

  return (
    <Screen>
      <KidHeader onClose={() => setStep('pick')} closeLabel="다른 사람 고르기" center="📔 그림일기" />
      <AskBar text={prompt} size="sm" />
      <ScrollView contentContainerStyle={styles.writeWrap} keyboardShouldPersistTaps="handled">
        <DiaryPaper page={page} name={who} avatar={person.avatar} me={me} width={paperW} />
        <DeviceGrid page={page} active={active} onOpen={(id) => setActive(active === id ? null : id)} />
        {active && <ChoiceTray page={page} device={active} onPick={(id) => setPage(togglePick(page, active, id))} />}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.filled}>{filledCount(page)} / {DIARY_DEVICES.length}칸</Text>
        <BigButton small label={saving ? '저장 중…' : '다 썼어'} disabled={saving || filledCount(page) === 0} onPress={finish} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  writeWrap: { paddingHorizontal: 16, paddingVertical: 8, gap: 12, paddingBottom: 24 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: colors.line },
  filled: { fontFamily: fonts.title, fontSize: 15, color: colors.inkSoft, minWidth: 64 },
});
