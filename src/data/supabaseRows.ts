/** Supabase 행(snake_case) ↔ 앱 타입 변환. 쿼리 없이 순수 함수라 테스트할 수 있다 */
import type { ParentNote, Person, PlayResponse, Profile } from '@/types';

type Row = Record<string, any>;

export function profileFromRows(family: Row, child: Row, people: Row[]): Profile {
  return {
    child: { id: child.id, name: child.name, avatar: child.avatar, className: child.class_name ?? '' },
    people: people.map((p): Person => ({ id: p.id, kind: p.kind, name: p.name, avatar: p.avatar, persona: p.persona ?? undefined, role: p.role ?? undefined })),
    pinHash: family.pin_hash,
    stars: family.stars ?? 0,
    stickers: family.stickers ?? [],
    onboardedAt: family.onboarded_at,
    // 별 상점·반려 친구·배지·스티커판·보너스 (재미 요소)
    ...(family.extras ?? {}),
  };
}

export const familyRow = (p: Profile, familyId: string) => ({
  id: familyId,
  pin_hash: p.pinHash,
  stars: p.stars,
  stickers: p.stickers,
  onboarded_at: p.onboardedAt,
  extras: { unlocked: p.unlocked ?? [], pet: p.pet ?? null, badges: p.badges ?? [], stickerBoard: p.stickerBoard ?? [], bonusDay: p.bonusDay ?? null },
});

export const childRow = (p: Profile, familyId: string) => ({
  id: p.child.id,
  family_id: familyId,
  name: p.child.name,
  avatar: p.child.avatar,
  class_name: p.child.className,
});

export const peopleRows = (p: Profile, familyId: string) =>
  p.people.map((x, i) => ({
    id: x.id,
    family_id: familyId,
    child_id: p.child.id,
    kind: x.kind,
    name: x.name,
    avatar: x.avatar,
    persona: x.persona ?? null,
    role: x.role ?? null,
    sort_order: i,
  }));

export const responseRow = (r: PlayResponse, familyId: string, childId: string) => ({
  id: r.id,
  family_id: familyId,
  child_id: childId,
  session_id: r.sessionId,
  target_type: r.targetType,
  target_id: r.targetId,
  game: r.game,
  value: r.value,
  score: r.score,
  fear: r.fear,
  hesitation_ms: r.hesitationMs,
  created_at: r.createdAt,
});

export const responseFromRow = (r: Row): PlayResponse => ({
  id: r.id,
  sessionId: r.session_id,
  targetType: r.target_type,
  targetId: r.target_id,
  game: r.game,
  value: r.value,
  score: r.score,
  fear: r.fear,
  hesitationMs: r.hesitation_ms,
  createdAt: new Date(r.created_at).toISOString(),
});

export const noteRow = (n: ParentNote, familyId: string) => ({
  id: n.id,
  family_id: familyId,
  target_id: n.targetId,
  body: n.body,
  created_at: n.createdAt,
});

export const noteFromRow = (r: Row): ParentNote => ({ id: r.id, targetId: r.target_id, body: r.body, createdAt: r.created_at });
