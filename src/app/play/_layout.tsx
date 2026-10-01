import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { BadgeCelebration } from '@/components/fun/BadgeCelebration';
import { useApp } from '@/state/AppContext';

export default function PlayLayout() {
  const { profile } = useApp();
  if (!profile) return <Redirect href="/" />;
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      <BadgeCelebration />
    </View>
  );
}
