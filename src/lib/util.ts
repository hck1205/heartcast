import type { Accessory, AvatarConfig, HairStyle, SkinTone } from '@/types';
import { palettes } from '@/theme';

/** RFC4122 v4 형식 UUID (Supabase uuid 컬럼용) */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * 부모 PIN 해시. 아이가 부모 화면에 들어가지 못하게 하는 "잠금" 용도이며,
 * 계정 보안은 Supabase 로그인으로 따로 보호된다.
 */
export function hashPin(pin: string): string {
  let h = 0x811c9dc5;
  const s = `maeum-nalssi:${pin}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export const SKINS = Object.keys(palettes.skins) as SkinTone[];
export const HAIRS: HairStyle[] = ['short', 'bob', 'long', 'bun', 'curly', 'pigtails', 'spiky'];
export const ACCESSORIES: Accessory[] = ['none', 'glasses', 'ribbon', 'cap', 'flower', 'crown'];

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

export function randomAvatar(): AvatarConfig {
  return {
    skin: pick(SKINS),
    hair: pick(HAIRS),
    hairColor: pick(palettes.hairColors),
    shirt: pick(palettes.shirts),
    accessory: pick(ACCESSORIES),
  };
}
