import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { animalOf, callName, colorOf, EMPTY_PERSONA, facetQuestion, shapeOf, type PersonaFacet } from '@/games/persona';
import { portraitDiff, portraitResponse } from '@/games/portrait';
import {
  BROWS,
  CHEEKS,
  EYES,
  FACE_SHAPES,
  GLASSES,
  HAIRS,
  HEADWEAR,
  normalizeAvatar,
  PATTERNS,
  randomize,
  SKINS,
  TOPS,
} from '@/lib/avatar';
import { celebrate, say, stopSpeaking, tap } from '@/lib/feedback';
import { josa } from '@/lib/josa';
import { uuid } from '@/lib/util';
import { colors, fonts, palettes, radius, shadow } from '@/theme';
import type { FullAvatar, Persona, Person, PlayResponse } from '@/types';
import { Avatar } from '../Avatar';
import { Floating, Maru } from '../Mascot';
import { BigButton, Confetti, SkyBackground } from '../ui';
import { PersonCard } from './PersonCard';
import { OptionTile, PersonaPicker, Section, Swatch } from './pickers';

type StepId = 'name' | 'face' | 'eyes' | 'hair' | 'clothes' | 'deco' | PersonaFacet | 'done';

const LOOK_KEYS: Partial<Record<StepId, (keyof FullAvatar)[]>> = {
  face: ['faceShape', 'skin'],
  eyes: ['eyes', 'brows', 'cheeks'],
  hair: ['hair', 'hairColor'],
  clothes: ['top', 'pattern', 'shirt'],
  deco: ['glasses', 'headwear', 'earrings'],
};

const STEP_ICON: Record<StepId, string> = {
  name: '✏️',
  face: '🙂',
  eyes: '👀',
  hair: '💇',
  clothes: '👕',
  deco: '🎀',
  color: '🎨',
  animal: '🐾',
  shape: '🔷',
  trait: '💬',
  done: '🎉',
};

function question(step: StepId, name: string, kind: Person['kind']): string {
  const who = callName(name || (kind === 'teacher' ? '우리' : '친구'), kind);
  switch (step) {
    case 'name':
      return kind === 'teacher' ? '누구 선생님을 만들어 볼까? 이름을 알려줘!' : '어떤 친구를 만들어 볼까? 이름을 알려줘!';
    case 'face':
      return `${josa(who, '은/는')} 얼굴이 어떤 모양이야?`;
    case 'eyes':
      return `${who}의 눈이랑 눈썹은 어떻게 생겼어?`;
    case 'hair':
      return `${who}의 머리는 어떻게 생겼어?`;
    case 'clothes':
      return `${josa(who, '은/는')} 무슨 옷을 입었어?`;
    case 'deco':
      return `${who}에게 꾸미기를 해 볼까?`;
    case 'done':
      return `짜잔! ${who} 완성!`;
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
 * 생김새(얼굴·눈·머리·옷·꾸미기) → 이미지(색·동물·모양·성격) → 완성.
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
    'eyes',
    'hair',
    'clothes',
    'deco',
    'color',
    'animal',
    'shape',
    'trait',
    'done',
  ]);
  const [idx, setIdx] = useState(0);
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
    bounce.setValue(0.9);
    Animated.spring(bounce, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }).start();
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
      facet === 'trait'
        ? { ...p, traits: isUnknown ? [] : (v as string[]) }
        : { ...p, [facet]: isUnknown ? null : (v as string) },
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

  const bgColor = colorOf(persona.color)?.color;

  return (
    <SkyBackground top={bgColor ? mixWithWhite(bgColor, 0.45) : colors.skyTop} bottom={colors.skyBottom} hills={false}>
      {/* 상단: 닫기 + 별 진행 */}
      <View style={styles.header}>
        <Pressable accessibilityLabel="그만 만들기" onPress={onCancel} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.progress}>
          {steps.map((s, i) => (
            <Text key={s} style={[styles.progressIcon, i > idx && { opacity: 0.25 }]}>
              {i < idx ? '⭐' : STEP_ICON[s]}
            </Text>
          ))}
        </View>
        {onDelete ? (
          <Pressable accessibilityLabel="지우기" onPress={onDelete} style={styles.close}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </Pressable>
        ) : (
          <View style={styles.close} />
        )}
      </View>

      {/* 마루의 질문 */}
      <Pressable onPress={() => say(q)} style={styles.ask}>
        <Maru size={48} mood={step === 'done' ? 'wow' : 'happy'} />
        <Text style={styles.askText}>{q}</Text>
        <Text style={{ fontSize: 20 }}>🔊</Text>
      </Pressable>

      {/* 미리보기 */}
      <View style={styles.preview}>
        <Animated.View style={{ transform: [{ scale: bounce }] }}>
          <Floating distance={4}>
            {step === 'done' ? (
              <PersonCard person={personNow} size={150} />
            ) : (
              <PersonCard person={personNow} size={step === 'trait' ? 104 : 124} showName={!!name.trim()} showTraits={step === 'trait'} />
            )}
          </Floating>
        </Animated.View>
      </View>

      {/* 고르기 판 */}
      <View style={styles.sheet}>
        <ScrollView key={step} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          {step === 'name' && (
            <View style={{ gap: 10 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={kind === 'teacher' ? '예: 미소' : '예: 하준'}
                placeholderTextColor={colors.inkMuted}
                style={styles.nameInput}
                maxLength={10}
                autoFocus
              />
              {kind === 'teacher' && <Text style={styles.nameSuffix}>→ “{callName(name || '○○', 'teacher')}”</Text>}
              <Text style={styles.helper}>✏️ 글씨는 엄마·아빠가 도와줘도 좋아요</Text>
            </View>
          )}

          {step === 'face' && (
            <>
              <Section title="얼굴 모양">
                {FACE_SHAPES.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.faceShape === o.id} onPress={() => setLook('faceShape', o.id)}>
                    <FaceCrop avatar={{ ...avatar, faceShape: o.id, headwear: 'none', hair: 'buzz' }} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="피부색">
                {SKINS.map((s) => (
                  <OptionTile key={s} selected={avatar.skin === s} onPress={() => setLook('skin', s)} width={60}>
                    <Swatch color={palettes.skins[s]} />
                  </OptionTile>
                ))}
              </Section>
            </>
          )}

          {step === 'eyes' && (
            <>
              <Section title="눈">
                {EYES.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.eyes === o.id} onPress={() => setLook('eyes', o.id)}>
                    <FaceCrop avatar={{ ...avatar, eyes: o.id }} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="눈썹">
                {BROWS.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.brows === o.id} onPress={() => setLook('brows', o.id)}>
                    <FaceCrop avatar={{ ...avatar, brows: o.id }} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="볼">
                {CHEEKS.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.cheeks === o.id} onPress={() => setLook('cheeks', o.id)}>
                    <FaceCrop avatar={{ ...avatar, cheeks: o.id }} />
                  </OptionTile>
                ))}
              </Section>
            </>
          )}

          {step === 'hair' && (
            <>
              <Section title="머리 모양">
                {HAIRS.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.hair === o.id} onPress={() => setLook('hair', o.id)}>
                    <Avatar avatar={{ ...avatar, hair: o.id, headwear: 'none' }} size={60} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="머리색">
                {palettes.hairColors.map((c) => (
                  <OptionTile key={c} selected={avatar.hairColor === c} onPress={() => setLook('hairColor', c)} width={60}>
                    <Swatch color={c} />
                  </OptionTile>
                ))}
              </Section>
            </>
          )}

          {step === 'clothes' && (
            <>
              <Section title="옷">
                {TOPS.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.top === o.id} onPress={() => setLook('top', o.id)}>
                    <BodyCrop avatar={{ ...avatar, top: o.id }} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="무늬">
                {PATTERNS.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.pattern === o.id} onPress={() => setLook('pattern', o.id)}>
                    <BodyCrop avatar={{ ...avatar, pattern: o.id }} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="옷 색깔">
                {palettes.shirts.map((c) => (
                  <OptionTile key={c} selected={avatar.shirt === c} onPress={() => setLook('shirt', c)} width={60}>
                    <Swatch color={c} />
                  </OptionTile>
                ))}
              </Section>
            </>
          )}

          {step === 'deco' && (
            <>
              <Section title="안경">
                {GLASSES.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.glasses === o.id} onPress={() => setLook('glasses', o.id)}>
                    <FaceCrop avatar={{ ...avatar, glasses: o.id }} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="머리 장식">
                {HEADWEAR.map((o) => (
                  <OptionTile key={o.id} label={o.label} selected={avatar.headwear === o.id} onPress={() => setLook('headwear', o.id)}>
                    <Avatar avatar={{ ...avatar, headwear: o.id }} size={60} />
                  </OptionTile>
                ))}
              </Section>
              <Section title="귀걸이">
                {[false, true].map((on) => (
                  <OptionTile key={String(on)} label={on ? '달기' : '없음'} selected={avatar.earrings === on} onPress={() => setLook('earrings', on)}>
                    <FaceCrop avatar={{ ...avatar, earrings: on }} />
                  </OptionTile>
                ))}
              </Section>
            </>
          )}

          {(step === 'color' || step === 'animal' || step === 'shape') && (
            <PersonaPicker facet={step} value={unknown.has(step) ? 'unknown' : persona[step]} onChange={(v) => setFacet(step, v)} />
          )}
          {step === 'trait' && (
            <PersonaPicker facet="trait" multi value={unknown.has('trait') ? ['unknown'] : persona.traits} onChange={(v) => setFacet('trait', v)} />
          )}

          {step === 'done' && (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={styles.doneTitle}>🎉 {callName(name, kind)} 완성!</Text>
              <View style={styles.summary}>
                {persona.color && <Text style={styles.summaryChip}>🎨 {colorOf(persona.color)?.label}</Text>}
                {persona.animal && <Text style={styles.summaryChip}>{animalOf(persona.animal)?.emoji} {animalOf(persona.animal)?.label}</Text>}
                {persona.shape && <Text style={styles.summaryChip}>{shapeOf(persona.shape)?.emoji} {shapeOf(persona.shape)?.label}</Text>}
              </View>
              <Text style={styles.helper}>마음이 바뀌면 언제든 선생님 공방에서 다시 꾸밀 수 있어요</Text>
            </View>
          )}
        </ScrollView>

        {/* 아래 버튼 */}
        <View style={styles.footer}>
          {idx > 0 && step !== 'done' ? (
            <BigButton small label="이전" color="#EEF1F6" textColor={colors.inkSoft} onPress={() => setIdx(idx - 1)} />
          ) : null}
          {LOOK_KEYS[step] ? (
            <BigButton
              small
              label="랜덤"
              icon="🎲"
              color={colors.lilac}
              onPress={() => {
                setAvatar((a) => randomize(a, LOOK_KEYS[step]!));
                pop();
              }}
            />
          ) : null}
          {step === 'done' ? (
            <BigButton label={saving ? '저장 중…' : '완성!'} icon="✨" disabled={saving} onPress={finish} style={{ flex: 1 }} />
          ) : (
            <BigButton
              small
              label="다음"
              icon="👉"
              disabled={!canNext}
              onPress={() => {
                tap();
                setIdx(idx + 1);
              }}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>
      {step === 'done' && <Confetti />}
    </SkyBackground>
  );
}

/** 성격 색을 배경으로 쓸 때 연하게 */
function mixWithWhite(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount) + 255 * amount);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/** 얼굴만 크게 보이도록 자른 미리보기 */
function FaceCrop({ avatar }: { avatar: FullAvatar }) {
  return (
    <View style={{ width: 64, height: 58, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ marginTop: -14 }}>
        <Avatar avatar={avatar} size={80} />
      </View>
    </View>
  );
}

/** 옷만 보이도록 자른 미리보기 */
function BodyCrop({ avatar }: { avatar: FullAvatar }) {
  return (
    <View style={{ width: 64, height: 50, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ marginTop: -56 }}>
        <Avatar avatar={avatar} size={90} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4 },
  close: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 22, color: colors.inkSoft },
  progress: { flexDirection: 'row', gap: 2, flexWrap: 'wrap', justifyContent: 'center', flex: 1 },
  progressIcon: { fontSize: 18 },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginTop: 4,
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    ...shadow,
  },
  askText: { flex: 1, fontFamily: fonts.title, fontSize: 18, lineHeight: 25, color: colors.ink },
  preview: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  sheetContent: { padding: 14, gap: 16, paddingBottom: 24 },
  footer: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 16, backgroundColor: 'rgba(255,255,255,0.9)' },
  nameInput: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: fonts.title,
    fontSize: 26,
    color: colors.ink,
    textAlign: 'center',
    ...shadow,
    shadowOpacity: 0.06,
  },
  nameSuffix: { fontFamily: fonts.title, fontSize: 18, color: colors.inkSoft, textAlign: 'center' },
  helper: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  summaryChip: {
    fontFamily: fonts.title,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  doneTitle: { fontFamily: fonts.title, fontSize: 26, color: colors.ink },
});
