import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { NoteBox } from '@/components/report/NoteBox';
import { ParentShell } from '@/components/report/ParentShell';
import { TalkCardView } from '@/components/report/TalkCardView';
import { buildReport } from '@/report/analyze';
import { DAILY_CARD, talkCardFor } from '@/report/talkCards';
import { useApp } from '@/state/AppContext';

export default function Talk() {
  const { signal: signalId } = useLocalSearchParams<{ signal?: string }>();
  const { profile, responses } = useApp();
  const signal = useMemo(() => {
    if (!signalId || !profile) return null;
    for (const days of [7, 30]) {
      const s = buildReport(responses, profile.people, new Date(), days, profile.child.name).signals.find((x) => x.id === signalId);
      if (s) return s;
    }
    return null;
  }, [signalId, profile, responses]);
  const card = signal ? talkCardFor(signal) : DAILY_CARD;
  const targetId = signal && signal.targetId !== 'self' ? signal.targetId : null;

  return (
    <ParentShell title="그랬구나 대화">
      <TalkCardView card={card} />
      <NoteBox targetId={targetId} />
    </ParentShell>
  );
}
