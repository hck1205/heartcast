import { Pressable, Text, View } from 'react-native';

import { WEATHERS } from '@/games/content';
import { WeatherIcon } from '../WeatherIcon';
import { gameStyles, type GameProps } from './shared';
import { TargetStage } from './Target';

/** 날씨 스티커 놀이: 대상 머리 위에 날씨를 붙인다 */
export function WeatherGame({ step, profile, picked, onPick }: GameProps) {
  return (
    <View style={{ gap: 16 }}>
      <TargetStage
        profile={profile}
        targetType={step.targetType}
        targetId={step.targetId}
        sticker={picked && picked.value !== 'unknown' ? <WeatherIcon code={picked.value as any} size={92} /> : undefined}
      />
      <View style={gameStyles.stickerRow}>
        {WEATHERS.map((w) => (
          <Pressable
            key={w.code}
            accessibilityLabel={w.label}
            onPress={() => onPick({ value: w.code, score: w.score, fear: false })}
            style={[gameStyles.stickerBtn, picked?.value === w.code && gameStyles.pickedBtn, picked && picked.value !== w.code && gameStyles.dim]}
          >
            <WeatherIcon code={w.code} size={54} />
            <Text style={gameStyles.stickerLabel}>{w.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
