import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// There is no backend yet. All accounts and session state live only on this
// device, in AsyncStorage. This is fine for local testing but is NOT secure
// storage (passwords are kept in plain text) — replace with a real backend
// + hashed passwords before shipping to real users. See README.md.
const USERS_KEY = '@worship_users';
const SESSION_KEY = '@worship_session';

const AuthContext = createContext(null);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sessionEmail, usersRaw] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(USERS_KEY),
        ]);
        if (sessionEmail) {
          const users = usersRaw ? JSON.parse(usersRaw) : {};
          const existing = users[sessionEmail];
          if (existing) {
            setUser({ username: existing.username, email: existing.email });
          }
        }
      } catch (e) {
        // If storage is corrupted for any reason, fail safe to logged-out.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getUsers = async () => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  };

  // Creates a new account, or overwrites an existing one with the same
  // email (rare in practice now that there's a dedicated resetPassword
  // below for the Forgot Password flow).
  const signUp = async ({ username, email, password }) => {
    const key = normalizeEmail(email);
    const users = await getUsers();
    users[key] = { username: username.trim(), email: key, password };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  };

  const signIn = async (email, password) => {
    const key = normalizeEmail(email);
    const users = await getUsers();
    const existing = users[key];
    if (!existing || existing.password !== password) {
      return { success: false, message: 'Incorrect email or password. Use "Forgot Password?" if you need to reset it.' };
    }
    await AsyncStorage.setItem(SESSION_KEY, key);
    setUser({ username: existing.username, email: existing.email });
    return { success: true };
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  // Forgot-password flow: confirm the email is a real account before
  // letting the Forgot Password screen reveal the new-password fields.
  const checkEmailExists = async (email) => {
    const key = normalizeEmail(email);
    const users = await getUsers();
    return !!users[key];
  };

  const resetPassword = async (email, newPassword) => {
    const key = normalizeEmail(email);
    const users = await getUsers();
    const existing = users[key];
    if (!existing) {
      return { success: false, message: 'No account found with that email.' };
    }
    users[key] = { ...existing, password: newPassword };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
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
