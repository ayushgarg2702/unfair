# Unfair Website

**Because she is always right.**

A private shared hug counter for two people. Ayush increases the counter whenever he misses her. She can decrease or adjust it with a reason.

## Tech

- Next.js
- Supabase Auth + Postgres
- Vercel hosting

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with your Supabase project URL and anon key.

## Supabase setup

1. Create a Supabase project.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Authentication > Providers > Email and enable Email provider.
5. Create two users manually in Authentication > Users, or use magic-link login from the app.
6. Add both emails to your `.env.local` and Vercel environment variables.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the GitHub repo in Vercel.
3. Add these environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ALLOWED_EMAIL_1`
   - `NEXT_PUBLIC_ALLOWED_EMAIL_2`
   - `NEXT_PUBLIC_YOUR_NAME`
   - `NEXT_PUBLIC_HER_NAME`
4. Deploy.

## Notes

The database uses Row Level Security. Only authenticated users can read/write, and the app additionally blocks emails outside the two configured users.
# unfair
# unfair
