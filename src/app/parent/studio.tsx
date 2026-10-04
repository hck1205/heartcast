import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

import { Studio } from '@/components/studio/Studio';
import { useStudioTarget } from '@/components/studio/useStudioTarget';
import { josa } from '@/lib/josa';
import { useApp } from '@/state/AppContext';

function confirmDelete(message: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) onYes();
    return;
  }
  Alert.alert('지우기', message, [
    { text: '취소', style: 'cancel' },
    { text: '지우기', style: 'destructive', onPress: onYes },
  ]);
}

/** 부모 설정에서 여는 공방: 지우기 가능 */
export default function ParentStudio() {
  const app = useApp();
  const { person, isNew } = useStudioTarget(app.profile?.people ?? []);
  return (
    <Studio
      initial={person}
      onCancel={() => router.back()}
      onDelete={
        isNew
          ? undefined
          : () =>
              confirmDelete(`${josa(person.name, '을/를')} 지울까요? 지난 기록은 리포트에서 빠져요.`, async () => {
                await app.removePerson(person.id);
                router.back();
              })
      }
      onDone={async ({ person: p, responses }) => {
        await app.savePerson(p, responses);
        router.back();
      }}
    />
  );
}
