-- 그림일기: 칸마다 응답 하나 (game = 'diary', value = '<칸>:<선택>'), 한 장 = 한 세션
alter table public.responses drop constraint if exists responses_game_check;
alter table public.responses
  add constraint responses_game_check check (game in ('weather', 'face', 'story', 'portrait', 'relation', 'art', 'diary'));
