/** 한국어 조사 붙이기: josa('민준', '이랑/랑') → '민준이랑' */
export function hasBatchim(word: string): boolean {
  const ch = word.trim().slice(-1);
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

export function josa(word: string, pair: `${string}/${string}`): string {
  const [withB, withoutB] = pair.split('/');
  return word + (hasBatchim(word) ? withB : withoutB);
}
