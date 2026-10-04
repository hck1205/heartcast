import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ArtCanvas } from '@/components/art/ArtCanvas';
import { ArtPick } from '@/components/art/ArtPick';
import {
  BubblePicker,
  Chip,
  CrayonPicker,
  FacePicker,
  PeopleTray,
  PORTRAIT_TOOLS,
  SCENE_TOOLS,
  SizeButtons,
  SkyPicker,
  StampPicker,
  Toolbar,
  type Tool,
} from '@/components/art/ArtTools';
import { AskBar, KidHeader } from '@/components/kid/KidTop';
import { BigButton, Confetti, Screen } from '@/components/ui';
import { addFigure, CRAYONS, emptyDrawing, patchFigure, removeFigure, SELF, toggleStampAt } from '@/games/art';
import { avatarFor, makeWho } from '@/games/people';
import { celebrate, say, tap, useSayOnChange } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';
import { colors, fonts } from '@/theme';
import type { Drawing } from '@/types';

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
  const nameFor = makeWho(people, '나');
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

  useSayOnChange(prompt);

  if (!profile) return null;

  const avatarOf = avatarFor(profile);
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
    update((d) => patchFigure(d, selected, patch));
  };

  const onCanvasPress = (x: number, y: number) => {
    if (tool === 'people' && tray) {
      tap();
      update((d) => addFigure(d, tray, x, y));
      // 방금 놓은 사람을 고른 상태로 (표정·말 도구로 바로 꾸밀 수 있게). 사람 서랍은 그대로 둔다
      setSelected(drawing ? drawing.figures.length : null);
      say(`${nameFor(tray)}!`);
      setTray(null);
      return;
    }
    if (tool === 'stamp') {
      tap();
      // 이미 찍은 스탬프를 누르면 지운다
      update((d) => toggleStampAt(d, stamp, x, y));
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
    return (
      <Screen>
        <KidHeader onClose={() => router.back()} center="그림 놀이" />
        <AskBar text={prompt} size="sm" />
        <ArtPick people={people} onPick={start} />
      </Screen>
    );
  }

  const canvasW = Math.min(sw - 32, (sh - 330) / 1.25, 520);
  const mode = done ? 'none' : tool === 'crayon' ? 'draw' : tool === 'stamp' || (tool === 'people' && tray) ? 'tap' : 'none';

  return (
    <Screen>
      <KidHeader onClose={() => router.back()} center={scene ? '우리 반 그리기' : nameFor(drawing.subjectId ?? '')} />
      <AskBar text={prompt} size="sm" />

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
        {!scene && !done && fig && <SizeButtons scale={fig.scale} onChange={(scale) => setFigure({ scale })} />}
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
                      update((d) => removeFigure(d, selected));
                      setSelected(null);
                      setPickedFigure(false);
                    }}
                  />
                  <Chip label="다른 사람 놓기" emoji="➕" onPress={() => setPickedFigure(false)} />
                </>
              ) : (
                <PeopleTray
                  ids={[SELF, ...people.map((p) => p.id)]}
                  picked={tray}
                  placed={new Set(drawing.figures.map((f) => f.personId))}
                  nameOf={nameFor}
                  avatarOf={avatarOf}
                  onPick={(id) => {
                    setTray(id);
                    setPickedFigure(false);
                  }}
                />
              ))}
            {tool === 'face' && fig && <FacePicker figure={fig} onChange={(expression) => setFigure({ expression })} />}
            {tool === 'bubble' && fig && <BubblePicker figure={fig} onChange={(bubble) => setFigure({ bubble })} />}
            {tool === 'stamp' && <StampPicker value={stamp} onChange={setStamp} />}
            {tool === 'crayon' && <CrayonPicker value={pen} onChange={setPen} onUndo={() => update((d) => ({ ...d, strokes: d.strokes.slice(0, -1) }))} />}
            {tool === 'sky' && <SkyPicker value={drawing.sky} onChange={(sky) => update((d) => ({ ...d, sky }))} />}
          </ScrollView>

          {/* 도구 막대 */}
          <Toolbar
            tools={scene ? SCENE_TOOLS : PORTRAIT_TOOLS}
            tool={tool}
            onChange={(t) => {
              setTool(t);
              setTray(null);
            }}
          />
          <BigButton small label={saving ? '저장 중…' : '다 그렸어'} disabled={saving || (scene && drawing.figures.length === 0)} onPress={finish} />
        </View>
      )}
      {done && <Confetti />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvasWrap: { alignItems: 'center', marginTop: 4 },
  sheet: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  options: { gap: 8, paddingHorizontal: 4, alignItems: 'center', minHeight: 70 },
  doneBox: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  stars: { fontFamily: fonts.title, fontSize: 24, textAlign: 'center', color: colors.ink },
  row: { flexDirection: 'row', gap: 8 },
});
