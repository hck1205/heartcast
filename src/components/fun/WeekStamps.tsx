import { StyleSheet, Text, View } from 'react-native';

import type { DayStamp } from '@/games/rewards';
import { colors, fonts } from '@/theme';
import { WeatherIcon } from '../WeatherIcon';

/** 이번 주 출석 도장판: 놀이한 날에는 그날의 내 마음 날씨 도장이 찍힌다 */
export function WeekStamps({ days, streak }: { days: DayStamp[]; streak: number }) {
  return (
    <View style={styles.wrap} accessibilityLabel={`이번 주 ${days.filter((d) => d.played).length}일 놀았어요`}>
      <View style={styles.row}>
        {days.map((d) => (
          <View key={d.key} style={styles.cell}>
            <View style={[styles.stamp, d.played && styles.stamped, d.today && styles.today]}>
              {d.played ? d.weather ? <WeatherIcon code={d.weather} size={24} /> : <Text style={{ fontSize: 15 }}>⭐</Text> : null}
            </View>
            <Text style={[styles.day, d.today && { color: colors.primaryDark }]}>{d.label}</Text>
          </View>
        ))}
      </View>
      {streak >= 2 && <Text style={styles.streak}>🔥 {streak}일 연속!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', gap: 4, flex: 1 },
  cell: { flex: 1, alignItems: 'center', gap: 2 },
  stamp: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stamped: { borderStyle: 'solid', borderColor: colors.primary, backgroundColor: colors.paper },
  today: { borderColor: colors.primaryDark },
  day: { fontFamily: fonts.title, fontSize: 11, color: colors.inkMuted },
  streak: { fontFamily: fonts.title, fontSize: 13, color: colors.primaryDark },
});
