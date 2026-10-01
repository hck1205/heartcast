import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ArtCanvas } from '@/components/art/ArtCanvas';
import { Avatar } from '@/components/Avatar';
import { Maru } from '@/components/Mascot';
import { BigButton, Confetti, Screen } from '@/components/ui';
import { BUBBLES, CRAYONS, emptyDrawing, EXPRESSIONS, SELF, SKIES, STAMPS } from '@/games/art';
import { FACES } from '@/games/content';
import { nameOf } from '@/games/persona';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';
import type { AvatarConfig, Drawing, Expression } from '@/types';

type Tool = 'people' | 'face' | 'bubble' | 'stamp' | 'crayon' | 'sky';

const TOOLS: Record<Tool, { emoji: string; label: string }> = {
  people: { emoji: '🧑', label: '사람' },
  face: { emoji: '😀', label: '표정' },
  bubble: { emoji: '💬', label: '말' },
  stamp: { emoji: '⭐', label: '스탬프' },
  crayon: { emoji: '🖍️', label: '크레용' },
  sky: { emoji: '🌈', label: '하늘' },
};

const FACE_EMOJI: Record<Expression, string> = { happy: '😄', calm: '😊', neutral: '😐', sad: '😢', angry: '😠', scared: '😨' };

/**
 * 그림 놀이: 한 사람 그리기(인물화) 또는 우리 반 그리기(장면화).
 * 도구는 큰 아이콘 5개, 한 번에 하나만. 해석은 부모 화면에서만.
 */
export default function ArtGame() {
  const app = useApp();
  const profile = app.profile;
  const { width: sw, height: sh } = useWindowDimensions();
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [tool, setTool] = useState<Tool>('face');
  const [selected, setSelected] = useState<number | null>(0);
  const [tray, setTray] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string>('heart');
  const [pen, setPen] = useState(CRAYONS[0].color);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const people = profile?.people ?? [];
  const nameFor = (id: string) => (id === SELF ? '나' : (() => {
    const p = people.find((x) => x.id === id);
    return p ? nameOf(p) : '';
  })());
  const scene = drawing?.kind === 'scene';
  const fig = drawing && selected !== null ? drawing.figures[selected] : undefined;
  /** 사람 도구에서 그림 속 사람을 직접 눌렀는지 (그때만 '빼기'를 보여준다) */
  const [pickedFigure, setPickedFigure] = useState(false);
  const who = fig ? nameFor(fig.personId) : '';

  const prompt = !drawing
    ? '누구를 그려 볼까?'
    : done
      ? '멋진 그림이야! 고마워!'
      : tool === 'people'
        ? '어린이집 사람들을 그려 줘! 나는 어디에 있어?'
        : tool === 'crayon'
          ? '크레용으로 마음대로 그려 봐!'
          : tool === 'sky'
            ? `${josa(who || '우리', '이랑/랑')} 있을 때 하늘은 어때?`
            : tool === 'stamp'
              ? '스탬프를 콕콕 찍어 봐!'
              : !fig
                ? '그림 속 사람을 눌러 봐!'
                : tool === 'face'
                  ? `${who}의 얼굴은 어때?`
                  : `${josa(who, '은/는')} 자주 뭐라고 말해?`;

  useEffect(() => {
    const t = setTimeout(() => say(prompt), 300);
    return () => clearTimeout(t);
  }, [prompt]);
  useEffect(() => () => stopSpeaking(), []);

  if (!profile) return null;

  const avatarOf = (id: string): AvatarConfig | null => (id === SELF ? profile.child.avatar : (people.find((p) => p.id === id)?.avatar ?? null));
  const update = (fn: (d: Drawing) => Drawing) => setDrawing((d) => (d ? fn(d) : d));

  const start = (kind: Drawing['kind'], subjectId: string | null) => {
    tap();
    setDrawing(emptyDrawing(kind, subjectId));
    setTool(kind === 'scene' ? 'people' : 'face');
    setSelected(kind === 'scene' ? null : 0);
    setTray(null);
    setDone(false);
  };

  const setFigure = (patch: Partial<Drawing['figures'][number]>) => {
    if (selected === null) return;
    update((d) => ({ ...d, figures: d.figures.map((f, i) => (i === selected ? { ...f, ...patch } : f)) }));
  };

  const onCanvasPress = (x: number, y: number) => {
    if (tool === 'people' && tray) {
      tap();
      update((d) => ({ ...d, figures: [...d.figures, { personId: tray, x, y, scale: 1, expression: 'calm', bubble: null }] }));
      // 방금 놓은 사람을 고른 상태로 (표정·말 도구로 바로 꾸밀 수 있게). 사람 서랍은 그대로 둔다
      setSelected(drawing ? drawing.figures.length : null);
      say(`${nameFor(tray)}!`);
      setTray(null);
      return;
    }
    if (tool === 'stamp') {
      tap();
      update((d) => {
        const near = d.stamps.findIndex((s) => Math.hypot(s.x - x, s.y - y) < 55);
        // 이미 찍은 스탬프를 누르면 지운다
        return near >= 0 ? { ...d, stamps: d.stamps.filter((_, i) => i !== near) } : { ...d, stamps: [...d.stamps, { id: stamp, x, y }] };
      });
    }
  };

  const finish = async () => {
    if (!drawing) return;
    setSaving(true);
    try {
      await app.saveDrawing({ ...drawing, createdAt: new Date().toISOString() });
      setDone(true);
      celebrate();
    } finally {
      setSaving(false);
    }
  };

  // ── 무엇을 그릴까 ──
  if (!drawing) {
    const choices = people.filter((p) => p.kind !== 'friend');
    return (
      <Screen>
        <Header onClose={() => router.back()} title="그림 놀이" />
        <Ask text={prompt} />
        <ScrollView contentContainerStyle={styles.pickWrap}>
          <Pressable accessibilityLabel="우리 반 그리기" onPress={() => start('scene', null)} style={styles.sceneCard}>
            <Text style={{ fontSize: 40 }}>🏫</Text>
            <Text style={styles.sceneText}>우리 반 그리기</Text>
          </Pressable>
          <View style={styles.pickGrid}>
            {choices.map((p) => (
              <Pressable key={p.id} accessibilityLabel={`${nameOf(p)} 그리기`} onPress={() => start('portrait', p.id)} style={styles.pickCard}>
                <Avatar avatar={p.avatar} size={78} />
                <Text style={styles.pickName} numberOfLines={1}>
                  {nameOf(p)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const tools: Tool[] = scene ? ['people', 'face', 'bubble', 'stamp', 'crayon'] : ['face', 'bubble', 'stamp', 'crayon', 'sky'];
  const canvasW = Math.min(sw - 32, (sh - 330) / 1.25, 520);
  const mode = done ? 'none' : tool === 'crayon' ? 'draw' : tool === 'stamp' || (tool === 'people' && tray) ? 'tap' : 'none';
  const placed = new Set(drawing.figures.map((f) => f.personId));
  const trayPeople = [SELF, ...people.map((p) => p.id)];

  return (
    <Screen>
      <Header onClose={() => router.back()} title={scene ? '우리 반 그리기' : nameFor(drawing.subjectId ?? '')} />
      <Ask text={prompt} />

      <View style={styles.canvasWrap}>
        <ArtCanvas
          drawing={drawing}
          avatarOf={avatarOf}
          labelOf={nameFor}
          width={canvasW}
          mode={mode}
          penColor={pen}
          selectedFigure={scene && !done ? selected : null}
          onStroke={(s) => update((d) => ({ ...d, strokes: [...d.strokes, s] }))}
          onCanvasPress={onCanvasPress}
          onFigurePress={
            scene && !done
              ? (i) => {
                  tap();
                  setSelected(i);
                  setPickedFigure(true);
                  if (tool !== 'face' && tool !== 'bubble' && tool !== 'people') setTool('face');
                }
              : undefined
          }
        />
        {!scene && !done && (
          <View style={styles.sizeBtns}>
            {[
              ['＋', 0.15, '크게'],
              ['－', -0.15, '작게'],
            ].map(([t, step, label]) => (
              <Pressable
                key={label as string}
                accessibilityLabel={label as string}
                onPress={() => {
                  tap();
                  const s = Math.max(0.6, Math.min(1.6, (fig?.scale ?? 1) + (step as number)));
                  setFigure({ scale: Math.round(s * 100) / 100 });
                }}
                style={styles.sizeBtn}
              >
                <Text style={styles.sizeText}>{t as string}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {done ? (
        <View style={styles.doneBox}>
          <Text style={styles.stars}>⭐ 별 3개!</Text>
          <View style={styles.row}>
            <BigButton small variant="secondary" label="또 그리기" onPress={() => setDrawing(null)} style={{ flex: 1 }} />
            <BigButton small label="다 했어" onPress={() => router.back()} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={styles.sheet}>
          {/* 도구별 고르기 줄 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options} style={{ flexGrow: 0 }}>
            {tool === 'people' &&
              (selected !== null && !tray && pickedFigure ? (
                <>
                  <Chip
                    label={`${nameFor(drawing.figures[selected]?.personId ?? '')} 빼기`}
                    emoji="❌"
                    onPress={() => {
                      update((d) => ({ ...d, figures: d.figures.filter((_, i) => i !== selected) }));
                      setSelected(null);
                      setPickedFigure(false);
                    }}
                  />
                  <Chip label="다른 사람 놓기" emoji="➕" onPress={() => setPickedFigure(false)} />
                </>
              ) : (
                trayPeople.map((id) => (
                  <Pressable
                    key={id}
                    accessibilityLabel={`${nameFor(id)} 놓기`}
                    onPress={() => {
                      tap();
                      setTray(tray === id ? null : id);
                      setPickedFigure(false);
                    }}
                    style={[styles.trayItem, tray === id && styles.on, placed.has(id) && tray !== id && { opacity: 0.4 }]}
                  >
                    <Avatar avatar={avatarOf(id)!} size={44} />
                    <Text style={styles.trayName} numberOfLines={1}>
                      {nameFor(id)}
                    </Text>
                  </Pressable>
                ))
              ))}
            {tool === 'face' &&
              fig &&
              EXPRESSIONS.map((e) => (
                <Chip key={e} emoji={FACE_EMOJI[e]} label={FACES.find((f) => f.code === e)!.label} on={fig.expression === e} onPress={() => setFigure({ expression: e })} />
              ))}
            {tool === 'bubble' &&
              fig &&
              [
                <Chip key="none" emoji="⬜" label="없음" on={!fig.bubble} onPress={() => setFigure({ bubble: null })} />,
                ...BUBBLES.map((b) => (
                  <Chip
                    key={b.id}
                    emoji={b.emoji}
                    label={b.label}
                    on={fig.bubble === b.id}
                    onPress={() => {
                      say(b.text);
                      setFigure({ bubble: b.id });
                    }}
                  />
                )),
              ]}
            {tool === 'stamp' && STAMPS.map((s) => <Chip key={s.id} emoji={s.emoji} label={s.label} on={stamp === s.id} onPress={() => setStamp(s.id)} />)}
            {tool === 'crayon' && (
              <>
                {CRAYONS.map((c) => (
                  <Pressable
                    key={c.color}
                    accessibilityLabel={`${c.label} 크레용`}
                    onPress={() => {
                      tap();
                      setPen(c.color);
                    }}
                    style={[styles.crayon, { backgroundColor: c.color }, pen === c.color && styles.crayonOn]}
                  />
                ))}
                <Chip emoji="↩️" label="지우기" onPress={() => update((d) => ({ ...d, strokes: d.strokes.slice(0, -1) }))} />
              </>
            )}
            {tool === 'sky' && SKIES.map((s) => <Chip key={s.id} emoji={s.emoji} label={s.label} on={drawing.sky === s.id} onPress={() => update((d) => ({ ...d, sky: s.id as Drawing['sky'] }))} />)}
          </ScrollView>

          {/* 도구 막대 */}
          <View style={styles.toolbar}>
            {tools.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="tab"
                accessibilityLabel={TOOLS[t].label}
                accessibilityState={{ selected: tool === t }}
                onPress={() => {
                  tap();
                  setTool(t);
                  setTray(null);
                }}
                style={[styles.tool, tool === t && styles.toolOn]}
              >
                <Text style={{ fontSize: 24 }}>{TOOLS[t].emoji}</Text>
                <Text style={styles.toolLabel}>{TOOLS[t].label}</Text>
              </Pressable>
            ))}
          </View>
          <BigButton small label={saving ? '저장 중…' : '다 그렸어'} disabled={saving || (scene && drawing.figures.length === 0)} onPress={finish} />
        </View>
      )}
      {done && <Confetti />}
    </Screen>
  );
}

function Header({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="그만하기" onPress={onClose} style={styles.iconBtn}>
        <Text style={styles.iconText}>✕</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.iconBtn} />
    </View>
  );
}

function Ask({ text }: { text: string }) {
  return (
    <Pressable onPress={() => say(text)} style={styles.ask} accessibilityHint="다시 듣기">
      <Maru size={32} mood="happy" />
      <Text style={styles.askText}>{text}</Text>
      <Text style={{ fontSize: 16, opacity: 0.6 }}>🔊</Text>
    </Pressable>
  );
}

function Chip({ emoji, label, on, onPress }: { emoji: string; label: string; on?: boolean; onPress: () => void }) {
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

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: colors.inkSoft, fontFamily: fonts.body },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.title, fontSize: 18, color: colors.ink },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, minHeight: 44 },
  askText: { flex: 1, fontFamily: fonts.title, fontSize: 19, lineHeight: 26, color: colors.ink },
  pickWrap: { padding: 16, gap: 14 },
  sceneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.skySoft,
    borderWidth: 2,
    borderColor: colors.sky,
  },
  sceneText: { fontFamily: fonts.title, fontSize: 22, color: colors.ink },
  pickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pickCard: { width: 108, paddingVertical: 10, alignItems: 'center', borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  pickName: { fontFamily: fonts.title, fontSize: 14, color: colors.ink, marginTop: 4 },
  canvasWrap: { alignItems: 'center', marginTop: 4 },
  sizeBtns: { position: 'absolute', left: 24, top: 8, gap: 6 },
  sizeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFFEE', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  sizeText: { fontSize: 22, color: colors.ink },
  sheet: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  options: { gap: 8, paddingHorizontal: 4, alignItems: 'center', minHeight: 70 },
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
  doneBox: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  stars: { fontFamily: fonts.title, fontSize: 24, textAlign: 'center', color: colors.ink },
  row: { flexDirection: 'row', gap: 8 },
});
