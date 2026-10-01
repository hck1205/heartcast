import { describe, expect, it } from '@jest/globals';

import { childRow, familyRow, noteFromRow, noteRow, peopleRows, profileFromRows, responseFromRow, responseRow } from '@/data/supabaseRows';
import type { ParentNote, PlayResponse, Profile } from '@/types';

const avatar = { skin: 'light' as const, hair: 'bobBangs' as const, hairColor: '#000000', shirt: '#ffffff' };
const profile: Profile = {
  child: { id: 'c-1', name: '콩이', className: '해님반', avatar },
  people: [
    { id: 't-1', kind: 'teacher', name: '미소', avatar, role: 'director' },
    { id: 'f-1', kind: 'friend', name: '하준', avatar },
  ],
  pinHash: 'abcd',
  stars: 12,
  stickers: ['🦄'],
  onboardedAt: '2026-09-01T00:00:00.000Z',
  unlocked: ['pet:puppy'],
  pet: 'puppy',
  badges: ['first'],
  stickerBoard: [{ id: '🦄', x: 0.5, y: 0.5 }],
  bonusDay: '2026-09-30',
};

describe('supabase rows', () => {
  it('round-trips a profile with fun extras', () => {
    const people = peopleRows(profile, 'fam');
    expect(people.map((p) => [p.sort_order, p.child_id, p.role])).toEqual([
      [0, 'c-1', 'director'],
      [1, 'c-1', null],
    ]);
    expect(profileFromRows(familyRow(profile, 'fam'), childRow(profile, 'fam'), people)).toEqual(profile);
  });

  it('fills defaults for an old family row', () => {
    const p = profileFromRows({ pin_hash: 'x', onboarded_at: 'd' }, { id: 'c', name: '콩이', avatar }, []);
    expect(p).toMatchObject({ stars: 0, stickers: [], people: [], child: { className: '' } });
    expect(p.pet).toBeUndefined();
  });

  it('round-trips responses and notes', () => {
    const r: PlayResponse = { id: 'r', sessionId: 's', targetType: 'person', targetId: 't-1', game: 'weather', value: 'sunny', score: 2, fear: false, hesitationMs: 900, createdAt: '2026-09-30T01:02:03.000Z' };
    const row = responseRow(r, 'fam', 'c-1');
    expect(row).toMatchObject({ family_id: 'fam', child_id: 'c-1', session_id: 's', hesitation_ms: 900 });
    expect(responseFromRow({ ...row, created_at: '2026-09-30T01:02:03+00:00' })).toEqual(r);
    const n: ParentNote = { id: 'n', targetId: 't-1', body: '그랬구나', createdAt: '2026-09-30T00:00:00.000Z' };
    expect(noteFromRow(noteRow(n, 'fam'))).toEqual(n);
  });
});
