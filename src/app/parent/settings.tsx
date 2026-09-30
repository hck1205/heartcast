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
  const [draft, setDraft] = useState<Profile | null>(app.profile);
  const [saved, setSaved] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  if (!draft) return null;

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.profile);
  const save = async () => {
    await app.saveProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <ParentShell title="설정">
      <Section title="우리 아이">
        <Panel>
          <TextInput
            value={draft.child.name}
            onChangeText={(name) => setDraft({ ...draft, child: { ...draft.child, name } })}
            style={styles.input}
            placeholder="아이 이름"
          />
          <TextInput
            value={draft.child.className}
            onChangeText={(className) => setDraft({ ...draft, child: { ...draft.child, className } })}
            style={styles.input}
            placeholder="반 이름"
          />
          <AvatarBuilder value={draft.child.avatar} onChange={(avatar) => setDraft({ ...draft, child: { ...draft.child, avatar } })} previewSize={110} />
        </Panel>
      </Section>

      <Section title="선생님" sub="선생님이 바뀌면 새로 추가해 주세요. 지운 선생님의 지난 기록은 리포트에서 빠져요.">
        <PeopleEditor kind="teacher" people={draft.people} onChange={(people) => setDraft({ ...draft, people })} />
      </Section>
      <Section title="친구">
        <PeopleEditor kind="friend" people={draft.people} onChange={(people) => setDraft({ ...draft, people })} />
      </Section>

      <BigButton label={saved ? '저장했어요!' : '변경사항 저장'} icon={saved ? '✅' : '💾'} disabled={!dirty && !saved} onPress={save} />

      <Section title="부모 PIN">
        <Panel style={{ alignItems: 'center' }}>
          {changingPin ? (
            <PinPad
              onComplete={async (pin) => {
                const next = { ...draft, pinHash: hashPin(pin) };
                setDraft(next);
                await app.saveProfile(next);
                setChangingPin(false);
              }}
            />
          ) : (
            <BigButton small label="PIN 바꾸기" icon="🔑" color={colors.sky} onPress={() => setChangingPin(true)} />
          )}
        </Panel>
      </Section>

      <Section title="계정">
        <Panel>
          <Text style={styles.body}>
            {app.mode === 'cloud' ? `☁️ 클라우드 계정: ${app.email ?? ''}` : '📱 체험 모드 (이 기기에만 저장돼요)'}
          </Text>
          {app.mode === 'demo' && (
            <BigButton
              small
              label="예시 기록 채우기 (2주치)"
              icon="📊"
              color={colors.mint}
              onPress={async () => {
                await app.loadDemoData();
                router.replace('/parent');
              }}
            />
          )}
          <BigButton
            small
            label="로그아웃 / 처음 화면으로"
            icon="🚪"
            color="#EEF1F6"
            textColor={colors.inkSoft}
            onPress={async () => {
              await app.signOut();
              router.replace('/');
            }}
          />
          <BigButton
            small
            label="모든 기록 지우기"
            icon="🗑️"
            color="#FFE3DC"
            textColor={colors.signal.talk}
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
