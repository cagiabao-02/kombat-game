'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_AVATAR, getValidAvatar } from './avatarConstants';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  guestName: string;
  avatar: string;
  isAnonymous: boolean;
  isLoading: boolean;
  authError: string | null;
  updateGuestName: (name: string) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  ensureUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_NAME_KEY = 'togame_guest_display_name';
const AVATAR_KEY = 'kombat_user_avatar';
const CHESS_STATS_KEY = 'kombat_chess_stats';

let supabasePromise: Promise<SupabaseClient<any, 'public', any>> | null = null;
async function getClient(): Promise<SupabaseClient<any, 'public', any>> {
  if (!supabasePromise) {
    supabasePromise = import('@/lib/supabase/client').then((mod) => mod.supabase);
  }
  return supabasePromise;
}

function syncCloudChessStats(cloudStats: any) {
  if (typeof window === 'undefined' || !cloudStats) return;
  try {
    const raw = localStorage.getItem(CHESS_STATS_KEY);
    const localStats = raw ? JSON.parse(raw) : null;
    if (!localStats || localStats.totalGames === 0 || ((cloudStats.lastUpdated || 0) > (localStats.lastUpdated || 0))) {
      localStorage.setItem(CHESS_STATS_KEY, JSON.stringify(cloudStats));
    }
  } catch {}
}

function generateDefaultGuestName(userId?: string): string {
  const suffix = userId ? userId.slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000).toString();
  return `Khách #${suffix}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [guestName, setGuestName] = useState<string>('Khách');
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAnonymous = !user || Boolean(user.is_anonymous) || user.app_metadata?.provider === 'anonymous';

  // Helper to ensure an authenticated user exists (or sign in anonymously on demand)
  const ensureUser = useCallback(async (): Promise<User | null> => {
    try {
      const sb = await getClient();
      const { data: { session: currentSession } } = await sb.auth.getSession();
      if (currentSession?.user) {
        setUser(currentSession.user);
        setSession(currentSession);
        return currentSession.user;
      }

      // Try signing in anonymously
      const { data: anonData, error: anonError } = await sb.auth.signInAnonymously();
      if (anonError) {
        console.error('Anonymous sign-in error:', anonError);
        setAuthError(anonError.message);
        return null;
      }

      if (anonData.user) {
        setUser(anonData.user);
        setSession(anonData.session);
        setAuthError(null);

        const savedName = typeof window !== 'undefined' ? localStorage.getItem(GUEST_NAME_KEY) : null;
        const initialName = savedName || generateDefaultGuestName(anonData.user.id);
        setGuestName(initialName);

        const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem(AVATAR_KEY) : null;
        const initialAvatar = getValidAvatar(savedAvatar);
        setAvatar(initialAvatar);

        // Update user metadata in background
        sb.auth.updateUser({
          data: { display_name: initialName, avatar: initialAvatar },
        }).catch(() => {});

        return anonData.user;
      }
      return null;
    } catch (err: any) {
      console.error('ensureUser exception:', err);
      setAuthError(err?.message || 'Lỗi kết nối Supabase');
      return null;
    }
  }, []);

  // Initialize auth & session on mount
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    // 1. Phục hồi NGAY LẬP TỨC (0ms) từ LocalStorage để giao diện hiển thị tên & avatar tức thì
    try {
      const immediateName = localStorage.getItem(GUEST_NAME_KEY);
      const immediateAvatar = localStorage.getItem(AVATAR_KEY);
      if (immediateName) setGuestName(immediateName);
      if (immediateAvatar) setAvatar(getValidAvatar(immediateAvatar, true));
    } catch {}

    async function initAuth() {
      try {
        const sb = await getClient();
        if (!isMounted) return;

        const savedName = typeof window !== 'undefined' ? localStorage.getItem(GUEST_NAME_KEY) : null;
        const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem(AVATAR_KEY) : null;

        const { data: { session: existingSession } } = await sb.auth.getSession();

        if (existingSession?.user) {
          if (!isMounted) return;
          setSession(existingSession);
          setUser(existingSession.user);

          const metadataName = existingSession.user.user_metadata?.display_name;
          const finalName = savedName || metadataName || generateDefaultGuestName(existingSession.user.id);
          setGuestName(finalName);

          const metadataAvatar = existingSession.user.user_metadata?.avatar;
          const finalAvatar = getValidAvatar(savedAvatar || metadataAvatar);
          setAvatar(finalAvatar);

          const cloudStats = existingSession.user.user_metadata?.chess_stats;
          syncCloudChessStats(cloudStats);
        } else {
          // Attempt initial anonymous sign in
          const { data: anonData, error: anonError } = await sb.auth.signInAnonymously();
          if (anonError) {
            console.warn('Anonymous sign-in is disabled or pending setup in Supabase:', anonError.message);
            if (isMounted) {
              setAuthError(anonError.message);
              const fallbackName = savedName || generateDefaultGuestName();
              setGuestName(fallbackName);
              setAvatar(getValidAvatar(savedAvatar));
            }
          } else if (anonData.user) {
            if (!isMounted) return;
            setSession(anonData.session);
            setUser(anonData.user);
            setAuthError(null);

            const initialName = savedName || generateDefaultGuestName(anonData.user.id);
            const initialAvatar = getValidAvatar(savedAvatar);
            setGuestName(initialName);
            setAvatar(initialAvatar);

            await sb.auth.updateUser({
              data: { display_name: initialName, avatar: initialAvatar },
            });
          }
        }

        // Listen for auth state changes
        const { data: { subscription } } = sb.auth.onAuthStateChange((_event, currentSession) => {
          if (!isMounted) return;
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            const metadataName = currentSession.user.user_metadata?.display_name;
            if (metadataName) {
              setGuestName(metadataName);
            }
            const metadataAvatar = currentSession.user.user_metadata?.avatar;
            if (metadataAvatar) {
              setAvatar(getValidAvatar(metadataAvatar));
            }
            const cloudStats = currentSession.user.user_metadata?.chess_stats;
            syncCloudChessStats(cloudStats);
          }
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        if (isMounted) setAuthError(err?.message || 'Lỗi kết nối');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Update display name
  const updateGuestName = useCallback(async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setGuestName(trimmed);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_NAME_KEY, trimmed);
      }

      if (user) {
        // Đồng bộ lên Supabase Cloud trong nền (không làm nghẽn UI)
        getClient().then((sb) => {
          sb.auth.updateUser({
            data: { display_name: trimmed },
          }).catch((err) => console.error('Failed to sync display name to cloud:', err));
        });
      }
    } catch (err) {
      console.error('Failed to update display name:', err);
    }
  }, [user]);

  // Update avatar
  const updateAvatar = useCallback(async (newAvatar: string) => {
    const validAvatar = getValidAvatar(newAvatar, !isAnonymous);
    setAvatar(validAvatar);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AVATAR_KEY, validAvatar);
      }

      if (user) {
        // Đồng bộ lên Supabase Cloud trong nền (không làm nghẽn UI)
        getClient().then((sb) => {
          sb.auth.updateUser({
            data: { avatar: validAvatar },
          }).catch((err) => console.error('Failed to sync avatar to cloud:', err));
        });
      }
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  }, [user, isAnonymous]);

  // Sign in with email & password
  const signInWithEmail = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setAuthError(null);
      const sb = await getClient();
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const name = data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Player';
        const av = getValidAvatar(data.user.user_metadata?.avatar);
        setGuestName(name);
        setAvatar(av);
        if (typeof window !== 'undefined') {
          localStorage.setItem(GUEST_NAME_KEY, name);
          localStorage.setItem(AVATAR_KEY, av);
        }
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Đăng nhập thất bại' };
    }
  }, []);

  // Sign up with email & password (or upgrade current anonymous account)
  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setAuthError(null);
      const cleanEmail = email.trim();
      const sb = await getClient();

      // If user is currently anonymous, try upgrading the account directly
      if (user && isAnonymous) {
        const { data, error: updateError } = await sb.auth.updateUser({
          email: cleanEmail,
          password,
          data: {
            display_name: guestName,
            avatar,
          },
        });

        if (!updateError && data.user) {
          setUser(data.user);
          return {};
        }

        // If update failed because email is taken or not allowed, fallback to regular signUp
      }

      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: guestName,
            avatar,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || 'Đăng ký tài khoản thất bại' };
    }
  }, [user, isAnonymous, guestName, avatar]);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<{ error?: string }> => {
    try {
      setAuthError(null);
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const sb = await getClient();
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Đăng nhập Google thất bại' };
    }
  }, []);

  // Sign out (and immediately establish a new anonymous session for seamless play)
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const sb = await getClient();
      await sb.auth.signOut();
      setUser(null);
      setSession(null);

      // Re-sign in anonymously so game rooms continue working smoothly
      const { data: anonData } = await sb.auth.signInAnonymously();
      if (anonData?.user) {
        setUser(anonData.user);
        setSession(anonData.session);
        const defaultName = generateDefaultGuestName(anonData.user.id);
        setGuestName(defaultName);
        setAvatar(DEFAULT_AVATAR);
        if (typeof window !== 'undefined') {
          localStorage.setItem(GUEST_NAME_KEY, defaultName);
          localStorage.setItem(AVATAR_KEY, DEFAULT_AVATAR);
        }
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        guestName,
        avatar,
        isAnonymous,
        isLoading,
        authError,
        updateGuestName,
        updateAvatar,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        ensureUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
