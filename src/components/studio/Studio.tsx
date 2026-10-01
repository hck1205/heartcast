import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { animalOf, callName, EMPTY_PERSONA, facetQuestion, traitOf, type PersonaFacet } from '@/games/persona';
import { portraitDiff, portraitResponse } from '@/games/portrait';
import { normalizeAvatar, randomAvatar } from '@/lib/avatar';
import { celebrate, tap, useSayOnChange } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import { colors, fonts, radius } from '@/theme';
import type { FullAvatar, Persona, Person, PlayResponse } from '@/types';
import { AskBar, HeaderTextButton, KidHeader } from '../kid/KidTop';
import { Avatar } from '../Avatar';
import { BigButton, Confetti, Dots, Screen, Tabs } from '../ui';
import { PersonCard } from './PersonCard';
import { LookOptions, lookTabs, type LookTab } from './LookOptions';
import { PersonaPicker } from './pickers';

/** 공방 단계: 이름 → 닮은 얼굴 고르기 → 동물 → 성격(선생님만) → 완성 */
type StepId = 'name' | 'look' | 'animal' | 'trait' | 'done';
type Group = 'face' | 'hair' | 'outfit';

const CANDIDATES = 6;
/** 닮은 얼굴 후보: 지금 얼굴 + 같은 나이대의 랜덤 얼굴 */
const makeCandidates = (current: FullAvatar | null, age: FullAvatar['age']) => [
  ...(current ? [current] : []),
  ...Array.from({ length: current ? CANDIDATES - 1 : CANDIDATES }, () => randomAvatar(age)),
];

function question(step: StepId, name: string, kind: Person['kind'], role?: Person['role']): string {
  const who = callName(name || { teacher: '우리', friend: '친구', parent: '어른' }[kind], kind, role);
  switch (step) {
    case 'name':
      return { teacher: '누구 선생님을 만들어 볼까?', friend: '어떤 친구를 만들어 볼까?', parent: '어떤 어른을 만들어 볼까?' }[kind];
    case 'look':
      return `${josa(who, '이랑/랑')} 제일 닮은 얼굴을 골라 줘!`;
    case 'done':
      return `${who} 완성!`;
    case 'trait':
      return `${josa(who, '은/는')} 어떤 사람이야? (2개까지)`;
    default:
      return facetQuestion(step, name, kind);
  }
}

export interface StudioResult {
  person: Person;
  responses: PlayResponse[];
}

/**
 * 선생님·친구·어른 만들기 공방 (아이용, 단계는 짧게).
 * 닮은 얼굴 6개 중 하나 고르기 → 닮은 동물 → (선생님만) 성격 스티커 → 완성.
 * 세부 꾸미기(눈·코·머리·옷…)는 "✏️ 더 꾸미기" 안에 접어 둔다.
 * 동물·성격은 아이의 느낌을 기록하는 곳이라 랜덤이 없고 "잘 모르겠어"가 있다.
 * (색깔·모양은 놀이 중 "오늘의 선생님 이미지" 질문에서 묻는다)
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
  const [role, setRole] = useState<Person['role']>(initial.role);
  const [avatar, setAvatar] = useState<FullAvatar>(() => normalizeAvatar(initial.avatar));
  const [persona, setPersona] = useState<Persona>(initial.persona ?? EMPTY_PERSONA);
  const [unknown, setUnknown] = useState<Set<PersonaFacet>>(new Set());
  const [steps] = useState<StepId[]>(() => [
    ...(initial.name ? [] : (['name'] as StepId[])),
    'look',
    'animal',
    ...(initial.kind === 'teacher' ? (['trait'] as StepId[]) : []),
    'done',
  ]);
  const [idx, setIdx] = useState(0);
  const [candidates, setCandidates] = useState<FullAvatar[]>(() => {
    const a = normalizeAvatar(initial.avatar);
    return makeCandidates(initial.name ? a : null, a.age).map((x, i) => (i === 0 && !initial.name ? a : x));
  });
  const [detail, setDetail] = useState(false);
  const [group, setGroup] = useState<Group>('face');
  const [tab, setTab] = useState<LookTab>('age');
  const [saving, setSaving] = useState(false);
  const [bounce] = useState(() => new Animated.Value(1));
  const step = steps[idx];
  const kind = initial.kind;
  const q = question(step, name, kind, role);

  // 단계가 바뀔 때만 읽어준다 (이름을 칠 때마다 읽지 않게)
  useSayOnChange(q, step);
  useEffect(() => {
    if (step === 'done') celebrate();
  }, [step]);

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

  const personNow: Person = { ...initial, name: name.trim(), avatar, persona, role };
  const canNext =
    step === 'name'
      ? name.trim().length > 0
      : step === 'animal'
        ? !!persona.animal || unknown.has('animal')
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

  const groupTabs = lookTabs(group).filter((t) => kind === 'teacher' || t.id !== 'nameTag');

  return (
    <Screen>
      {/* 상단: 닫기 · 진행 점 · 지우기 */}
      <KidHeader
        onClose={onCancel}
        closeLabel="그만 만들기"
        center={<Dots index={idx} total={steps.length} />}
        right={onDelete ? <HeaderTextButton label="지우기" onPress={onDelete} /> : undefined}
      />

      {/* 질문 한 줄 */}
      <AskBar text={q} mood={step === 'done' ? 'wow' : 'happy'} />

      {/* 미리보기 */}
      <View style={styles.preview}>
        <Animated.View style={{ transform: [{ scale: bounce }] }}>
          <PersonCard person={personNow} size={step === 'done' ? 148 : 118} showName={step === 'done' || !!name.trim()} showTraits={step === 'trait' || step === 'done'} />
        </Animated.View>
      </View>

      {/* 고르기 판 */}
      <View style={styles.sheet}>
        {step === 'look' && detail && (
          <>
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
            <Tabs items={groupTabs} value={tab} onChange={setTab} />
          </>
        )}
        <ScrollView key={`${step}-${detail ? tab : 'pick'}`} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
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
              {kind === 'teacher' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: role === 'director' }}
                  onPress={() => {
                    tap();
                    setRole((r) => (r === 'director' ? undefined : 'director'));
                  }}
                  style={[styles.roleChip, role === 'director' && styles.roleChipOn]}
                >
                  <Text style={styles.roleText}>👑 원장님이에요</Text>
                </Pressable>
              )}
              <Text style={styles.helper}>{kind === 'teacher' ? `“${callName(name || '○○', 'teacher', role)}”으로 불러요 · ` : kind === 'parent' ? '우리 엄마, 하준이 아빠, 할머니처럼 불러요 · ' : ''}글씨는 엄마·아빠가 도와줘도 좋아요</Text>
            </View>
          )}

          {step === 'look' && !detail && (
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
                        setAvatar(c);
                        pop();
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
                    setCandidates([avatar, ...makeCandidates(null, avatar.age).slice(1)]);
                  }}
                  style={{ flex: 1 }}
                />
                <BigButton small variant="ghost" label="✏️ 더 꾸미기" onPress={() => setDetail(true)} style={{ flex: 1 }} />
              </View>
            </View>
          )}
          {step === 'look' && detail && <LookOptions tab={tab} avatar={avatar} setLook={setLook} kind={kind} />}

          {step === 'animal' && <PersonaPicker facet="animal" value={unknown.has('animal') ? 'unknown' : persona.animal} onChange={(v) => setFacet('animal', v)} />}
          {step === 'trait' && (
            <PersonaPicker facet="trait" multi value={unknown.has('trait') ? ['unknown'] : persona.traits} onChange={(v) => setFacet('trait', v)} />
          )}

          {step === 'done' && (
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={styles.summary}>
                {persona.animal && <Text style={styles.summaryChip}>{animalOf(persona.animal)?.emoji} {animalOf(persona.animal)?.label}</Text>}
                {persona.traits.map((t) => (
                  <Text key={t} style={styles.summaryChip}>
                    {traitOf(t)?.emoji} {traitOf(t)?.label}
                  </Text>
                ))}
              </View>
              <Text style={styles.helper}>마음이 바뀌면 공방에서 다시 꾸밀 수 있어요</Text>
            </View>
          )}
        </ScrollView>

        {/* 아래 버튼: 이전 / 다음 */}
        <View style={styles.footer}>
          {step === 'look' && detail ? (
            <BigButton small label="✓ 다 꾸몄어" onPress={() => setDetail(false)} style={{ flex: 1 }} />
          ) : null}
          {step === 'look' && detail ? null : idx > 0 && step !== 'done' ? (
            <BigButton small variant="secondary" label="이전" onPress={() => setIdx(idx - 1)} style={{ minWidth: 88 }} />
          ) : null}
          {step === 'look' && detail ? null : step === 'done' ? (
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
  preview: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
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
  roleChip: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  roleChipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  roleText: { fontFamily: fonts.title, fontSize: 16, color: colors.ink },
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
