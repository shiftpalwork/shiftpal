alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.shifts enable row level security;
alter table public.swap_requests enable row level security;
alter table public.attendance_records enable row level security;

create or replace function public.current_company_id()
returns uuid
language sql
stable
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

drop policy if exists "profiles read same company" on public.profiles;
create policy "profiles read same company"
on public.profiles for select
using (company_id = public.current_company_id());

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "shifts read same company" on public.shifts;
create policy "shifts read same company"
on public.shifts for select
using (company_id = public.current_company_id());

drop policy if exists "shifts supervisor writes" on public.shifts;
create policy "shifts supervisor writes"
on public.shifts for all
using (company_id = public.current_company_id() and public.current_role() in ('supervisor','admin'))
with check (company_id = public.current_company_id() and public.current_role() in ('supervisor','admin'));

drop policy if exists "swaps read same company" on public.swap_requests;
create policy "swaps read same company"
on public.swap_requests for select
using (company_id = public.current_company_id());

drop policy if exists "workers create swaps" on public.swap_requests;
create policy "workers create swaps"
on public.swap_requests for insert
with check (company_id = public.current_company_id() and requester_id = auth.uid());

drop policy if exists "workers and supervisors update swaps" on public.swap_requests;
create policy "workers and supervisors update swaps"
on public.swap_requests for update
using (
  company_id = public.current_company_id()
  and (target_worker_id = auth.uid() or public.current_role() in ('supervisor','admin'))
);

drop policy if exists "attendance read same company" on public.attendance_records;
create policy "attendance read same company"
on public.attendance_records for select
using (company_id = public.current_company_id());

drop policy if exists "attendance supervisor writes" on public.attendance_records;
create policy "attendance supervisor writes"
on public.attendance_records for all
using (company_id = public.current_company_id() and public.current_role() in ('supervisor','admin'))
with check (company_id = public.current_company_id() and public.current_role() in ('supervisor','admin'));
