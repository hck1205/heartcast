-- 재미 요소: 별 상점에서 연 아이템, 반려 친구, 배지, 스티커판, 보너스 게임 날짜
-- (리포트 분석에는 쓰지 않는 아이 보상 데이터라 jsonb 하나로 묶는다)
alter table public.families add column if not exists extras jsonb not null default '{}'::jsonb;
