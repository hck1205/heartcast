import { View } from 'react-native';

import { diaryPages } from '@/games/diary';
import type { Person, PlayResponse, Profile } from '@/types';
import { DiaryCard } from './DiaryCard';
import { Section } from './ParentShell';

/** 사람 상세: 최근 그림일기 5장 (새 장이 위, 지난 장과 달라진 칸 강조). 일기가 없으면 숨긴다 */
export function PersonDiary({ person, responses, profile }: { person: Person; responses: PlayResponse[]; profile: Profile }) {
  const pages = diaryPages(responses, person.id);
  if (!pages.length) return null;
  const recent = pages.slice(-5).reverse();
  return (
    <Section title="그림일기" sub="아이가 그날 이 사람을 어떻게 느꼈는지 칸마다 고른 거예요. 노란 줄은 지난 장과 달라진 칸이에요">
      <View style={{ gap: 10 }}>
        {recent.map((pg) => (
          <DiaryCard key={pg.id} page={pg} prev={pages[pages.indexOf(pg) - 1]} person={person} profile={profile} />
        ))}
      </View>
    </Section>
  );
}
