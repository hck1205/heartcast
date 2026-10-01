import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BUBBLES, CRAYONS, EXPRESSIONS, SKIES, STAMPS } from '@/games/art';
import { FACES } from '@/games/content';
import { say, tap } from '@/lib/feedback';
import { colors, fonts, radius } from '@/theme';
import type { ArtFigure, ArtSky, AvatarConfig, Expression } from '@/types';
import { Avatar } from '../Avatar';

/** 그림 놀이 도구 (큰 아이콘 막대 + 도구별 고르기 줄) */
export type Tool = 'people' | 'face' | 'bubble' | 'stamp' | 'crayon' | 'sky';

export const PORTRAIT_TOOLS: Tool[] = ['face', 'bubble', 'stamp', 'crayon', 'sky'];
export const SCENE_TOOLS: Tool[] = ['people', 'face', 'bubble', 'stamp', 'crayon'];

const TOOLS: Record<Tool, { emoji: string; label: string }> = {
  people: { emoji: '🧑', label: '사람' },
  face: { emoji: '😀', label: '표정' },
  bubble: { emoji: '💬', label: '말' },
  stamp: { emoji: '⭐', label: '스탬프' },
  crayon: { emoji: '🖍️', label: '크레용' },
  sky: { emoji: '🌈', label: '하늘' },
};

const FACE_EMOJI: Record<Expression, string> = { happy: '😄', calm: '😊', neutral: '😐', sad: '😢', angry: '😠', scared: '😨' };

export function Chip({ emoji, label, on, onPress }: { emoji: string; label: string; on?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[styles.chip, on && styles.on]}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Toolbar({ tools, tool, onChange }: { tools: Tool[]; tool: Tool; onChange: (t: Tool) => void }) {
  return (
    <View style={styles.toolbar}>
      {tools.map((t) => (
        <Pressable
          key={t}
          accessibilityRole="tab"
          accessibilityLabel={TOOLS[t].label}
          accessibilityState={{ selected: tool === t }}
          onPress={() => {
            tap();
            onChange(t);
          }}
          style={[styles.tool, tool === t && styles.toolOn]}
        >
          <Text style={{ fontSize: 24 }}>{TOOLS[t].emoji}</Text>
          <Text style={styles.toolLabel}>{TOOLS[t].label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** 우리 반 그림의 사람 서랍: 누르고 도화지를 누르면 그 자리에 놓인다 */
export function PeopleTray({
  ids,
  picked,
  placed,
  nameOf,
  avatarOf,
  onPick,
}: {
  ids: string[];
  picked: string | null;
  placed: Set<string>;
  nameOf: (id: string) => string;
  avatarOf: (id: string) => AvatarConfig | null;
  onPick: (id: string | null) => void;
}) {
  return (
    <>
      {ids.map((id) => {
        const av = avatarOf(id);
        return (
          <Pressable
            key={id}
            accessibilityLabel={`${nameOf(id)} 놓기`}
            onPress={() => {
              tap();
              onPick(picked === id ? null : id);
            }}
            style={[styles.trayItem, picked === id && styles.on, placed.has(id) && picked !== id && { opacity: 0.4 }]}
          >
            {av && <Avatar avatar={av} size={44} />}
            <Text style={styles.trayName} numberOfLines={1}>
              {nameOf(id)}
            </Text>
          </Pressable>
        );
      })}
    </>
  );
}

export function FacePicker({ figure, onChange }: { figure: ArtFigure; onChange: (e: Expression) => void }) {
  return (
    <>
      {EXPRESSIONS.map((e) => (
        <Chip key={e} emoji={FACE_EMOJI[e]} label={FACES.find((f) => f.code === e)!.label} on={figure.expression === e} onPress={() => onChange(e)} />
      ))}
    </>
  );
}

export function BubblePicker({ figure, onChange }: { figure: ArtFigure; onChange: (bubble: string | null) => void }) {
  return (
    <>
      <Chip emoji="⬜" label="없음" on={!figure.bubble} onPress={() => onChange(null)} />
      {BUBBLES.map((b) => (
        <Chip
          key={b.id}
          emoji={b.emoji}
          label={b.label}
          on={figure.bubble === b.id}
          onPress={() => {
            say(b.text);
            onChange(b.id);
          }}
        />
      ))}
    </>
  );
}

export function StampPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <>
      {STAMPS.map((s) => (
        <Chip key={s.id} emoji={s.emoji} label={s.label} on={value === s.id} onPress={() => onChange(s.id)} />
      ))}
    </>
  );
}

export function CrayonPicker({ value, onChange, onUndo }: { value: string; onChange: (color: string) => void; onUndo: () => void }) {
  return (
    <>
      {CRAYONS.map((c) => (
        <Pressable
          key={c.color}
          accessibilityLabel={`${c.label} 크레용`}
          onPress={() => {
            tap();
            onChange(c.color);
          }}
          style={[styles.crayon, { backgroundColor: c.color }, value === c.color && styles.crayonOn]}
        />
      ))}
      <Chip emoji="↩️" label="지우기" onPress={onUndo} />
    </>
  );
}

export function SkyPicker({ value, onChange }: { value: ArtSky; onChange: (sky: ArtSky) => void }) {
  return (
    <>
      {SKIES.map((s) => (
        <Chip key={s.id} emoji={s.emoji} label={s.label} on={value === s.id} onPress={() => onChange(s.id as ArtSky)} />
      ))}
    </>
  );
}

/** 인물화의 크게 / 작게 버튼 (도화지 왼쪽 위) */
export function SizeButtons({ scale, onChange }: { scale: number; onChange: (scale: number) => void }) {
  const step = (d: number) => {
    tap();
    onChange(Math.round(Math.max(0.6, Math.min(1.6, scale + d)) * 100) / 100);
  };
  return (
    <View style={styles.sizeBtns}>
      <Pressable accessibilityLabel="크게" onPress={() => step(0.15)} style={styles.sizeBtn}>
        <Text style={styles.sizeText}>＋</Text>
      </Pressable>
      <Pressable accessibilityLabel="작게" onPress={() => step(-0.15)} style={styles.sizeBtn}>
        <Text style={styles.sizeText}>－</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { width: 70, paddingVertical: 6, alignItems: 'center', borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  chipText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600', color: colors.ink, marginTop: 2 },
  on: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  trayItem: { width: 64, alignItems: 'center', paddingVertical: 4, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  trayName: { fontFamily: fonts.body, fontSize: 10, fontWeight: '600', color: colors.ink },
  crayon: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#FFFFFF' },
  crayonOn: { borderColor: colors.ink, transform: [{ scale: 1.15 }] },
  toolbar: { flexDirection: 'row', gap: 6 },
  tool: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  toolOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  toolLabel: { fontFamily: fonts.title, fontSize: 12, color: colors.ink },
  sizeBtns: { position: 'absolute', left: 24, top: 8, gap: 6 },
  sizeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFFEE', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  sizeText: { fontSize: 22, color: colors.ink },
});
