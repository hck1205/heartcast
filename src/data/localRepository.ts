import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Drawing, ParentNote, PlayResponse, PlaySession, Profile } from '@/types';
import type { Repository } from './repository';

const K = {
  profile: 'mn:profile',
  sessions: 'mn:sessions',
  responses: 'mn:responses',
  notes: 'mn:notes',
  drawings: 'mn:drawings',
};

async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const setJson = (key: string, v: unknown) => AsyncStorage.setItem(key, JSON.stringify(v));

/** 서버 없이 기기 안에만 저장하는 체험(데모) 모드 */
export const localRepository: Repository = {
  mode: 'demo',
  loadProfile: () => getJson<Profile | null>(K.profile, null),
  saveProfile: (p) => setJson(K.profile, p),
  async saveSession(session: PlaySession, responses: PlayResponse[]) {
    const sessions = await getJson<PlaySession[]>(K.sessions, []);
    const all = await getJson<PlayResponse[]>(K.responses, []);
    await setJson(K.sessions, [...sessions, session]);
    await setJson(K.responses, [...all, ...responses]);
  },
  async listResponses(sinceIso: string) {
    const all = await getJson<PlayResponse[]>(K.responses, []);
    return all.filter((r) => r.createdAt >= sinceIso);
  },
  async saveDrawing(d: Drawing) {
    const all = await getJson<Drawing[]>(K.drawings, []);
    await setJson(K.drawings, [...all.filter((x) => x.id !== d.id), d]);
  },
  async listDrawings(sinceIso: string) {
    const all = await getJson<Drawing[]>(K.drawings, []);
    return all.filter((d) => d.createdAt >= sinceIso);
  },
  async addNote(note: ParentNote) {
    const notes = await getJson<ParentNote[]>(K.notes, []);
    await setJson(K.notes, [note, ...notes]);
  },
  listNotes: () => getJson<ParentNote[]>(K.notes, []),
  async resetAll() {
    await AsyncStorage.multiRemove(Object.values(K));
  },
};
