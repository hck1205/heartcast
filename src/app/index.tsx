import { Redirect } from 'expo-router';

import { useApp } from '@/state/AppContext';

export default function Index() {
  const { mode, profile } = useApp();
  if (!mode) return <Redirect href="/onboarding" />;
  if (!profile) return <Redirect href="/onboarding/child" />;
  return <Redirect href="/play" />;
}
