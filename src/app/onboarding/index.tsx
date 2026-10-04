import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BigButton, Screen } from '@/components/ui';
import { WeatherIcon } from '@/components/WeatherIcon';
import { colors, fonts } from '@/theme';

/** 소개 한 장: 아이는 날씨 놀이, 부모는 마음 리포트 */
export default function Welcome() {
  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.logoRow}>
          <WeatherIcon code="partly" size={40} />
          <Text style={styles.logo}>마음날씨</Text>
        </View>

        <View style={styles.art}>
          <View style={{ alignItems: 'center' }}>
            <WeatherIcon code="sunny" size={52} />
            <Avatar
              avatar={{ skin: 'light', hair: 'ponytail', hairColor: '#4A3226', shirt: '#F4A6A0', top: 'apron', eyes: 'smile', nameTag: true, headwear: 'scrunchie' }}
              expression="happy"
              size={120}
            />
          </View>
          <View style={{ alignItems: 'center' }}>
            <WeatherIcon code="partly" size={52} />
            <Avatar avatar={{ skin: 'medium', hair: 'bobBangs', hairColor: '#2F2320', shirt: '#FFD58A', top: 'sweatshirt', eyes: 'big' }} expression="calm" size={120} />
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <Text style={styles.title}>아이 마음을{'\n'}날씨로 들어요</Text>
          <View style={styles.points}>
            <Text style={styles.point}>👧 아이는 선생님·친구에게 날씨 스티커를 붙이며 놀아요</Text>
            <Text style={styles.point}>📊 부모는 아이가 느끼는 어린이집 분위기를 흐름으로 봐요</Text>
            <Text style={styles.point}>💬 “그랬구나” 대화법으로 마음을 나눠요</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />
        <BigButton label="시작하기" onPress={() => router.push('/onboarding/account')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, gap: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  logo: { fontFamily: fonts.title, fontSize: 24, color: colors.ink },
  art: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 8, backgroundColor: colors.skySoft, borderRadius: 24, paddingTop: 12 },
  title: { fontFamily: fonts.title, fontSize: 30, lineHeight: 40, color: colors.ink },
  points: { gap: 8 },
  point: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
});
