import { Jua_400Regular, useFonts } from '@expo-google-fonts/jua';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProvider, useApp } from '@/state/AppContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { ready } = useApp();
  const [fontsLoaded] = useFonts({ Jua_400Regular });
  const show = ready && fontsLoaded;

  useEffect(() => {
    if (show) SplashScreen.hideAsync().catch(() => {});
  }, [show]);

  if (!show) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootStack />
    </AppProvider>
  );
}
