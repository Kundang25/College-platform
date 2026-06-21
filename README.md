# College Discovery Platform

Next.js MVP for searching, filtering, comparing, and saving colleges from the bundled JSON dataset.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What is included

- College listing with search, state/type filters, fee slider, and sorting
- College detail pages
- Dedicated compare page for up to 4 colleges
- Saved colleges dashboard using browser local storage
- Rank predictor tool with exam/category/quota inputs
- Login/signup screens wired for Supabase Auth
- Reviews, placement estimates, cutoff trends, and richer detail sections
- Paginated `/api/colleges` endpoint plus college, compare, save, and review APIs
- Supabase-ready schema and seed script
- Local JSON fallback from `src/data/colleges.json`

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Add your Supabase project URL, anon/publishable key, and service role key.
   Use the base project URL, not the REST API path:
   `https://your-project-ref.supabase.co`
3. In the Supabase SQL editor, run `supabase/schema.sql`.
4. Seed the table:

```bash
npm run seed:supabase
```

The service role key must stay server-side only. Do not expose it in client components or commit it to git.

## Useful commands

```bash
npm run lint
npm run build
npm run seed:supabase
```
