import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { tap } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { randomAvatar, uuid } from '@/lib/util';
import { colors, fonts, radius, shadow } from '@/theme';
import type { Person, PersonKind } from '@/types';
import { Avatar } from './Avatar';
import { AvatarBuilder } from './AvatarBuilder';
import { BigButton, H2 } from './ui';

const MAX = { teacher: 4, friend: 6 };

/** 선생님/친구를 아바타 카드로 추가·편집 */
export function PeopleEditor({ kind, people, onChange }: { kind: PersonKind; people: Person[]; onChange: (p: Person[]) => void }) {
  const [editing, setEditing] = useState<Person | null>(null);
  const mine = people.filter((p) => p.kind === kind);
  const others = people.filter((p) => p.kind !== kind);
  const label = kind === 'teacher' ? '선생님' : '친구';

  const save = (p: Person) => {
    const exists = mine.some((x) => x.id === p.id);
    const next = exists ? mine.map((x) => (x.id === p.id ? p : x)) : [...mine, p];
    onChange([...others, ...next].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'teacher' ? -1 : 1)));
    setEditing(null);
  };
  const remove = (id: string) => {
    onChange(people.filter((p) => p.id !== id));
    setEditing(null);
  };

  return (
    <View>
      <View style={styles.grid}>
        {mine.map((p) => (
          <Pressable
            key={p.id}
            accessibilityLabel={`${p.name} 편집`}
            onPress={() => {
              tap();
              setEditing(p);
            }}
            style={styles.card}
          >
            <Avatar avatar={p.avatar} size={80} expression="happy" />
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
              {kind === 'teacher' ? ' 선생님' : ''}
            </Text>
            <Text style={styles.edit}>✏️ 고치기</Text>
          </Pressable>
        ))}
        {mine.length < MAX[kind] && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label} 추가`}
            onPress={() => {
              tap();
              setEditing({ id: uuid(), kind, name: '', avatar: randomAvatar() });
            }}
            style={[styles.card, styles.addCard]}
          >
            <Text style={{ fontSize: 44 }}>➕</Text>
            <Text style={styles.name}>{label} 추가</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={!!editing} animationType="slide" transparent onRequestClose={() => setEditing(null)}>
        {editing && (
          <PersonSheet
            key={editing.id}
            initial={editing}
            isNew={!mine.some((x) => x.id === editing.id)}
            label={label}
            onCancel={() => setEditing(null)}
            onSave={save}
            onDelete={() => remove(editing.id)}
          />
        )}
      </Modal>
    </View>
  );
}

function PersonSheet({
  initial,
  isNew,
  label,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Person;
  isNew: boolean;
  label: string;
  onSave: (p: Person) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [p, setP] = useState(initial);
  const valid = p.name.trim().length > 0;
  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
          <H2>{isNew ? `${josa(label, '을/를')} 그려볼까요?` : `${label} 고치기`}</H2>
          <View style={styles.inputRow}>
            <TextInput
              value={p.name}
              onChangeText={(name) => setP({ ...p, name })}
              placeholder={label === '선생님' ? '이름 (예: 미소)' : '친구 이름'}
              placeholderTextColor={colors.inkMuted}
              style={styles.input}
              maxLength={10}
            />
            {label === '선생님' && <Text style={styles.suffix}>선생님</Text>}
          </View>
          <Text style={styles.hint}>💡 아이와 함께 “선생님은 머리가 어땠지?” 하며 꾸며보세요!</Text>
          <AvatarBuilder value={p.avatar} onChange={(avatar) => setP({ ...p, avatar })} previewSize={130} />
        </ScrollView>
        <View style={styles.actions}>
          {!isNew && <BigButton small label="지우기" icon="🗑️" color="#EEF1F6" textColor={colors.inkSoft} onPress={onDelete} />}
          <BigButton small label="취소" color="#EEF1F6" textColor={colors.inkSoft} onPress={onCancel} />
          <BigButton small label="완성!" icon="✨" disabled={!valid} onPress={() => onSave({ ...p, name: p.name.trim() })} style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: {
    width: 128,
    minHeight: 150,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    ...shadow,
  },
  addCard: { backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 3, borderStyle: 'dashed', borderColor: '#fff' },
  name: { fontFamily: fonts.title, fontSize: 16, color: colors.ink, marginTop: 4 },
  edit: { fontFamily: fonts.body, fontSize: 12, color: colors.inkMuted },
  backdrop: { flex: 1, backgroundColor: 'rgba(46,58,89,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.skyBottom,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    maxHeight: '92%',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.ink,
  },
  suffix: { flexShrink: 0, fontFamily: fonts.title, fontSize: 18, color: colors.inkSoft },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 8 },
});
