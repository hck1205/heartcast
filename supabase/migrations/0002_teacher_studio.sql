-- 선생님 공방: 아이가 그린 선생님 이미지(색·동물·모양·성격)
alter table public.people add column if not exists persona jsonb;

-- 'portrait' 응답(value 예: 'animal:lion', 'trait:kind') 허용
alter table public.responses drop constraint if exists responses_game_check;
alter table public.responses
  add constraint responses_game_check check (game in ('weather', 'face', 'story', 'portrait'));
