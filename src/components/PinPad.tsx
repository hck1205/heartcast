import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tap } from '@/lib/feedback';
import { colors, fonts } from '@/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/** 4자리 PIN 입력 패드. 입력을 비우려면 부모에서 key 를 바꿔 다시 마운트한다. */
export function PinPad({ onComplete, error }: { onComplete: (pin: string) => void; error?: string | null }) {
  const [pin, setPin] = useState('');

  const press = (k: string) => {
    if (!k) return;
    tap();
    if (k === '⌫') return setPin((p) => p.slice(0, -1));
    const next = (pin + k).slice(0, 4);
    setPin(next);
    if (next.length === 4) setTimeout(() => onComplete(next), 120);
  };

  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotOn]}>
            
          </View>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.pad}>
        {KEYS.map((k, i) => (
          <Pressable
            key={i}
            accessibilityLabel={k === '⌫' ? '지우기' : k}
            onPress={() => press(k)}
            style={({ pressed }) => [styles.key, !k && { opacity: 0 }, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <Text style={styles.keyText}>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 14 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: colors.primary },
  error: { fontFamily: fonts.body, color: colors.signal.talk, fontSize: 15 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 264, gap: 12, justifyContent: 'center' },
  key: {
    width: 76,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: fonts.title, fontSize: 26, color: colors.ink },
});
