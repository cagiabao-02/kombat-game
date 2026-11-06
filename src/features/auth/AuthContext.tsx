'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  guestName: string;
  isLoading: boolean;
  authError: string | null;
  updateGuestName: (name: string) => Promise<void>;
  ensureUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_NAME_KEY = 'togame_guest_display_name';

function generateDefaultGuestName(userId?: string): string {
  const suffix = userId ? userId.slice(-4).toUpperCase() : Math.floor(1000 + Math.random() * 9000).toString();
  return `Khách #${suffix}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [guestName, setGuestName] = useState<string>('Khách');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper to ensure an authenticated user exists (or sign in anonymously on demand)
  const ensureUser = useCallback(async (): Promise<User | null> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setUser(currentSession.user);
        setSession(currentSession);
        return currentSession.user;
      }

      // Try signing in anonymously
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
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

        // Update user metadata in background
        supabase.auth.updateUser({
          data: { display_name: initialName },
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

    async function initAuth() {
      try {
        const savedName = typeof window !== 'undefined' ? localStorage.getItem(GUEST_NAME_KEY) : null;
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (existingSession?.user) {
          if (!isMounted) return;
          setSession(existingSession);
          setUser(existingSession.user);

          const metadataName = existingSession.user.user_metadata?.display_name;
          const finalName = savedName || metadataName || generateDefaultGuestName(existingSession.user.id);
          setGuestName(finalName);
        } else {
          // Attempt initial anonymous sign in
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
          if (anonError) {
            console.warn('Anonymous sign-in is disabled or pending setup in Supabase:', anonError.message);
            if (isMounted) {
              setAuthError(anonError.message);
              const fallbackName = savedName || generateDefaultGuestName();
              setGuestName(fallbackName);
            }
          } else if (anonData.user) {
            if (!isMounted) return;
            setSession(anonData.session);
            setUser(anonData.user);
            setAuthError(null);

            const initialName = savedName || generateDefaultGuestName(anonData.user.id);
            setGuestName(initialName);

            await supabase.auth.updateUser({
              data: { display_name: initialName },
            });
          }
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        if (isMounted) setAuthError(err?.message || 'Lỗi kết nối');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const metadataName = currentSession.user.user_metadata?.display_name;
        if (metadataName) {
          setGuestName(metadataName);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Update guest display name
  const updateGuestName = useCallback(async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setGuestName(trimmed);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_NAME_KEY, trimmed);
      }

      if (user) {
        await supabase.auth.updateUser({
          data: { display_name: trimmed },
        });
      }
    } catch (err) {
      console.error('Failed to update display name:', err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        guestName,
        isLoading,
        authError,
        updateGuestName,
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
