import { View } from 'react-native';

import { EMPTY_PERSONA, findChoice } from '@/games/persona';
import { resolveTarget } from '@/games/target';
import type { Person } from '@/types';
import { PersonCard } from '../studio/PersonCard';
import { PersonaPicker } from '../studio/pickers';
import type { GameProps } from './shared';

/** 오늘의 선생님 이미지: 선생님 카드 옆에 동물·색·모양·성격 중 하나를 고른다 */
export function PortraitGame({ step, profile, picked, onPick }: GameProps) {
  const t = resolveTarget(profile, step.targetType, step.targetId);
  const facet = step.facet ?? 'animal';
  if (!t || t.kind !== 'person') return null;
  const chosenId = picked?.value.split(':')[1] ?? null;
  // 예전에 고른 이미지는 숨기고(답을 따라 하지 않도록) 오늘 고른 답만 카드에 보여준다
  const preview: Person = {
    ...t.person,
    persona: {
      ...EMPTY_PERSONA,
      ...(chosenId && chosenId !== 'unknown' && facet !== 'trait' ? { [facet]: chosenId } : {}),
      traits: chosenId && chosenId !== 'unknown' && facet === 'trait' ? [chosenId] : [],
    },
  };
  return (
    <View style={{ gap: 14, alignItems: 'center' }}>
      <View>
        <PersonCard person={preview} size={140} showTraits />
      </View>
      <PersonaPicker
        facet={facet}
        value={chosenId}
        dimOthers
        onChange={(v) => {
          if (picked || typeof v !== 'string') return;
          const c = findChoice(facet, v);
          onPick({ value: `${facet}:${c ? c.id : 'unknown'}`, score: c ? c.score : null, fear: c ? c.fear : false });
        }}
      />
    </View>
  );
}
