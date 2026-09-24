# Supabase Integration (FaithPath Worship)

This app uses [Supabase](https://supabase.com) for accounts only — no
separate backend server. Notes and the light/dark theme preference stay
local to the device (`AsyncStorage`); only sign up / sign in / forgot
password go through Supabase. See the free-tier reasoning in `README.md`.

```
Expo app (React Native)
    └── @supabase/supabase-js
          ├── Auth           (email/password — signUp, signInWithPassword)
          ├── PostgreSQL     (public.profiles)
          └── Edge Functions (reset-password — the one privileged operation)
```

## Environment setup

`.env` in the project root (gitignored, never commit it):

```env
EXPO_PUBLIC_SUPABASE_URL=https://oilpjjzezgvbdfspaqee.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
```

Only the URL and the **anon/publishable** key ever go in the app — never
the `service_role`/secret key. Expo inlines `EXPO_PUBLIC_*` vars into the
bundle at build/start time (same idea as Vite's `VITE_*`), so restart
`npx expo start` after changing `.env`.

## Schema

### `auth.users` (managed by Supabase Auth)

Credentials, sessions, password hashing. Never written to directly with
SQL — only through Supabase Auth APIs (`signUp`, `signInWithPassword`,
`auth.admin.updateUserById`, ...).

### `public.profiles` — one row per auth user, same `id`

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  role text not null default 'normal' check (role in ('normal', 'admin')),
  otp text default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

- No `email` column here — it stays in `auth.users` only, so there's never
  a stale/duplicate copy.
- `role`: `'normal'` (default) or `'admin'`. New signups are always
  `'normal'`; promote someone by hand for now:
  `update public.profiles set role = 'admin' where id = '<uuid>';`
- `otp`: reserved for a future admin-invite-code signup gate — currently
  always `null` for everyone, nothing reads or writes it yet.

### Auth settings

**Supabase dashboard → Authentication → Sign In / Providers → Email → turn
off "Confirm email".** Not required for this app's flow the way it was for
the fitness-app reference (`SignUpScreen` here doesn't need an active
session to insert its own profile row — it actually calls
`supabase.auth.signOut()` right after), but leaving confirmation on means
`signInWithPassword` fails immediately after signup with "email not
confirmed", which is a confusing first-run experience. Turn it off unless
there's a specific reason to require confirmed emails.

## Forgot Password: security tradeoff (read this before changing it)

This flow intentionally has **no proof-of-ownership step** (no emailed
code, no security question — nothing) between confirming an email exists
and letting it set a new password. That was an explicit choice to keep the
UX identical to the app's original local-storage-only version. The real
consequence: **anyone who knows or guesses a user's email can take over
their account.** Acceptable only while this stays a private/testing app.
Before real users' accounts are at stake, this needs an actual
verification step (e.g. Supabase's built-in emailed OTP via
`resetPasswordForEmail` + `verifyOtp`).

Given that tradeoff, the flow needs two more pieces beyond `profiles`,
because a client can never be allowed to look up an arbitrary user by
email or overwrite their password directly — those are privileged
operations gated behind the `service_role` key, which must never ship
inside the app.

### 1. `public.check_email_exists` — lets the app check step 1

```sql
create or replace function public.check_email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (select 1 from auth.users where lower(email) = lower(p_email));
$$;

grant execute on function public.check_email_exists(text) to anon, authenticated;
```

Returns only a boolean — never leaks any other account data. Safe to
expose to anonymous callers (same pattern as `check_signup_conflicts` in
the fitness-app reference).

### 2. `public.get_user_id_by_email` — internal, used only by the Edge Function

```sql
create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public, auth
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

grant execute on function public.get_user_id_by_email(text) to service_role;
```

Granted to `service_role` only — the app itself (using the anon key) can
never call this one, only the Edge Function below (which runs with the
service_role key).

### 3. `reset-password` Edge Function — the actual password change

Source: `supabase/functions/reset-password/index.ts`. Looks the user up
via `get_user_id_by_email`, then calls
`supabase.auth.admin.updateUserById(userId, { password })` — an
admin-only operation, hence why it can't run in the app itself.

Supabase automatically injects `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` as secrets into every Edge Function — nothing
to configure manually for those.

**Deploying it** (one-time, and again whenever `index.ts` changes) —
run these yourself; they need an interactive browser login the first time:

```bash
npm install -g supabase
supabase login
supabase link --project-ref oilpjjzezgvbdfspaqee
supabase functions deploy reset-password --no-verify-jwt
```

`--no-verify-jwt` is required — whoever calls this is mid "forgot
password" and isn't signed in yet, so there's no user JWT to verify.

## What's implemented

- ✅ Sign up (`SignUpScreen` → `AuthContext.signUp`) — creates the
  `auth.users` account, then inserts the `public.profiles` row.
- ✅ Sign in / sign out — `supabase.auth.signInWithPassword` /
  `supabase.auth.signOut`. Session persisted via `AsyncStorage`
  (`src/lib/supabaseClient.js`), restored automatically on app relaunch.
- ✅ Forgot Password (`ForgotPasswordScreen` → `checkEmailExists` +
  `resetPassword`) — see the security tradeoff above.
- ⛔ Admin-generated OTP invite codes for signup — `profiles.otp` column
  exists for this but nothing reads/writes it yet; a later feature.
- ⛔ Notes / theme preference in Supabase — staying local-only for now
  (free-tier row budget reserved for accounts).
