-- 마음날씨 초기 스키마
-- 모든 테이블은 family_id = auth.uid() 로 행 수준 보안(RLS)을 건다.

create table if not exists public.families (
  id uuid primary key references auth.users (id) on delete cascade,
  pin_hash text not null,
  stars integer not null default 0,
  stickers jsonb not null default '[]'::jsonb,
  onboarded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null,
  avatar jsonb not null,
  class_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  kind text not null check (kind in ('teacher', 'friend')),
  name text not null,
  avatar jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.play_sessions (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz not null
);

create table if not exists public.responses (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  session_id uuid not null references public.play_sessions (id) on delete cascade,
  target_type text not null check (target_type in ('person', 'topic')),
  -- person 이면 people.id, topic 이면 'class' | 'meal' | 'nap' | 'play' | 'self'
  target_id text not null,
  game text not null check (game in ('weather', 'face', 'story')),
  value text not null,
  score smallint check (score between -2 and 2),
  fear boolean not null default false,
  hesitation_ms integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists responses_family_created_idx on public.responses (family_id, created_at);
create index if not exists responses_target_idx on public.responses (family_id, target_id);

create table if not exists public.parent_notes (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  target_id text,
  body text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.people enable row level security;
alter table public.play_sessions enable row level security;
alter table public.responses enable row level security;
alter table public.parent_notes enable row level security;

create policy "own family" on public.families
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own children" on public.children
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());

create policy "own people" on public.people
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());

create policy "own sessions" on public.play_sessions
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());

create policy "own responses" on public.responses
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());

create policy "own notes" on public.parent_notes
  for all using (family_id = auth.uid()) with check (family_id = auth.uid());
