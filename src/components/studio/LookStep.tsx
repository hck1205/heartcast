import { Pressable, StyleSheet, View } from 'react-native';

import { randomAvatar } from '@/lib/avatar';
import { tap } from '@/lib/feedback';
import { colors, radius } from '@/theme';
import type { FullAvatar } from '@/types';
import { Avatar } from '../Avatar';
import { BigButton } from '../ui';

const CANDIDATES = 6;

/** 닮은 얼굴 후보: 지금 얼굴 + 같은 나이대의 랜덤 얼굴 */
export const makeCandidates = (current: FullAvatar | null, age: FullAvatar['age']) => [
  ...(current ? [current] : []),
  ...Array.from({ length: current ? CANDIDATES - 1 : CANDIDATES }, () => randomAvatar(age)),
];

/** 공방 '닮은 얼굴 고르기': 후보 6개 · 🔄 다른 얼굴 · ✏️ 더 꾸미기 */
export function FacePicker({
  candidates,
  avatar,
  onPick,
  onShuffle,
  onDetail,
}: {
  candidates: FullAvatar[];
  avatar: FullAvatar;
  onPick: (a: FullAvatar) => void;
  onShuffle: () => void;
  onDetail: () => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.faces}>
        {candidates.map((c, i) => {
          const on = JSON.stringify(c) === JSON.stringify(avatar);
          return (
            <Pressable
              key={i}
              accessibilityLabel={`얼굴 ${i + 1}`}
              onPress={() => {
                tap();
                onPick(c);
              }}
              style={[styles.faceCard, on && styles.faceOn]}
            >
              <Avatar avatar={c} size={86} />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <BigButton
          small
          variant="secondary"
          label="🔄 다른 얼굴"
          onPress={() => {
            tap();
            onShuffle();
          }}
          style={{ flex: 1 }}
        />
        <BigButton small variant="ghost" label="✏️ 더 꾸미기" onPress={onDetail} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  faces: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  faceCard: {
    width: 104,
    height: 112,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faceOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  row: { flexDirection: 'row', gap: 8 },
});
