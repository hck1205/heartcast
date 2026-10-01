import { StyleSheet } from 'react-native';

import { colors, fonts, radius, selectedLook } from '@/theme';
import type { Profile } from '@/types';
import type { Step } from '@/games/planner';

/** 날씨 놀이 한 문항의 답 */
export type Answer = { value: string; score: number | null; fear: boolean };
export type GameProps = { step: Step; profile: Profile; picked: Answer | null; onPick: (a: Answer) => void };

const tileBase = {
  alignItems: 'center' as const,
  backgroundColor: colors.paper,
  borderRadius: radius.md,
  borderWidth: 2,
  borderColor: colors.line,
};

export const gameStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 6 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 20, color: colors.inkSoft },
  body: { padding: 16, gap: 16, paddingBottom: 40 },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  promptText: { flex: 1, fontFamily: fonts.title, fontSize: 24, lineHeight: 32, color: colors.ink },
  speaker: { fontSize: 20, opacity: 0.6 },
  stickerRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  stickerBtn: { ...tileBase, width: 66, paddingVertical: 8 },
  stickerLabel: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', color: colors.inkSoft, marginTop: 2, textAlign: 'center' },
  pickedBtn: selectedLook,
  dim: { opacity: 0.35 },
  faceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  faceBtn: { ...tileBase, width: 104, paddingBottom: 8 },
  faceCrop: { height: 78, overflow: 'hidden', alignItems: 'center' },
  sceneCard: { ...tileBase, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24, borderWidth: 1 },
  sceneTitle: { fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  reactionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  reactionBtn: { ...tileBase, width: 156, padding: 8 },
  reactionLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: '600', color: colors.ink, textAlign: 'center', lineHeight: 19 },
  unknown: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  unknownText: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft },
  cheer: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingRight: 18,
    paddingLeft: 6,
  },
  cheerText: { fontFamily: fonts.title, fontSize: 18, color: '#FFFFFF' },
  rewardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  rewardTitle: { fontFamily: fonts.title, fontSize: 30, color: colors.ink, textAlign: 'center' },
  rewardSub: { fontFamily: fonts.body, fontSize: 16, color: colors.inkSoft },
  bonus: { fontFamily: fonts.title, fontSize: 18, color: colors.primaryDark },
  gift: { height: 170, justifyContent: 'center' },
});
