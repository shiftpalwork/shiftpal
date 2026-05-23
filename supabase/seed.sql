insert into public.companies (id, name, industry)
values ('11111111-1111-1111-1111-111111111111', 'Ubuntu Foods Warehouse', 'logistics')
on conflict do nothing;

insert into public.profiles (id, company_id, full_name, email, mobile, role, reliability_score)
values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Ayesha Mokoena', 'admin@shiftpal.co.za', '+27670000000', 'supervisor', 100),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Thabo Dlamini', 'worker1@shiftpal.co.za', '+27671111111', 'worker', 97),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Lerato Nkosi', 'worker2@shiftpal.co.za', '+27672222222', 'worker', 92)
on conflict do nothing;

insert into public.shifts (company_id, worker_id, role_name, location, starts_at, ends_at)
values
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Picker', 'Warehouse A', now() + interval '1 day', now() + interval '1 day 8 hours'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Packer', 'Warehouse A', now() + interval '2 day', now() + interval '2 day 8 hours');
