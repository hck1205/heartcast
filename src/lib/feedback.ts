import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/** 가벼운 터치 진동 */
export function tap() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function celebrate() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** 글을 못 읽는 아이를 위해 질문을 소리 내어 읽어준다 */
export function say(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'ko-KR', rate: 0.95, pitch: 1.15 });
  } catch {
    // 음성 엔진이 없으면 조용히 넘어간다
  }
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {}
}

/**
 * 질문이 바뀌면 잠깐 뒤에 읽어준다. key 를 주면 key 가 바뀔 때만 (예: 단계), 안 주면 글이 바뀔 때마다.
 * 화면을 떠나면 읽기를 멈춘다.
 */
export function useSayOnChange(text: string, key: unknown = text, delay = 300) {
  const latest = useRef(text);
  useEffect(() => {
    latest.current = text;
  });
  useEffect(() => {
    if (!latest.current) return;
    const t = setTimeout(() => say(latest.current), delay);
    return () => clearTimeout(t);
  }, [key, delay]);
  useEffect(() => () => stopSpeaking(), []);
}
