import { Pressable, Text, View } from 'react-native';

import { FACES } from '@/games/content';
import { resolveTarget } from '@/games/target';
import { withoutHeadwear } from '@/lib/avatar';
import { Avatar } from '../Avatar';
import { gameStyles, type GameProps } from './shared';
import { TargetStage } from './Target';

/** 표정 놀이: 얼굴을 가린 대상에게 오늘의 표정을 골라 준다 */
export function FaceGame({ step, profile, picked, onPick }: GameProps) {
  const t = resolveTarget(profile, step.targetType, step.targetId);
  const avatar = t?.kind === 'person' ? t.person.avatar : profile.child.avatar;
  return (
    <View style={{ gap: 16 }}>
      <TargetStage
        profile={profile}
        targetType={step.targetType}
        targetId={step.targetId}
        expression={(picked?.value as any) ?? 'neutral'}
        hideFace={!picked || picked.value === 'unknown'}
        sticker={<Text style={{ fontSize: 56 }}>{picked ? '💭' : '🪞'}</Text>}
      />
      <View style={gameStyles.faceGrid}>
        {FACES.map((f) => (
          <Pressable
            key={f.code}
            accessibilityLabel={f.label}
            onPress={() => onPick({ value: f.code, score: f.score, fear: f.fear })}
            style={[gameStyles.faceBtn, picked?.value === f.code && gameStyles.pickedBtn, picked && picked.value !== f.code && gameStyles.dim]}
          >
            <View style={gameStyles.faceCrop}>
              <Avatar avatar={withoutHeadwear(avatar)} expression={f.code} size={96} />
            </View>
            <Text style={gameStyles.stickerLabel}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
