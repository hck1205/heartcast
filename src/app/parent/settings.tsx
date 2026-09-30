import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput } from 'react-native';

import { AvatarBuilder } from '@/components/AvatarBuilder';
import { PeopleEditor } from '@/components/PeopleEditor';
import { PinPad } from '@/components/PinPad';
import { Panel, ParentShell, Section } from '@/components/report/ParentShell';
import { BigButton } from '@/components/ui';
import { hashPin } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { Profile } from '@/types';

function confirm(message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) onYes();
    return;
  }
  Alert.alert('확인', message, [
    { text: '취소', style: 'cancel' },
    { text: '확인', style: 'destructive', onPress: onYes },
  ]);
}

export default function Settings() {
  const app = useApp();
  // 아이 정보만 초안으로 편집한다. 선생님·친구는 공방에서 바로 저장된다.
  const [draft, setDraft] = useState<Profile['child'] | null>(app.profile?.child ?? null);
  const [saved, setSaved] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  if (!draft || !app.profile) return null;
  const profile = app.profile;

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile.child);
  const save = async () => {
    await app.saveProfile({ ...profile, child: draft });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <ParentShell title="설정">
      <Section title="우리 아이">
        <Panel>
          <TextInput
            value={draft.name}
            onChangeText={(name) => setDraft({ ...draft, name })}
            style={styles.input}
            placeholder="아이 이름"
          />
          <TextInput
            value={draft.className}
            onChangeText={(className) => setDraft({ ...draft, className })}
            style={styles.input}
            placeholder="반 이름"
          />
          <AvatarBuilder value={draft.avatar} onChange={(avatar) => setDraft({ ...draft, avatar })} previewSize={110} />
          <BigButton small label={saved ? '저장했어요!' : '아이 정보 저장'} disabled={!dirty && !saved} onPress={save} />
        </Panel>
      </Section>

      <Section title="선생님" sub="카드를 누르면 공방에서 다시 꾸미거나 🗑️ 로 지울 수 있어요. 선생님이 바뀌면 새로 만들어 주세요.">
        <PeopleEditor kind="teacher" people={profile.people} studioPath="/parent/studio" />
      </Section>
      <Section title="친구">
        <PeopleEditor kind="friend" people={profile.people} studioPath="/parent/studio" />
      </Section>

      <Section title="부모 PIN">
        <Panel style={{ alignItems: 'center' }}>
          {changingPin ? (
            <PinPad
              onComplete={async (pin) => {
                await app.saveProfile({ ...profile, pinHash: hashPin(pin) });
                setChangingPin(false);
              }}
            />
          ) : (
            <BigButton small variant="secondary" label="비밀번호 바꾸기" onPress={() => setChangingPin(true)} />
          )}
        </Panel>
      </Section>

      <Section title="계정">
        <Panel>
          <Text style={styles.body}>
            {app.mode === 'cloud' ? `클라우드 계정 · ${app.email ?? ''}` : '체험 모드 · 이 기기에만 저장돼요'}
          </Text>
          {app.mode === 'demo' && (
            <BigButton
              small
              variant="secondary"
              label="예시 기록 채우기 (2주치)"
              onPress={async () => {
                await app.loadDemoData();
                router.replace('/parent');
              }}
            />
          )}
          <BigButton
            small
            variant="secondary"
            label="로그아웃"
            onPress={async () => {
              await app.signOut();
              router.replace('/');
            }}
          />
          <BigButton
            small
            variant="ghost"
            label="모든 기록 지우기"
            onPress={() =>
              confirm('아이 정보와 모든 놀이 기록을 지울까요? 되돌릴 수 없어요.', async () => {
                await app.resetAll();
                router.replace('/');
              })
            }
          />
          {app.error && <Text style={styles.error}>{app.error}</Text>}
        </Panel>
      </Section>
    </ParentShell>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F7F5F0',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.signal.talk },
});
