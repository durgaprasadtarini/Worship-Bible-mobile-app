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
- `otp`: the admin signup-invite code (see "Admin features" below). Add the
  companion timestamp column if you haven't yet:
  ```sql
  alter table public.profiles add column if not exists otp_generated_at timestamptz;
  ```

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

## Admin features: user management + signup invite codes

Every signup now requires an "admin code" instead of the old visual
captcha — an admin generates a 6-digit code (`GenerateOtpScreen`) and
shares it out of band (verbally, WhatsApp, however); a new user types it
into `SignUpScreen` alongside their username/email/password.

All of this is one more `is_admin()` privileged-function away from the
Forgot Password pattern above — the app never gets a broad
"admins can read/write anything" RLS policy; instead every cross-user
action is its own SECURITY DEFINER function that re-checks the caller is
actually an admin.

```sql
-- Caller-is-admin check, reused by every function below.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Users screen: list everyone, alphabetically.
create or replace function public.list_all_profiles()
returns table (id uuid, username text, role text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can list users.';
  end if;
  return query
    select p.id, p.username, p.role, p.created_at
    from public.profiles p
    order by p.username asc;
end;
$$;

grant execute on function public.list_all_profiles() to authenticated;

-- Users screen: change someone's account type.
create or replace function public.set_user_role(p_user_id uuid, p_new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change user roles.';
  end if;
  if p_new_role not in ('normal', 'admin') then
    raise exception 'Invalid role.';
  end if;
  update public.profiles set role = p_new_role, updated_at = now() where id = p_user_id;
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;

-- Generate Signup Code screen: makes one code, pushed to every admin row
-- at once (so "any admin generates it, all admins see the same code").
create or replace function public.generate_admin_otp()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can generate signup codes.';
  end if;
  v_code := lpad(floor(random() * 1000000)::text, 6, '0');
  update public.profiles
  set otp = v_code, otp_generated_at = now()
  where role = 'admin';
  return v_code;
end;
$$;

grant execute on function public.generate_admin_otp() to authenticated;

-- "Kill Code" button — clears it early for every admin.
create or replace function public.kill_admin_otp()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can clear signup codes.';
  end if;
  update public.profiles set otp = null, otp_generated_at = null where role = 'admin';
end;
$$;

grant execute on function public.kill_admin_otp() to authenticated;

-- Called from SignUpScreen, before the account is even created. Callable
-- by anon since the person signing up isn't authenticated yet.
create or replace function public.verify_admin_otp(p_otp text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where role = 'admin'
      and otp = trim(p_otp)
      and otp_generated_at > now() - interval '5 minutes'
  );
$$;

grant execute on function public.verify_admin_otp(text) to anon, authenticated;
```

**The validity window appears in three places, and must match across all
three:** `verify_admin_otp` above (server-side, the one that actually
matters), the pg_cron job below (server-side cleanup), and
`OTP_VALIDITY_MINUTES` in `src/screens/GenerateOtpScreen.js` (client-side
countdown display only). Currently **5 minutes** everywhere. To change it
again, update all three (search for `interval '5 minutes'` in SQL,
`OTP_VALIDITY_MINUTES` in the app) — if the SQL side changes but the app
constant doesn't, the on-screen countdown will just be wrong, nothing
breaks; if the two SQL functions disagree with each other, codes could
expire inconsistently between signup and cleanup.

### Auto-expiring the code server-side (works even with the app fully closed)

A mobile app can't reliably run a background timer — it might be killed,
backgrounded, or offline. The only place that can guarantee "this code
stops working after 5 minutes, no matter what" is Postgres itself, via
the `pg_cron` extension:

```sql
create extension if not exists pg_cron;

select cron.schedule(
  'clear-expired-admin-otp',
  '* * * * *',  -- every minute
  $$
    update public.profiles
    set otp = null, otp_generated_at = null
    where role = 'admin'
      and otp is not null
      and otp_generated_at < now() - interval '5 minutes';
  $$
);
```

To change the interval on an already-scheduled job, unschedule it first:
`select cron.unschedule('clear-expired-admin-otp');` then re-run the
`cron.schedule(...)` call above with the new interval.

If `create extension pg_cron` errors, enable it first via **Supabase
dashboard → Database → Extensions → search "pg_cron" → Enable**, then
re-run the `cron.schedule(...)` call. `GenerateOtpScreen`'s own countdown
is a client-side display only — the code is *actually* dead the moment
this job (or `verify_admin_otp`'s own freshness check) says so, independent
of whether anyone has the app open.

### Promoting the first admin

New signups are always `role = 'normal'` — there's no in-app way to create
the very first admin (correctly so; otherwise anyone could make themselves
one). Do it by hand once, in SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<uuid-from-auth.users>';
```

After that, admins can promote/demote anyone else from the Users screen.

## What's implemented

- ✅ Sign up (`SignUpScreen` → `AuthContext.signUp`) — validates the admin
  code first (`verify_admin_otp`), then creates the `auth.users` account
  and inserts the `public.profiles` row (always `role: 'normal'`).
- ✅ Sign in / sign out — `supabase.auth.signInWithPassword` /
  `supabase.auth.signOut`. Session persisted via `AsyncStorage`
  (`src/lib/supabaseClient.js`), restored automatically on app relaunch.
- ✅ Forgot Password (`ForgotPasswordScreen` → `checkEmailExists` +
  `resetPassword`) — see the security tradeoff above.
- ✅ Admin: Users list + change account type (`UsersListScreen`), visible
  only when `user.role === 'admin'` on the Me tab.
- ✅ Admin: Generate/Regenerate/Kill signup code (`GenerateOtpScreen`),
  same visibility rule, auto-expires via pg_cron.
- ⛔ Notes / theme preference in Supabase — staying local-only for now
  (free-tier row budget reserved for accounts).
