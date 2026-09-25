import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Backed by Supabase Auth + a `public.profiles` table (see SUPABASE.md).
// Session persistence, token refresh, etc. are all handled by the
// supabase-js client itself (see src/lib/supabaseClient.js) — this context
// just exposes the app-shaped actions (signUp/signIn/...) and keeps
// `user` in sync with whatever Supabase reports.
const AuthContext = createContext(null);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function mapAuthError(error) {
  if (!error) return 'Something went wrong. Please try again.';
  const msg = error.message || '';
  if (/already registered|already exists/i.test(msg)) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (/invalid login credentials/i.test(msg)) {
    return 'Incorrect email or password. Use "Forgot Password?" if you need to reset it.';
  }
  return msg || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const loadProfile = async (sessionUser) => {
      if (!sessionUser) {
        if (mountedRef.current) setUser(null);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', sessionUser.id)
        .single();
      if (!mountedRef.current) return;
      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        username: profile?.username || sessionUser.email.split('@')[0],
        role: profile?.role || 'normal',
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null).finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
    });

    return () => {
      mountedRef.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ username, email, password, adminCode }) => {
    // Signup is gated behind a code an admin generates and shares out of
    // band (see GenerateOtpScreen) — validated server-side via a SECURITY
    // DEFINER function since the app itself can't read any admin's row.
    const { data: codeValid, error: codeError } = await supabase.rpc('verify_admin_otp', {
      p_otp: String(adminCode || '').trim(),
    });
    if (codeError || !codeValid) {
      return { success: false, message: 'That admin code is invalid or has expired. Ask an admin for a new one.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { success: false, message: mapAuthError(error) };
    if (!data.session) {
      return {
        success: false,
        message:
          'Account created, but a confirmation email is required before it can be used. Ask the app owner to turn off "Confirm email" in Supabase, then try signing in.',
      };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username: username.trim() });
    if (profileError) {
      return { success: false, message: `Account created, but saving your profile failed: ${profileError.message}` };
    }

    // Don't leave the user signed in here — SignUpScreen sends them back to
    // Sign In on success, matching the rest of this app's flow.
    await supabase.auth.signOut();
    return { success: true };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { success: false, message: mapAuthError(error) };
    // `user` gets populated by the onAuthStateChange listener above.
    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Forgot-password, step 1: does an account exist for this email? Backed
  // by a SECURITY DEFINER SQL function (public.check_email_exists — see
  // SUPABASE.md) since auth.users isn't queryable directly from the app.
  //
  // NOTE — deliberate security tradeoff, by explicit request: this flow
  // has no proof-of-ownership step (no emailed code, nothing). Once an
  // email is confirmed to exist, the app lets it set a new password
  // outright. That means anyone who knows/guesses a user's email can take
  // over their account. Fine for a private/testing app; revisit before
  // real users' accounts are at stake.
  const checkEmailExists = async (email) => {
    const { data, error } = await supabase.rpc('check_email_exists', { p_email: normalizeEmail(email) });
    if (error) return false;
    return !!data;
  };

  // Forgot-password, step 2: the actual password change is privileged (it
  // has to look up an arbitrary user by email and overwrite their password
  // without them being signed in) so it runs server-side in the
  // `reset-password` Edge Function, which is the only place holding the
  // service_role key — never in this app. See supabase/functions/reset-password.
  const resetPassword = async (email, newPassword) => {
    const { data, error } = await supabase.functions.invoke('reset-password', {
      body: { email: normalizeEmail(email), newPassword },
    });
    if (error) return { success: false, message: error.message };
    if (!data?.success) return { success: false, message: data?.message || 'Could not reset password.' };
    return { success: true };
  };

  // --- Admin-only features (see SUPABASE.md) ---------------------------
  // Every one of these is backed by a SECURITY DEFINER SQL function that
  // re-checks the caller is actually an admin itself — the app never
  // relies on a broad "admins can read/write anything" RLS policy.

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.rpc('list_all_profiles');
    if (error) return { success: false, message: error.message, users: [] };
    return { success: true, users: data || [] };
  };

  const changeUserRole = async (userId, newRole) => {
    const { error } = await supabase.rpc('set_user_role', { p_user_id: userId, p_new_role: newRole });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  // Reads the signed-in admin's own otp/otp_generated_at — same across all
  // admins by design, and allowed under the normal "view own profile" RLS
  // policy, so this is a plain select, not an RPC.
  const fetchOtpState = async () => {
    if (!user) return { success: false, message: 'Not signed in.' };
    const { data, error } = await supabase
      .from('profiles')
      .select('otp, otp_generated_at')
      .eq('id', user.id)
      .single();
    if (error) return { success: false, message: error.message };
    return { success: true, otp: data.otp, generatedAt: data.otp_generated_at };
  };

  const generateAdminOtp = async () => {
    const { data, error } = await supabase.rpc('generate_admin_otp');
    if (error) return { success: false, message: error.message };
    return { success: true, otp: data };
  };

  const killAdminOtp = async () => {
    const { error } = await supabase.rpc('kill_admin_otp');
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      checkEmailExists,
      resetPassword,
      fetchAllUsers,
      changeUserRole,
      fetchOtpState,
      generateAdminOtp,
      killAdminOtp,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
