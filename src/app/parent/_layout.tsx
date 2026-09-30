import { Redirect, Stack, useSegments } from 'expo-router';

import { useApp } from '@/state/AppContext';

export default function ParentLayout() {
  const { profile, parentUnlocked } = useApp();
  const segments = useSegments() as string[];
  const atGate = segments[segments.length - 1] === 'gate';
  if (!profile) return <Redirect href="/" />;
  if (!parentUnlocked && !atGate) return <Redirect href="/parent/gate" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
