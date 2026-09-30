import { Redirect, Stack } from 'expo-router';

import { useApp } from '@/state/AppContext';

export default function PlayLayout() {
  const { profile } = useApp();
  if (!profile) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
