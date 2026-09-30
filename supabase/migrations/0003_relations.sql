-- 우리 반 전체 + 어른(엄마·아빠·친구 부모님) 만들기
alter table public.people drop constraint if exists people_kind_check;
alter table public.people
  add constraint people_kind_check check (kind in ('teacher', 'friend', 'parent'));

-- 관계도 놀이: 'relation' 응답 (value 예: 'close>{personId}', 'yell>self', '-fight>{personId}')
alter table public.responses drop constraint if exists responses_game_check;
alter table public.responses
  add constraint responses_game_check check (game in ('weather', 'face', 'story', 'portrait', 'relation'));
