import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { animalOf, callName, colorOf, EMPTY_PERSONA, facetQuestion, shapeOf, type PersonaFacet } from '@/games/persona';
import { portraitDiff, portraitResponse } from '@/games/portrait';
import { normalizeAvatar, randomize } from '@/lib/avatar';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import { colors, fonts, radius } from '@/theme';
import type { FullAvatar, Persona, Person, PlayResponse } from '@/types';
import { Maru } from '../Mascot';
import { BigButton, Confetti, Dots, Screen, Tabs } from '../ui';
import { PersonCard } from './PersonCard';
import { LookOptions, lookTabs, type LookTab } from './LookOptions';
import { PersonaPicker } from './pickers';

/** 공방 단계: 이름 → 얼굴 → 머리 → 옷·소품 → 색깔 → 동물 → 모양 → 성격 → 완성 */
type StepId = 'name' | 'face' | 'hair' | 'outfit' | PersonaFacet | 'done';

const LOOK_KEYS: Partial<Record<StepId, (keyof FullAvatar)[]>> = {
  face: ['faceShape', 'skin', 'eyes', 'eyeColor', 'brows', 'nose', 'mouth', 'cheeks', 'facialHair'],
  hair: ['hair', 'hairColor'],
  outfit: ['top', 'pattern', 'shirt', 'glasses', 'headwear', 'neckwear', 'earrings'],
};

function question(step: StepId, name: string, kind: Person['kind']): string {
  const who = callName(name || { teacher: '우리', friend: '친구', parent: '어른' }[kind], kind);
  switch (step) {
    case 'name':
      return { teacher: '누구 선생님을 만들어 볼까?', friend: '어떤 친구를 만들어 볼까?', parent: '어떤 어른을 만들어 볼까?' }[kind];
    case 'face':
      return `${who} 얼굴은 어떻게 생겼어?`;
    case 'hair':
      return `${who} 머리는 어때?`;
    case 'outfit':
      return `${josa(who, '은/는')} 뭘 입고 있어?`;
    case 'done':
      return `${who} 완성!`;
    case 'trait':
      return `${josa(who, '은/는')} 어떤 사람이야? (3개까지)`;
    default:
      return facetQuestion(step, name, kind);
  }
}

export interface StudioResult {
  person: Person;
  responses: PlayResponse[];
}

/**
 * 선생님(친구) 만들기 공방.
 * 생김새(얼굴·머리·옷) → 이미지(색·동물·모양·성격) → 완성.
 * 이미지 단계는 아이의 느낌을 기록하는 곳이라 🎲 랜덤이 없고 "잘 모르겠어"가 있다.
 */
export function Studio({
  initial,
  onDone,
  onCancel,
  onDelete,
}: {
  initial: Person;
  onDone: (r: StudioResult) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [avatar, setAvatar] = useState<FullAvatar>(() => normalizeAvatar(initial.avatar));
  const [persona, setPersona] = useState<Persona>(initial.persona ?? EMPTY_PERSONA);
  const [unknown, setUnknown] = useState<Set<PersonaFacet>>(new Set());
  const [steps] = useState<StepId[]>(() => [
    ...(initial.name ? [] : (['name'] as StepId[])),
    'face',
    'hair',
    'outfit',
    'color',
    'animal',
    'shape',
    'trait',
    'done',
  ]);
  const [idx, setIdx] = useState(0);
  const [tabs, setTabs] = useState<Partial<Record<StepId, LookTab>>>({});
  const [saving, setSaving] = useState(false);
  const [bounce] = useState(() => new Animated.Value(1));
  const step = steps[idx];
  const kind = initial.kind;
  const q = question(step, name, kind);

  useEffect(() => {
    const t = setTimeout(() => say(q), 300);
    if (step === 'done') celebrate();
    return () => clearTimeout(t);
    // 단계가 바뀔 때만 읽어준다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => () => stopSpeaking(), []);

  const pop = () => {
    bounce.setValue(0.94);
    Animated.spring(bounce, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
  };
  const setLook = <K extends keyof FullAvatar>(k: K, v: FullAvatar[K]) => {
    setAvatar((a) => ({ ...a, [k]: v }));
    pop();
  };
  const setFacet = (facet: PersonaFacet, v: string | string[] | null) => {
    const isUnknown = v === 'unknown' || (Array.isArray(v) && v[0] === 'unknown');
    setUnknown((u) => {
      const n = new Set(u);
      if (isUnknown) n.add(facet);
      else n.delete(facet);
      return n;
    });
    setPersona((p) =>
      facet === 'trait' ? { ...p, traits: isUnknown ? [] : (v as string[]) } : { ...p, [facet]: isUnknown ? null : (v as string) },
    );
    pop();
  };

  const personNow: Person = { ...initial, name: name.trim(), avatar, persona };
  const canNext =
    step === 'name'
      ? name.trim().length > 0
      : step === 'color' || step === 'animal' || step === 'shape'
        ? !!persona[step] || unknown.has(step)
        : step === 'trait'
          ? persona.traits.length > 0 || unknown.has('trait')
          : true;

  const finish = async () => {
    setSaving(true);
    const sessionId = uuid();
    const responses = [
      ...portraitDiff(initial.id, initial.persona, persona, sessionId),
      ...[...unknown].map((f) => portraitResponse(initial.id, f, null, sessionId)),
    ];
    try {
      await onDone({ person: personNow, responses });
    } finally {
      setSaving(false);
    }
  };

  const look = LOOK_KEYS[step];
  const currentTab: LookTab = tabs[step] ?? lookTabs(step)[0]?.id ?? 'shape';

  return (
    <Screen>
      {/* 상단: 닫기 · 진행 점 · 지우기 */}
      <View style={styles.header}>
        <Pressable accessibilityLabel="그만 만들기" onPress={onCancel} style={styles.iconBtn}>
          <Text style={styles.iconText}>✕</Text>
        </Pressable>
        <Dots index={idx} total={steps.length} />
        {onDelete ? (
          <Pressable accessibilityLabel="지우기" onPress={onDelete} style={styles.iconBtn}>
            <Text style={[styles.iconText, { fontSize: 14 }]}>지우기</Text>
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* 질문 한 줄 */}
      <Pressable onPress={() => say(q)} style={styles.ask} accessibilityHint="다시 듣기">
        <Maru size={36} mood={step === 'done' ? 'wow' : 'happy'} />
        <Text style={styles.askText}>{q}</Text>
        <Text style={styles.speaker}>🔊</Text>
      </Pressable>

      {/* 미리보기 */}
      <View style={styles.preview}>
        <Animated.View style={{ transform: [{ scale: bounce }] }}>
          <PersonCard person={personNow} size={step === 'done' ? 148 : 118} showName={step === 'done' || !!name.trim()} showTraits={step === 'trait' || step === 'done'} />
        </Animated.View>
        {look ? (
          <Pressable
            accessibilityLabel="랜덤"
            onPress={() => {
              tap();
              setAvatar((a) => randomize(a, look));
              pop();
            }}
            style={styles.dice}
          >
            <Text style={{ fontSize: 22 }}>🎲</Text>
          </Pressable>
        ) : null}
      </View>

      {/* 고르기 판 */}
      <View style={styles.sheet}>
        {lookTabs(step).length > 0 && <Tabs items={lookTabs(step)} value={currentTab} onChange={(t) => setTabs((m) => ({ ...m, [step]: t }))} />}
        <ScrollView key={`${step}-${currentTab}`} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          {step === 'name' && (
            <View style={{ gap: 8 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={{ teacher: '예: 미소', friend: '예: 하준', parent: '예: 우리 엄마' }[kind]}
                placeholderTextColor={colors.inkMuted}
                style={styles.nameInput}
                maxLength={10}
                autoFocus
              />
              <Text style={styles.helper}>{kind === 'teacher' ? `“${callName(name || '○○', 'teacher')}”으로 불러요 · ` : kind === 'parent' ? '우리 엄마, 하준이 아빠, 할머니처럼 불러요 · ' : ''}글씨는 엄마·아빠가 도와줘도 좋아요</Text>
            </View>
          )}

          {look && <LookOptions tab={currentTab} avatar={avatar} setLook={setLook} kind={kind} />}

          {(step === 'color' || step === 'animal' || step === 'shape') && (
            <PersonaPicker facet={step} value={unknown.has(step) ? 'unknown' : persona[step]} onChange={(v) => setFacet(step, v)} />
          )}
          {step === 'trait' && (
            <PersonaPicker facet="trait" multi value={unknown.has('trait') ? ['unknown'] : persona.traits} onChange={(v) => setFacet('trait', v)} />
          )}

          {step === 'done' && (
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={styles.summary}>
                {persona.color && <Text style={styles.summaryChip}>🎨 {colorOf(persona.color)?.label}</Text>}
                {persona.animal && <Text style={styles.summaryChip}>{animalOf(persona.animal)?.emoji} {animalOf(persona.animal)?.label}</Text>}
                {persona.shape && <Text style={styles.summaryChip}>{shapeOf(persona.shape)?.emoji} {shapeOf(persona.shape)?.label}</Text>}
              </View>
              <Text style={styles.helper}>마음이 바뀌면 선생님 공방에서 다시 꾸밀 수 있어요</Text>
            </View>
          )}
        </ScrollView>

        {/* 아래 버튼: 이전 / 다음 */}
        <View style={styles.footer}>
          {idx > 0 && step !== 'done' ? (
            <BigButton small variant="secondary" label="이전" onPress={() => setIdx(idx - 1)} style={{ minWidth: 88 }} />
          ) : null}
          {step === 'done' ? (
            <BigButton label={saving ? '저장 중…' : '완성'} disabled={saving} onPress={finish} style={{ flex: 1 }} />
          ) : (
            <BigButton small label="다음" disabled={!canNext} onPress={() => setIdx(idx + 1)} style={{ flex: 1 }} />
          )}
        </View>
      </View>
      {step === 'done' && <Confetti />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4 },
  iconBtn: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: colors.inkSoft, fontFamily: fonts.body },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 4 },
  askText: { flex: 1, fontFamily: fonts.title, fontSize: 21, lineHeight: 28, color: colors.ink },
  speaker: { fontSize: 18, opacity: 0.6 },
  preview: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  dice: {
    position: 'absolute',
    right: 28,
    bottom: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  sheetContent: { paddingVertical: 6, gap: 14, paddingBottom: 20 },
  footer: { flexDirection: 'row', gap: 8, paddingVertical: 10, borderTopWidth: 1, borderColor: colors.line },
  nameInput: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: fonts.title,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
  },
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  summaryChip: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
});
