import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Pet } from '@/components/fun/Pet';
import { AskBar, KidHeader } from '@/components/kid/KidTop';
import { BigButton, Confetti, Screen } from '@/components/ui';
import { isEquipped, isUnlocked, SHOP, shopItem, type ShopItem } from '@/games/rewards';
import { normalizeAvatar } from '@/lib/avatar';
import { celebrate, say, tap, useSayOnChange } from '@/lib/feedback';
import { useShake } from '@/lib/motion';
import { useApp } from '@/state/AppContext';
import { colors, fonts, radius } from '@/theme';

/** 별 상점: 모은 별로 특별 아이템(머리 장식·망토·반려 친구)을 열고, 연 것은 쓰고 벗는다 */
export default function Shop() {
  const app = useApp();
  const profile = app.profile;
  const [opening, setOpening] = useState<ShopItem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { shake, rotate } = useShake();
  const [msg, setMsg] = useState('별로 선물을 열어 봐!');
  useSayOnChange(msg);
  if (!profile) return null;
  const me = normalizeAvatar(profile.child.avatar);

  const press = async (item: ShopItem) => {
    tap();
    if (isUnlocked(profile, item.id)) {
      await app.equipItem(item.id);
      setMsg(isEquipped(profile, item) ? `${item.label} 벗었어!` : `${item.label} 멋지다!`);
      return;
    }
    if (profile.stars < item.price) {
      setMsg(`별이 ${item.price - profile.stars}개 더 필요해! 놀이하면 별이 생겨!`);
      return;
    }
    // 선물 상자 흔들기 → 열기
    setOpening(item);
    setRevealed(false);
    shake([1, -1, 1, -1, 0], 110, async () => {
      const r = await app.buyItem(item.id);
      if (r.ok) {
        setRevealed(true);
        celebrate();
        say(`짜잔! ${item.label}!`);
      } else setOpening(null);
    });
  };

  const preview = (item: ShopItem) =>
    item.kind === 'pet' ? (
      <Pet id={item.value} size={64} />
    ) : (
      <View style={styles.crop}>
        <Avatar avatar={item.kind === 'cape' ? { ...me, cape: item.value } : { ...me, headwear: item.value }} size={item.kind === 'cape' ? 70 : 84} />
      </View>
    );

  return (
    <Screen>
      <KidHeader onClose={() => router.back()} center="별 상점" />
      <AskBar text={msg} size="sm" />
      <View style={styles.me}>
        <Avatar avatar={me} size={110} expression="happy" />
        {profile.pet && <Pet id={profile.pet} size={56} />}
        <Text style={styles.stars}>⭐ {profile.stars}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {SHOP.map((item) => {
          const owned = isUnlocked(profile, item.id);
          const on = owned && isEquipped(profile, item);
          const can = profile.stars >= item.price;
          return (
            <Pressable key={item.id} accessibilityLabel={item.label} onPress={() => press(item)} style={[styles.card, on && styles.cardOn, !owned && !can && { opacity: 0.55 }]}>
              {preview(item)}
              <Text style={styles.name} numberOfLines={1}>
                {item.emoji} {item.label}
              </Text>
              <Text style={[styles.price, owned && { color: colors.primaryDark }]}>{owned ? (on ? '쓰는 중' : '쓰기') : `⭐ ${item.price}`}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {opening && (
        <View style={styles.overlay}>
          {revealed ? (
            <>
              <View style={styles.reveal}>{preview(shopItem(opening.id)!)}</View>
              <Text style={styles.big}>짜잔! {opening.label}!</Text>
              <BigButton label="좋아!" onPress={() => setOpening(null)} style={{ alignSelf: 'stretch' }} />
              <Confetti />
            </>
          ) : (
            <Animated.Text style={{ fontSize: 120, transform: [{ rotate: rotate(12) }] }}>🎁</Animated.Text>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  me: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  stars: { fontFamily: fonts.title, fontSize: 22, color: colors.ink, marginLeft: 12, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', padding: 14, paddingBottom: 30 },
  card: { width: 106, alignItems: 'center', paddingVertical: 8, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.paper },
  cardOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  crop: { width: 84, height: 70, overflow: 'hidden', alignItems: 'center' },
  name: { fontFamily: fonts.title, fontSize: 13, color: colors.ink, marginTop: 4 },
  price: { fontFamily: fonts.title, fontSize: 13, color: colors.inkSoft },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(250,247,242,0.96)', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  reveal: { transform: [{ scale: 2 }], marginBottom: 40 },
  big: { fontFamily: fonts.title, fontSize: 28, color: colors.ink },
});
