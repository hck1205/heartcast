import type { ParentNote, PlayResponse, PlaySession, Profile } from '@/types';

export type AccountMode = 'demo' | 'cloud';

/** 저장소 추상화: Supabase(클라우드)와 기기 내 데모 저장소가 같은 인터페이스를 쓴다. */
export interface Repository {
  mode: AccountMode;
  loadProfile(): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<void>;
  saveSession(session: PlaySession, responses: PlayResponse[]): Promise<void>;
  listResponses(sinceIso: string): Promise<PlayResponse[]>;
  addNote(note: ParentNote): Promise<void>;
  listNotes(): Promise<ParentNote[]>;
  resetAll(): Promise<void>;
}
