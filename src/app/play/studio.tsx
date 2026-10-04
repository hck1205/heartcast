import { router } from 'expo-router';

import { Studio } from '@/components/studio/Studio';
import { useStudioTarget } from '@/components/studio/useStudioTarget';
import { useApp } from '@/state/AppContext';

/** 아이 공방: 아이가 직접 선생님·친구를 만들고 다시 꾸민다 (지우기는 부모 설정에서만) */
export default function PlayStudio() {
  const app = useApp();
  const { person } = useStudioTarget(app.profile?.people ?? []);
  return (
    <Studio
      initial={person}
      onCancel={() => router.back()}
      onDone={async ({ person: p, responses }) => {
        await app.savePerson(p, responses);
        router.back();
      }}
    />
  );
}
