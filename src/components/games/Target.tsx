import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { TOPICS } from '@/games/content';
import { colors, fonts, radius, shadow } from '@/theme';
import type { Expression, Person, Profile, TopicId } from '@/types';
import { Avatar } from '../Avatar';
import { Floating } from '../Mascot';

export function resolveTarget(profile: Profile, targetType: 'person' | 'topic', targetId: string) {
  if (targetType === 'person') {
    const p = profile.people.find((x) => x.id === targetId);
    return p ? { kind: 'person' as const, person: p } : null;
  }
  return { kind: 'topic' as const, topic: TOPICS[targetId as TopicId], child: profile.child };
}

export function displayName(p: Person) {
  return p.kind === 'teacher' ? `${p.name} 선생님` : p.name;
}

/** 질문 대상(사람 아바타 또는 주제 그림)을 크게 보여준다. 머리 위에는 스티커 자리가 있다. */
export function TargetStage({
  profile,
  targetType,
  targetId,
  sticker,
  expression = 'calm',
  hideFace,
}: {
  profile: Profile;
  targetType: 'person' | 'topic';
  targetId: string;
  sticker?: React.ReactNode;
  expression?: Expression;
  hideFace?: boolean;
}) {
  const t = resolveTarget(profile, targetType, targetId);
  const pop = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    pop.setValue(0);
    if (sticker) Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 4, tension: 120 }).start();
  }, [sticker, pop]);

  if (!t) return null;
  return (
    <View style={styles.stage}>
      <View style={styles.slot}>
        {sticker ? (
          <Animated.View style={{ transform: [{ scale: pop }] }}>{sticker}</Animated.View>
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.q}>?</Text>
          </View>
        )}
      </View>
      <Floating distance={5}>
        {t.kind === 'person' ? (
          <View>
            <Avatar avatar={t.person.avatar} size={150} expression={expression} />
            {hideFace && (
              <View style={styles.faceCover}>
                <Text style={styles.faceQ}>?</Text>
              </View>
            )}
          </View>
        ) : targetId === 'self' ? (
          <Avatar avatar={t.child.avatar} size={150} expression={expression} />
        ) : (
          <View style={styles.topicBubble}>
            <Text style={{ fontSize: 88 }}>{t.topic.emoji}</Text>
          </View>
        )}
      </Floating>
      <Text style={styles.name}>
        {t.kind === 'person' ? displayName(t.person) : targetId === 'self' ? `나 (${t.child.name})` : t.topic.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center' },
  slot: { height: 96, justifyContent: 'center', alignItems: 'center' },
  emptySlot: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  q: { fontFamily: fonts.title, fontSize: 40, color: '#fff' },
  topicBubble: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  faceCover: {
    position: 'absolute',
    left: 150 * (30 / 120),
    top: 150 * (40 / 120),
    width: 150 * (60 / 120),
    height: 150 * (56 / 120),
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFFEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceQ: { fontFamily: fonts.title, fontSize: 44, color: colors.sky },
  name: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.ink,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: 4,
  },
});
