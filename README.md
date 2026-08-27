# دليل المعلمين — Teacher Directory Platform

A production-ready platform for students and parents in Egypt to find local
private tutors. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS,
and Supabase (Auth, Postgres + RLS, Storage). Arabic RTL throughout, with
dark mode support.

## Tech stack

- **Next.js 15** (App Router, Server Actions, Route Handlers)
- **TypeScript** (strict mode, `noUncheckedIndexedAccess`)
- **Tailwind CSS v4**
- **Supabase**: Postgres with Row Level Security, Auth (email/password +
  Google OAuth), Storage
- **Zod** for server-side validation
- Deploys to **Vercel** with zero code changes

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

`.env.local` is already filled in with your project's URL and publishable
key (safe to expose client-side — protected by RLS). `.env.local.example`
is the template for other environments/CI.

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Already set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Already set (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Only needed for the admin dashboard's "create a teacher account directly" feature (`adminCreateTeacherAccountAction`). Get it from Supabase Dashboard → Project Settings → API → service_role. **Never** prefix it with `NEXT_PUBLIC_` — it must stay server-only. Everything else in the app works fully without it, since teachers normally self-register. |
| `RESEND_API_KEY` | No | Enables an email notification to `ADMIN_NOTIFICATION_EMAIL` whenever someone submits the support/contact form. Get a free key at [resend.com](https://resend.com) (no credit card needed for the free tier). Without it, messages still save and appear in `/admin/support` — you just won't get an email ping. |
| `ADMIN_NOTIFICATION_EMAIL` | No | The email address that receives support-form notifications (only used if `RESEND_API_KEY` is also set). |
| `RESEND_FROM_EMAIL` | No | Defaults to Resend's shared testing address. Once you verify your own domain in Resend, set this to something like `Modareseani <support@yourdomain.com>`. |
| `GOOGLE_SITE_VERIFICATION` | No | The code from Google Search Console's "HTML tag" verification method. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Your deployed URL (e.g. `https://your-app.vercel.app`), used to build password-reset email links. Defaults to relative behavior if unset, but set this in production. |

## 3. Apply the database migrations

This sandbox has no network access to `supabase.co`, so the SQL has been
written but **not yet applied to your project** — you'll need to run it
yourself, once, via either method:

**Option A — Supabase CLI (recommended)**

```bash
supabase login
supabase link --project-ref yuvseplshemchpwoknuf
supabase db push
```

**Option B — SQL Editor**

Open the Supabase Dashboard → SQL Editor, and run each file in
`supabase/migrations/` **in order** (0001 → 0007). Each file is idempotent
(`if not exists` / `drop policy if exists` guards), so it's safe to re-run.

What each migration does:

1. `0001` — extensions + enum types (`account_type`, `teaching_method`, `app_role`)
2. `0002` — all tables (profiles, teachers, ratings, reviews, governorates, cities, subjects, teacher_subjects, user_roles) with FKs and indexes
3. `0003` — triggers (new-user → profile creation, rating→teacher average sync, updated_at maintenance, review ownership validation)
4. `0004` — Row Level Security policies on every table
5. `0005` — the `avatars` Storage bucket + its access policies
6. `0006` — reference data seed: all 27 Egyptian governorates, their cities, and a starter subject list (this is reference/lookup data, not fake user content — no demo teachers or reviews are seeded anywhere)
7. `0007` — fixes found during a full audit of the original schema: syncs teachers' public fields (name/photo/location) from `profiles` on every edit (this trigger was referenced in comments but never actually implemented); tightens the `profiles` SELECT policy so only the owner or an admin can read a profile row (it was previously readable by any signed-in user, including emails — a real privacy gap); adds the `education_system` ("teaching system") and `available_times` fields from the product spec, which were missing from the original table; and fixes the avatars bucket's upload policy so admins can actually upload a photo on a teacher's behalf (the original policy only let admins update/delete existing files, not create new ones).

## 4. Create your first admin account

There's no self-service way to become an admin (by design — this is a
role stored in a separate `user_roles` table specifically so a user can
never grant themselves admin via the app). After signing up normally through
the app, promote yourself via SQL Editor:

```sql
insert into public.user_roles (user_id, role)
values ('<your-auth-user-id>', 'admin');
```

Find your user ID under Authentication → Users in the dashboard, or via
`select id from auth.users where email = 'you@example.com';`.

## 5. (Optional) Enable Google sign-in

The "Continue with Google" button is already wired up
(`supabase.auth.signInWithOAuth`). To activate it: Supabase Dashboard →
Authentication → Providers → Google, add your OAuth Client ID/Secret, and
set the redirect URL to `https://<your-domain>/auth/callback` (and
`http://localhost:3000/auth/callback` for local dev). Until configured, the
button shows a friendly error toast instead of failing silently.

## 6. Run locally

```bash
npm run dev
```

## 7. Deploy to Vercel

Push this project to a Git repo, import it in Vercel, and set the same
environment variables from step 2 in the Vercel project settings. No config
changes needed — `next.config.ts` already whitelists your Supabase project's
storage domain for `next/image`.

---

## Architecture notes

- **Denormalization for privacy, not just performance.** `profiles` (which
  holds email) is only readable by its owner or an admin. Every teacher's
  publicly-displayed fields (name, photo, governorate, city, phone) are kept
  as an always-in-sync copy directly on the `teachers` row via a database
  trigger, and a reviewer's display name/photo are captured onto the
  `reviews` row at write time. This means the public directory and profile
  pages never need to query another user's `profiles` row at all.
- **Ratings vs. reviews are separate tables** (1:1, linked by `rating_id`).
  A rating (1–5 stars) is always required; the review text is optional. This
  matches the spec's data model literally and keeps "average rating"
  queries cheap.
- **Publishing gate.** A teacher's `is_published` flag only becomes `true`
  once bio, subjects, grade levels, and a photo are all present — enforced
  at every path that can set it (self-signup, settings edit, admin edit),
  not just one.
- **Server Actions, not a maze of API routes**, handle nearly all mutations
  (signup, profile edits, ratings, admin CRUD) — this is the modern Next.js
  15 equivalent of API routes: code that runs only on the server, with the
  same auth/validation guarantees, but with progressive enhancement (forms
  still work without client JS) built in for free. `GET /api/teachers` is
  additionally provided as a conventional REST endpoint (authenticated,
  RLS-backed, documented in its source file) for anything that needs to
  query teacher data over plain HTTP.
- **Admin actions re-check the admin role server-side on every single
  call** (`requireAdmin()`), not just via the layout guard — so there's no
  path where hiding a nav link is the only thing standing between a
  non-admin and an admin action.

## Known limitations / things to verify after deploying

- This sandbox cannot reach `supabase.co`, so while the SQL has been
  carefully reviewed and the application code builds cleanly against the
  schema, the actual auth flows (email confirmation, Google OAuth, password
  reset emails) have not been exercised end-to-end against a live project.
  Test the signup → email confirm → login path once deployed.
- `npm audit` reports 3 "high" advisories, all in `postcss`/`sharp` pulled
  in transitively by Next.js's own build tooling. Its suggested
  `npm audit fix --force` would downgrade Next.js to v9 (ancient) — don't
  run that. These are build-time dependencies, not something end-user input
  reaches; check Next.js's release notes for updates instead.
- The admin "create a teacher account directly" feature needs
  `SUPABASE_SERVICE_ROLE_KEY` (see step 2). Without it, every other admin
  feature (edit, publish/unpublish, delete, moderate reviews, manage
  governorates/cities/subjects) still works fully.
