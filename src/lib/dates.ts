/** 날짜 도우미: 하루 길이 · 날짜 키(YYYY-MM-DD, 현지 시간) · 하루의 시작 · 오늘인지 */

export const DAY = 24 * 60 * 60 * 1000;

export const dayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const isSameDay = (iso: string, day: Date) => dayKey(new Date(iso)) === dayKey(day);
