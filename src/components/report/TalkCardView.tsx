import { StyleSheet, Text, View } from 'react-native';

import { Maru } from '@/components/Mascot';
import type { TalkCard } from '@/report/talkCards';
import { colors, fonts, radius } from '@/theme';

export function TalkCardView({ card }: { card: TalkCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Maru size={44} mood="wink" />
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>그랬구나 카드</Text>
          <Text style={styles.title}>{card.title}</Text>
        </View>
      </View>
      <Text style={styles.when}>{card.when}</Text>

      <Block icon="🗨️" title="이렇게 물어봐요" color="#EAF6FF" items={card.openQuestions} />
      <Block icon="🤗" title="이렇게 받아줘요" color="#FFF4DA" items={card.empathy} />
      <Block icon="🙅" title="이런 말은 피해요" color="#FFEDEA" items={card.avoid} />

      <View style={styles.tip}>
        <Text style={styles.tipText}>💡 {card.tip}</Text>
      </View>
    </View>
  );
}

function Block({ icon, title, items, color }: { icon: string; title: string; items: string[]; color: string }) {
  return (
    <View style={[styles.block, { backgroundColor: color }]}>
      <Text style={styles.blockTitle}>
        {icon} {title}
      </Text>
      {items.map((t, i) => (
        <Text key={i} style={styles.item}>
          • {t}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.line },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { fontFamily: fonts.body, fontSize: 13, color: colors.primaryDark },
  title: { fontFamily: fonts.body, fontWeight: '700', fontSize: 19, color: colors.ink },
  when: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, lineHeight: 20 },
  block: { borderRadius: radius.md, padding: 12, gap: 6 },
  blockTitle: { fontFamily: fonts.body, fontWeight: '700', fontSize: 15, color: colors.ink },
  item: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 },
  tip: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 },
  tipText: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, lineHeight: 21 },
});
