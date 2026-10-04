import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { noteDateTime } from '@/lib/format';
import { BigButton } from '@/components/ui';
import { uuid } from '@/lib/util';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import { Panel } from './ParentShell';

/** 아이와 나눈 대화를 짧게 기록 — 시간이 지나 흐름을 되짚을 때 도움이 된다 */
export function NoteBox({ targetId }: { targetId: string | null }) {
  const { notes, addNote } = useApp();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const mine = notes.filter((n) => n.targetId === targetId).slice(0, 5);

  const save = async () => {
    setSaving(true);
    try {
      await addNote({ id: uuid(), targetId, body: text.trim(), createdAt: new Date().toISOString() });
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <Text style={styles.title}>대화 기록</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder={'아이가 한 말을 그대로 적어 두세요.\n예) "선생님이 큰 소리로 말해서 깜짝 놀랐어"'}
        placeholderTextColor={colors.inkMuted}
        style={styles.input}
      />
      <BigButton small label={saving ? '저장 중…' : '기록하기'} disabled={!text.trim() || saving} onPress={save} />
      {mine.map((n) => (
        <View key={n.id} style={styles.note}>
          <Text style={styles.date}>{noteDateTime(n.createdAt)}</Text>
          <Text style={styles.body}>{n.body}</Text>
        </View>
      ))}
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.body, fontWeight: '700', fontSize: 17, color: colors.ink },
  input: {
    minHeight: 88,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  note: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 },
  date: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 },
});
