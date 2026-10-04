import { useEffect, useMemo } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { SCENES, type Reaction } from '@/games/content';
import { resolveTarget } from '@/games/target';
import { withoutHeadwear } from '@/lib/avatar';
import { useShake } from '@/lib/motion';
import { shuffle } from '@/lib/random';
import { Avatar } from '../Avatar';
import { Pop } from './Pop';
import { gameStyles, type GameProps } from './shared';

/** 이야기 장면 놀이: 상황 그림을 보고 선생님이 어떻게 할지 고른다 (보기 순서는 섞는다) */
export function StoryGame({ step, profile, picked, onPick }: GameProps) {
  const scene = SCENES.find((s) => s.id === step.sceneId)!;
  const t = resolveTarget(profile, step.targetType, step.targetId);
  // 위치에 따른 선택 편향을 줄이려고 보기 순서를 섞는다
  const options = useMemo(() => shuffle(scene.reactions), [scene]);
  const { shake, rotate } = useShake();
  useEffect(() => {
    shake([1, -1, 0.5, 0], [120, 120, 100, 100]);
    // 장면이 바뀔 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);
  if (!t || t.kind !== 'person') return null;
  return (
    <View style={{ gap: 14 }}>
      <Animated.View style={[gameStyles.sceneCard, { transform: [{ rotate: rotate(4) }] }]}>
        <Text style={{ fontSize: 64 }}>{scene.emoji}</Text>
        <Text style={gameStyles.sceneTitle}>{scene.title}</Text>
      </Animated.View>
      <View style={gameStyles.reactionGrid}>
        {options.map((r: Reaction) => (
          <Pop key={r.code} active={picked?.value === `${scene.id}:${r.code}`}>
            <Pressable
              accessibilityLabel={r.label}
              onPress={() => onPick({ value: `${scene.id}:${r.code}`, score: r.score, fear: r.fear })}
              style={[
                gameStyles.reactionBtn,
                picked?.value === `${scene.id}:${r.code}` && gameStyles.pickedBtn,
                picked && picked.value !== `${scene.id}:${r.code}` && gameStyles.dim,
              ]}
            >
              <View style={gameStyles.faceCrop}>
                <Avatar avatar={withoutHeadwear(t.person.avatar)} expression={r.face} size={84} />
              </View>
              <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
              <Text style={gameStyles.reactionLabel}>{r.label}</Text>
            </Pressable>
          </Pop>
        ))}
      </View>
    </View>
  );
}
