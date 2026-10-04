import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { WEATHERS } from '@/games/content';
import { avgToWeather, type DailyPoint, type Trend } from '@/report/analyze';
import { colors, fonts } from '@/theme';
import type { WeatherCode } from '@/types';
import { WeatherIcon } from '../WeatherIcon';

const ORDER: WeatherCode[] = ['sunny', 'partly', 'cloudy', 'rainy', 'stormy'];

/** 날씨 분포 가로 막대 — 색 + 범례 아이콘으로 표현 (색만으로 구분하지 않음) */
export function WeatherBar({ distribution, showLegend = true }: { distribution: Record<WeatherCode, number>; showLegend?: boolean }) {
  const total = ORDER.reduce((a, k) => a + distribution[k], 0);
  if (!total) return <Text style={styles.empty}>아직 기록이 없어요</Text>;
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.bar} accessibilityLabel={ORDER.map((k) => `${WEATHERS.find((w) => w.code === k)!.parentLabel} ${distribution[k]}번`).join(', ')}>
        {ORDER.filter((k) => distribution[k] > 0).map((k) => (
          <View key={k} style={{ flex: distribution[k], backgroundColor: colors.weather[k], borderRadius: 4 }} />
        ))}
      </View>
      {showLegend && (
        <View style={styles.legend}>
          {ORDER.filter((k) => distribution[k] > 0).map((k) => (
            <View key={k} style={styles.legendItem}>
              <WeatherIcon code={k} size={18} />
              <Text style={styles.legendText}>
                {WEATHERS.find((w) => w.code === k)!.parentLabel} {distribution[k]}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function TrendBadge({ trend }: { trend: Trend | null }) {
  if (!trend) return null;
  const map = {
    up: { t: '↗ 맑아지는 중', c: colors.signal.good },
    down: { t: '↘ 흐려지는 중', c: colors.signal.talk },
    flat: { t: '→ 비슷해요', c: colors.inkMuted },
  } as const;
  return <Text style={[styles.trend, { color: map[trend].c }]}>{map[trend].t}</Text>;
}

/** -2~+2 점수 추이 선 그래프 (하나의 축, 0 기준선, 호버 대신 탭 툴팁) */
export function MoodLine({ daily, width = 300, height = 140 }: { daily: DailyPoint[]; width?: number; height?: number }) {
  const [sel, setSel] = useState<number | null>(null);
  const padL = 28;
  const padR = 10;
  const padT = 12;
  const padB = 22;
  const w = width - padL - padR;
  const h = height - padT - padB;
  const x = (i: number) => padL + (daily.length <= 1 ? w / 2 : (i / (daily.length - 1)) * w);
  const y = (v: number) => padT + ((2 - v) / 4) * h;
  const pts = daily.map((d, i) => (d.avg === null ? null : { i, x: x(i), y: y(d.avg), v: d.avg, date: d.date }));
  let path = '';
  let pen = false;
  for (const p of pts) {
    if (!p) {
      pen = false;
      continue;
    }
    path += `${pen ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    pen = true;
  }
  const s = sel !== null ? pts[sel] : null;
  return (
    <View>
      <Svg width={width} height={height}>
        {[2, 0, -2].map((v) => (
          <Line key={v} x1={padL} x2={width - padR} y1={y(v)} y2={y(v)} stroke={v === 0 ? '#C9D1E0' : colors.line} strokeWidth={1} strokeDasharray={v === 0 ? undefined : '3 4'} />
        ))}
        <SvgText x={2} y={y(2) + 4} fontSize={11} fill={colors.inkMuted}>맑음</SvgText>
        <SvgText x={2} y={y(-2) + 4} fontSize={11} fill={colors.inkMuted}>천둥</SvgText>
        <Path d={path} stroke={colors.sky} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p) =>
          p ? (
            <Circle
              key={p.i}
              cx={p.x}
              cy={p.y}
              r={sel === p.i ? 7 : 5}
              fill={colors.weather[avgToWeather(p.v)!]}
              stroke="#fff"
              strokeWidth={2}
              onPress={() => setSel(sel === p.i ? null : p.i)}
            />
          ) : null,
        )}
        {daily.map((d, i) =>
          i % 2 === daily.length % 2 ? null : (
            <SvgText key={d.date} x={x(i)} y={height - 4} fontSize={10} fill={colors.inkMuted} textAnchor="middle">
              {d.date.slice(8)}
            </SvgText>
          ),
        )}
      </Svg>
      <Text style={styles.tooltip}>
        {s ? `${s.date.slice(5).replace('-', '/')} · 평균 ${s.v.toFixed(1)}점 (${WEATHERS.find((w2) => w2.code === avgToWeather(s.v))!.parentLabel})` : '점을 누르면 그날의 날씨를 볼 수 있어요'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: 14, gap: 2, borderRadius: 4, overflow: 'hidden' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  legendText: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted },
  trend: { fontFamily: fonts.body, fontSize: 12, fontWeight: '600' },
  tooltip: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, textAlign: 'center', marginTop: 2 },
});
