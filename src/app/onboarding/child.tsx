import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarBuilder } from '@/components/AvatarBuilder';
import { OnboardingFrame } from '@/components/OnboardingFrame';
import { BigButton } from '@/components/ui';
import { useOnboarding } from '@/state/OnboardingContext';
import { colors, fonts, radius } from '@/theme';

const CLASS_IDEAS = ['햇님반', '별님반', '새싹반', '무지개반', '토끼반'];

export default function ChildStep() {
  const { draft, update } = useOnboarding();
  const valid = draft.childName.trim().length > 0;
  return (
    <OnboardingFrame
      step={2}
      maru="우리 아이 소개"
      sub="이름과 반을 적고, 아이와 함께 모습을 꾸며 주세요."
      footer={<BigButton label="다음" disabled={!valid} onPress={() => router.push('/onboarding/teachers')} />}
    >
      <View style={{ gap: 10 }}>
        <Text style={styles.label}>이름(애칭)</Text>
        <TextInput
          value={draft.childName}
          onChangeText={(childName) => update({ childName })}
          placeholder="예: 콩이"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
          maxLength={10}
        />
        <Text style={styles.label}>반 이름 (선택)</Text>
        <TextInput
          value={draft.className}
          onChangeText={(className) => update({ className })}
          placeholder="예: 햇님반"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
          maxLength={12}
        />
        <View style={styles.ideas}>
          {CLASS_IDEAS.map((c) => (
            <Text key={c} onPress={() => update({ className: c })} style={[styles.idea, draft.className === c && styles.ideaOn]}>
              {c}
            </Text>
          ))}
        </View>
      </View>
      <AvatarBuilder value={draft.childAvatar} onChange={(childAvatar) => update({ childAvatar })} />
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.body, fontSize: 13, fontWeight: '700', color: colors.inkMuted },
  input: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
  },
  ideas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  idea: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  ideaOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary, color: colors.primaryDark },
});
