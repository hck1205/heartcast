import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DiaryPaper } from '@/components/diary/DiaryPaper';
import { ChoiceTray, DeviceGrid } from '@/components/diary/DiaryTools';
import { AskBar, KidHeader } from '@/components/kid/KidTop';
import { PersonCard } from '@/components/studio/PersonCard';
import { BigButton, Confetti, Screen } from '@/components/ui';
import { changeLine, compareDiary, deviceOf, diaryPages, diaryResponses, diarySentence, emptyPage, filledCount, togglePick, type DiaryDeviceId, type DiaryPage } from '@/games/diary';
import { nameOf } from '@/games/persona';
import { isSameDay } from '@/lib/dates';
import { celebrate, say, useSayOnChange } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
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
    const groups: [string, Person[]][] = [
      ['선생님', profile.people.filter((p) => p.kind === 'teacher')],
      ['친구', profile.people.filter((p) => p.kind === 'friend')],
      ['가족·어른', profile.people.filter((p) => p.kind === 'parent')],
    ];
    const wroteToday = (id: string) => diaryPages(app.responses, id).some((pg) => isSameDay(pg.at, new Date()));
    return (
      <Screen>
        <KidHeader onClose={() => router.back()} center="📔 그림일기" />
        <AskBar text={prompt} />
        <ScrollView contentContainerStyle={styles.pickWrap}>
          {groups
            .filter(([, list]) => list.length)
            .map(([label, list]) => (
              <View key={label} style={{ gap: 8 }}>
                <Text style={styles.group}>{label}</Text>
                <View style={styles.cards}>
                  {list.map((p) => (
                    <Pressable key={p.id} accessibilityLabel={`${nameOf(p)} 일기 쓰기`} onPress={() => start(p)} style={styles.card}>
                      <PersonCard person={p} size={76} showTraits={false} />
                      {wroteToday(p.id) && <Text style={styles.done}>✓ 오늘 씀</Text>}
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
        </ScrollView>
      </Screen>
    );
  }

  if (!person || !page) return null;
  const me = profile.child.avatar;

  if (step === 'done') {
    const { changed, same } = compareDiary(prev, page);
    const sentence = diarySentence(page, who);
    const lines = changed.slice(0, 4).map(changeLine);
    return (
      <Screen>
        <KidHeader onClose={() => router.back()} center="📔 그림일기" />
        <AskBar text={prompt} mood="wow" size="sm" />
        <ScrollView contentContainerStyle={styles.doneWrap}>
          <DiaryPaper page={page} name={who} avatar={person.avatar} me={me} width={paperW} />
          <Pressable onPress={() => say(sentence)} style={styles.sentence} accessibilityHint="다시 듣기">
            <Text style={styles.sentenceText}>{sentence}</Text>
          </Pressable>
          <View style={styles.compare}>
            <Text style={styles.compareTitle}>{prev ? '지난번이랑 비교해 볼까?' : '첫 일기야! 🎉'}</Text>
            {lines.map((l) => (
              <Pressable key={l} onPress={() => say(l)}>
                <Text style={styles.compareLine}>🔁 {l}</Text>
              </Pressable>
            ))}
            {same[0] && <Text style={styles.compareLine}>✨ {same[0].device.label}: 오늘도 {same[0].after.map((p) => p.label).join(', ')}!</Text>}
            {prev && !lines.length && !same.length && <Text style={styles.compareLine}>오늘은 지난번과 다른 칸을 꾸몄어!</Text>}
          </View>
          <Text style={styles.stars}>⭐ 별 2개!</Text>
          <View style={styles.row}>
            <BigButton small variant="secondary" label="다른 사람 일기" onPress={() => setStep('pick')} style={{ flex: 1 }} />
            <BigButton small label="다 했어" onPress={() => router.back()} style={{ flex: 1 }} />
          </View>
        </ScrollView>
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
        <Text style={styles.filled}>{filledCount(page)} / 14칸</Text>
        <BigButton small label={saving ? '저장 중…' : '다 썼어'} disabled={saving || filledCount(page) === 0} onPress={finish} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pickWrap: { padding: 16, gap: 18, paddingBottom: 40 },
  group: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: 104, alignItems: 'center', paddingVertical: 8, borderRadius: radius.lg, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  done: { fontFamily: fonts.title, fontSize: 12, color: colors.primaryDark },
  writeWrap: { paddingHorizontal: 16, paddingVertical: 8, gap: 12, paddingBottom: 24 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: colors.line },
  filled: { fontFamily: fonts.title, fontSize: 15, color: colors.inkSoft, minWidth: 64 },
  doneWrap: { padding: 16, gap: 14, paddingBottom: 40 },
  sentence: { backgroundColor: '#FFFDF6', borderRadius: radius.lg, borderWidth: 1, borderColor: '#EBDDBF', padding: 14 },
  sentenceText: { fontFamily: fonts.title, fontSize: 18, lineHeight: 28, color: colors.ink },
  compare: { backgroundColor: colors.skySoft, borderRadius: radius.lg, padding: 14, gap: 8 },
  compareTitle: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  compareLine: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.ink },
  stars: { fontFamily: fonts.title, fontSize: 22, color: colors.ink, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8 },
});
