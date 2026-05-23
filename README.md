# ShiftPal

HR-managed shift scheduling, swap approvals, attendance, and payroll export.

## Apps

- `web`: Next.js 14 App Router + Tailwind frontend.
- `api`: Node/Express TypeScript backend for supervisor workflows, payroll export, and server-side Supabase access.
- `supabase`: Postgres schema, RLS policies, and seed data.
- `shared`: Shared Zod schemas and TypeScript types.

## Environment keys

Copy examples:

```bash
cp api/.env.example api/.env
cp web/.env.local.example web/.env.local
```

### API `.env`

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Web `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Setup

1. Create a Supabase project.
2. Run SQL in this order:
   - `supabase/schema.sql`
   - `supabase/policies.sql`
   - `supabase/seed.sql`
3. Install and run:

```bash
cd api
npm install
npm run dev
```

Open another terminal:

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Tests

```bash
cd api
npm test
```

```bash
cd web
npm run test:e2e
```

## Demo accounts

After running the seed SQL, create matching Supabase Auth users manually with these emails:

- `admin@shiftpal.co.za`
- `worker1@shiftpal.co.za`
- `worker2@shiftpal.co.za`

Then copy their Auth UUIDs into `public.profiles.id` if you want live login mapping.
