import { StyleSheet, Text, View } from 'react-native';

import { pickedDevices, type DiaryChoice, type DiaryDeviceId, type DiaryPage } from '@/games/diary';
import { BUBBLES } from '@/games/art';
import { colors, fonts, radius } from '@/theme';
import type { AvatarConfig, Expression, WeatherCode } from '@/types';
import { Avatar } from '../Avatar';
import { WeatherIcon } from '../WeatherIcon';

const SIZE_SCALE: Record<string, number> = { ant: 0.55, me: 0.75, adult: 0.92, house: 1.1, sky: 1.25 };
const GAP: Record<string, number> = { close: 0, near: 14, bitfar: 44, far: 80, gone: 80 };
/** 그림 둘레에 작게 붙는 칸 (목소리·온도·맛·소리·내 마음) */
const CHIPS: DiaryDeviceId[] = ['heart', 'voice', 'temp', 'taste', 'sound'];

const DAYS = '일월화수목금토';
export const diaryDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
};

/**
 * 그림일기 한 장: 공책 위에 그날의 그 사람을 그린다.
 * 날씨는 머리 위, 얼굴은 표정, 색은 뒤 오라, 동물·모양은 배지, 크기·거리는 그림 크기와 간격,
 * 한 말은 말풍선, 한 일은 스티커 줄, 나머지는 아래 칩으로 보여준다.
 */
export function DiaryPaper({
  page,
  name,
  avatar,
  me,
  width,
  compact,
}: {
  page: DiaryPage;
  name: string;
  avatar: AvatarConfig;
  me: AvatarConfig;
  width: number;
  /** 부모 화면의 작은 카드용 (제목·칩 줄 생략) */
  compact?: boolean;
}) {
  const by = Object.fromEntries(pickedDevices(page).map((p) => [p.device.id, p.picks])) as Partial<Record<DiaryDeviceId, DiaryChoice[]>>;
  const one = (id: DiaryDeviceId) => by[id]?.[0];
  const base = width * 0.34;
  const size = base * (SIZE_SCALE[one('size')?.id ?? 'adult'] ?? 0.92);
  const gap = GAP[one('distance')?.id ?? 'near'] ?? 14;
  const gone = one('distance')?.id === 'gone';
  const aura = one('color')?.color;
  const weather = one('weather')?.id as WeatherCode | undefined;
  const bubble = one('bubble');
  const bubbleText = bubble ? (BUBBLES.find((b) => b.id === bubble.id)?.text ?? bubble.label) : null;
  const sceneH = width * 0.62;

  return (
    <View style={[styles.paper, { width }]}>
      {!compact && (
        <View style={styles.head}>
          <Text style={styles.date}>{diaryDate(page.at)}</Text>
          <Text style={styles.title} numberOfLines={1}>
            오늘의 {name}
          </Text>
        </View>
      )}
      <View style={[styles.scene, { height: sceneH }]}>
        {/* 공책 줄 */}
        {[0.25, 0.5, 0.75].map((y) => (
          <View key={y} style={[styles.rule, { top: sceneH * y }]} />
        ))}
        <View style={styles.stage}>
          <View style={{ alignItems: 'center', marginRight: gap }}>
            <Avatar avatar={me} size={base * 0.62} expression="calm" />
            <Text style={styles.meTag}>나</Text>
          </View>
          <View style={{ alignItems: 'center', opacity: gone ? 0.22 : 1 }}>
            <View style={{ height: base * 0.42, justifyContent: 'flex-end' }}>{weather ? <WeatherIcon code={weather} size={base * 0.42} /> : null}</View>
            <View>
              {aura ? <View style={[styles.aura, { backgroundColor: aura, width: size * 1.12, height: size * 1.12, borderRadius: size, left: -size * 0.06, top: size * 0.02 }]} /> : null}
              <Avatar avatar={avatar} size={size} expression={(one('face')?.id as Expression) ?? 'calm'} />
              {one('animal') && <Text style={[styles.badge, { right: -10, bottom: 4 }]}>{one('animal')!.emoji}</Text>}
              {one('shape') && <Text style={[styles.badge, { left: -10, top: 4 }]}>{one('shape')!.emoji}</Text>}
            </View>
          </View>
          {bubbleText && (
            <View style={[styles.bubble, { top: 6, right: 6 }]}>
              <Text style={[styles.bubbleText, compact && { fontSize: 10 }]} numberOfLines={2}>
                {bubbleText}
              </Text>
            </View>
          )}
        </View>
        {!!by.action?.length && (
          <View style={styles.actions}>
            {by.action.map((a) => (
              <Text key={a.id} style={styles.actionChip}>
                {compact ? a.emoji : `${a.emoji} ${a.label}`}
              </Text>
            ))}
          </View>
        )}
      </View>
      {!compact && (
        <View style={styles.chips}>
          {CHIPS.filter((id) => one(id)).map((id) => (
            <Text key={id} style={styles.chip}>
              {one(id)!.emoji} {one(id)!.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { alignSelf: 'center', backgroundColor: '#FFFDF6', borderRadius: radius.lg, borderWidth: 2, borderColor: '#EBDDBF', padding: 10, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingHorizontal: 4 },
  date: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  title: { flex: 1, fontFamily: fonts.title, fontSize: 20, color: colors.ink },
  scene: { borderRadius: radius.md, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E6D2', overflow: 'hidden' },
  rule: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F3EBDC' },
  stage: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 },
  meTag: { fontFamily: fonts.title, fontSize: 12, color: colors.inkSoft },
  aura: { position: 'absolute', opacity: 0.45 },
  badge: { position: 'absolute', fontSize: 26 },
  bubble: { position: 'absolute', maxWidth: '46%', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: colors.ink, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4 },
  bubbleText: { fontFamily: fonts.title, fontSize: 14, color: colors.ink },
  actions: { position: 'absolute', left: 6, top: 6, gap: 4, maxWidth: '50%' },
  actionChip: { alignSelf: 'flex-start', fontFamily: fonts.body, fontSize: 12, color: colors.ink, backgroundColor: '#FFF4D6', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, minHeight: 4 },
  chip: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, backgroundColor: colors.bg, borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
});
