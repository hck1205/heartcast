import { getSupabase } from '@/lib/supabase';
import type { ParentNote, Person, PlayResponse, PlaySession, Profile } from '@/types';
import type { Repository } from './repository';

async function uid(): Promise<string> {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error('로그인이 필요해요');
  return data.user.id;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** Supabase(Postgres + RLS) 저장소. 모든 행은 family_id = auth.uid() 로 보호된다. */
export const supabaseRepository: Repository = {
  mode: 'cloud',

  async loadProfile() {
    const sb = getSupabase();
    const familyId = await uid();
    const family = check(await sb.from('families').select('*').eq('id', familyId).maybeSingle());
    if (!family) return null;
    const child = check(await sb.from('children').select('*').eq('family_id', familyId).limit(1).maybeSingle());
    if (!child) return null;
    const people = check(
      await sb.from('people').select('*').eq('family_id', familyId).order('sort_order', { ascending: true }),
    ) as any[];
    return {
      child: { id: child.id, name: child.name, avatar: child.avatar, className: child.class_name ?? '' },
      people: people.map((p): Person => ({ id: p.id, kind: p.kind, name: p.name, avatar: p.avatar, persona: p.persona ?? undefined })),
      pinHash: family.pin_hash,
      stars: family.stars ?? 0,
      stickers: family.stickers ?? [],
      onboardedAt: family.onboarded_at,
    };
  },

  async saveProfile(p: Profile) {
    const sb = getSupabase();
    const familyId = await uid();
    check(
      await sb.from('families').upsert({
        id: familyId,
        pin_hash: p.pinHash,
        stars: p.stars,
        stickers: p.stickers,
        onboarded_at: p.onboardedAt,
      }),
    );
    check(
      await sb.from('children').upsert({
        id: p.child.id,
        family_id: familyId,
        name: p.child.name,
        avatar: p.child.avatar,
        class_name: p.child.className,
      }),
    );
    if (p.people.length) {
      check(
        await sb.from('people').upsert(
          p.people.map((x, i) => ({
            id: x.id,
            family_id: familyId,
            child_id: p.child.id,
            kind: x.kind,
            name: x.name,
            avatar: x.avatar,
            persona: x.persona ?? null,
            sort_order: i,
          })),
        ),
      );
    }
    const keep = p.people.map((x) => x.id);
    let del = sb.from('people').delete().eq('family_id', familyId);
    if (keep.length) del = del.not('id', 'in', `(${keep.join(',')})`);
    check(await del);
  },

  async saveSession(session: PlaySession, responses: PlayResponse[]) {
    const sb = getSupabase();
    const familyId = await uid();
    const child = check(await sb.from('children').select('id').eq('family_id', familyId).limit(1).single()) as {
      id: string;
    };
    check(
      await sb.from('play_sessions').insert({
        id: session.id,
        family_id: familyId,
        child_id: child.id,
        started_at: session.startedAt,
        finished_at: session.finishedAt,
      }),
    );
    if (responses.length) {
      check(
        await sb.from('responses').insert(
          responses.map((r) => ({
            id: r.id,
            family_id: familyId,
            child_id: child.id,
            session_id: r.sessionId,
            target_type: r.targetType,
            target_id: r.targetId,
            game: r.game,
            value: r.value,
            score: r.score,
            fear: r.fear,
            hesitation_ms: r.hesitationMs,
            created_at: r.createdAt,
          })),
        ),
      );
    }
  },

  async listResponses(sinceIso: string) {
    const sb = getSupabase();
    const familyId = await uid();
    const rows = check(
      await sb
        .from('responses')
        .select('*')
        .eq('family_id', familyId)
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: true }),
    ) as any[];
    return rows.map(
      (r): PlayResponse => ({
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
      }),
    );
  },

  async addNote(note: ParentNote) {
    const sb = getSupabase();
    const familyId = await uid();
    check(
      await sb.from('parent_notes').insert({
        id: note.id,
        family_id: familyId,
        target_id: note.targetId,
        body: note.body,
        created_at: note.createdAt,
      }),
    );
  },

  async listNotes() {
    const sb = getSupabase();
    const familyId = await uid();
    const rows = check(
      await sb.from('parent_notes').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
    ) as any[];
    return rows.map((r) => ({ id: r.id, targetId: r.target_id, body: r.body, createdAt: r.created_at }));
  },

  async resetAll() {
    const sb = getSupabase();
    const familyId = await uid();
    // families 삭제 시 on delete cascade 로 모든 하위 데이터가 지워진다
    check(await sb.from('families').delete().eq('id', familyId));
  },
};
