import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authClient, type AuthSession } from "./authClient";

type AuthContextValue = {
  session: AuthSession;
  user: AuthSession["user"];
  isAuthenticated: boolean;
  isLoading: boolean;
  provider: "supabase";
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signUp: (args: { name?: string; email: string; password: string }) => Promise<{ requiresConfirmation: boolean; session: AuthSession }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (args: { email: string; redirectTo?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let mounted = true;

    (async () => {
      try {
        const initial = await authClient.getSession();
        if (mounted) setSession(initial);
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    unsub = authClient.onAuthStateChange((_event, next) => {
      setSession(next);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      unsub?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      provider: "supabase",
      signIn: (args) => authClient.signInWithPassword(args),
      signUp: (args) => authClient.signUp(args),
      signInWithGoogle: () => authClient.signInWithGoogle(),
      signOut: () => authClient.signOut(),
      resetPassword: (args) => authClient.resetPassword(args),
    };
  }, [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider />");
  }
  return ctx;
}

