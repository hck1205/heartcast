import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
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
