import { getSupabase } from '@/lib/supabase';
import type { Drawing, ParentNote, PlayResponse, PlaySession, Profile } from '@/types';
import type { Repository } from './repository';
import { childRow, familyRow, noteFromRow, noteRow, peopleRows, profileFromRows, responseFromRow, responseRow } from './supabaseRows';

/** 클라이언트 + 로그인한 가족 id */
async function ctx() {
  const sb = getSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) throw new Error('로그인이 필요해요');
  return { sb, familyId: data.user.id };
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

type Client = ReturnType<typeof getSupabase>;

async function childIdOf(sb: Client, familyId: string): Promise<string> {
  const child = check(await sb.from('children').select('id').eq('family_id', familyId).limit(1).single()) as { id: string };
  return child.id;
}

/** Supabase(Postgres + RLS) 저장소. 모든 행은 family_id = auth.uid() 로 보호된다. */
export const supabaseRepository: Repository = {
  mode: 'cloud',

  async loadProfile() {
    const { sb, familyId } = await ctx();
    const family = check(await sb.from('families').select('*').eq('id', familyId).maybeSingle());
    if (!family) return null;
    const child = check(await sb.from('children').select('*').eq('family_id', familyId).limit(1).maybeSingle());
    if (!child) return null;
    const people = check(await sb.from('people').select('*').eq('family_id', familyId).order('sort_order', { ascending: true })) as any[];
    return profileFromRows(family, child, people);
  },

  async saveProfile(p: Profile) {
    const { sb, familyId } = await ctx();
    check(await sb.from('families').upsert(familyRow(p, familyId)));
    check(await sb.from('children').upsert(childRow(p, familyId)));
    if (p.people.length) check(await sb.from('people').upsert(peopleRows(p, familyId)));
    const keep = p.people.map((x) => x.id);
    let del = sb.from('people').delete().eq('family_id', familyId);
    if (keep.length) del = del.not('id', 'in', `(${keep.join(',')})`);
    check(await del);
  },

  async saveSession(session: PlaySession, responses: PlayResponse[]) {
    const { sb, familyId } = await ctx();
    const childId = await childIdOf(sb, familyId);
    check(
      await sb.from('play_sessions').insert({
        id: session.id,
        family_id: familyId,
        child_id: childId,
        started_at: session.startedAt,
        finished_at: session.finishedAt,
      }),
    );
    if (responses.length) check(await sb.from('responses').insert(responses.map((r) => responseRow(r, familyId, childId))));
  },

  async listResponses(sinceIso: string) {
    const { sb, familyId } = await ctx();
    const rows = check(
      await sb.from('responses').select('*').eq('family_id', familyId).gte('created_at', sinceIso).order('created_at', { ascending: true }),
    ) as any[];
    return rows.map(responseFromRow);
  },

  async saveDrawing(d: Drawing) {
    const { sb, familyId } = await ctx();
    const childId = await childIdOf(sb, familyId);
    check(await sb.from('drawings').upsert({ id: d.id, family_id: familyId, child_id: childId, data: d, created_at: d.createdAt }));
  },

  async listDrawings(sinceIso: string) {
    const { sb, familyId } = await ctx();
    const rows = check(
      await sb.from('drawings').select('data').eq('family_id', familyId).gte('created_at', sinceIso).order('created_at', { ascending: true }),
    ) as { data: Drawing }[];
    return rows.map((r) => r.data);
  },

  async addNote(note: ParentNote) {
    const { sb, familyId } = await ctx();
    check(await sb.from('parent_notes').insert(noteRow(note, familyId)));
  },

  async listNotes() {
    const { sb, familyId } = await ctx();
    const rows = check(await sb.from('parent_notes').select('*').eq('family_id', familyId).order('created_at', { ascending: false })) as any[];
    return rows.map(noteFromRow);
  },

  async resetAll() {
    const { sb, familyId } = await ctx();
    // families 삭제 시 on delete cascade 로 모든 하위 데이터가 지워진다
    check(await sb.from('families').delete().eq('id', familyId));
  },
};
