import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { normalizeAvatar, randomAvatar } from '@/lib/avatar';
import { tap } from '@/lib/feedback';
import { colors } from '@/theme';
import type { AvatarConfig, FullAvatar } from '@/types';
import { Avatar } from './Avatar';
import { LookOptions, lookTabs, type LookTab } from './studio/LookOptions';
import { Tabs } from './ui';

type Group = 'face' | 'hair' | 'outfit';

/** 아이 자신의 아바타 꾸미기 (선생님·친구는 공방 Studio 를 쓴다). 공방과 같은 선택지를 쓴다. */
export function AvatarBuilder({ value, onChange, previewSize = 130 }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void; previewSize?: number }) {
  const [group, setGroup] = useState<Group>('face');
  const [tab, setTab] = useState<LookTab>('shape');
  const a = normalizeAvatar(value);
  const set = <K extends keyof FullAvatar>(k: K, v: FullAvatar[K]) => onChange({ ...a, [k]: v });
  const tabs = lookTabs(group).filter((t) => t.id !== 'nameTag' && t.id !== 'beard');

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.preview}>
        <Avatar avatar={a} size={previewSize} expression="happy" bg={colors.skySoft} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="랜덤으로 꾸미기"
          onPress={() => {
            tap();
            onChange({ ...randomAvatar(), facialHair: 'none' });
          }}
          style={styles.dice}
        >
          <Text style={{ fontSize: 22 }}>🎲</Text>
        </Pressable>
      </View>

      <Tabs
        items={[
          { id: 'face', label: '얼굴' },
          { id: 'hair', label: '머리' },
          { id: 'outfit', label: '옷·소품' },
        ]}
        value={group}
        onChange={(g) => {
          setGroup(g);
          setTab(lookTabs(g)[0].id);
        }}
      />
      <Tabs items={tabs} value={tab} onChange={setTab} />
      <LookOptions tab={tab} avatar={a} setLook={set} kind="friend" />
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', justifyContent: 'center' },
  dice: {
    position: 'absolute',
    right: 24,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
