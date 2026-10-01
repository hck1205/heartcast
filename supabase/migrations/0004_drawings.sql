-- 원장님 표시 (선생님 중 한 명)
alter table public.people add column if not exists role text check (role in ('director'));

-- 그림 놀이 원본: 배경·사람 배치·표정·말풍선·스탬프·크레용 선 (분석용 응답은 responses 에 'art' 로 따로 저장)
create table if not exists public.drawings (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists drawings_family_created_idx on public.drawings (family_id, created_at);

alter table public.drawings enable row level security;
create policy "drawings: own family" on public.drawings
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());

alter table public.responses drop constraint if exists responses_game_check;
alter table public.responses
  add constraint responses_game_check check (game in ('weather', 'face', 'story', 'portrait', 'relation', 'art'));
