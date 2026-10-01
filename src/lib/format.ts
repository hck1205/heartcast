/** 날짜 표시 (한국어). 리포트·관계도·그림·대화 기록 공용 */

/** 9. 30. */
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });

/** 9월 30일 오후 7:00 */
export const longDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** 9월 30일 오후 7:00 (짧은 달 이름) — 대화 기록용 */
export const noteDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
