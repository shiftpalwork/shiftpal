create extension if not exists "uuid-ossp";

create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  industry text not null default 'manufacturing',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  mobile text,
  role text not null check (role in ('worker','supervisor','admin')),
  reliability_score numeric not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.shifts (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  role_name text not null,
  location text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','missed','cancelled')),
  created_at timestamptz not null default now(),
  constraint shifts_time_check check (ends_at > starts_at)
);

create table if not exists public.swap_requests (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  requester_shift_id uuid not null references public.shifts(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_worker_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status text not null default 'pending_peer' check (status in ('pending_peer','pending_supervisor','approved','declined')),
  peer_reason text,
  supervisor_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('present','late','absent','excused')),
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_company on public.profiles(company_id);
create index if not exists idx_shifts_company_time on public.shifts(company_id, starts_at);
create index if not exists idx_swaps_company_status on public.swap_requests(company_id, status);
create index if not exists idx_attendance_company on public.attendance_records(company_id, created_at);
