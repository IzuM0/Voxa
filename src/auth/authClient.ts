import { type Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string | null;
  name?: string | null;
};

export type AuthSession = {
  user: AuthUser;
} | null;

export type AuthChangeEvent =
  | "INITIAL_SESSION"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

type Unsubscribe = () => void;

type AuthClient = {
  isConfigured: boolean;
  getSession: () => Promise<AuthSession>;
  onAuthStateChange: (cb: (event: AuthChangeEvent, session: AuthSession) => void) => Unsubscribe;
  signInWithPassword: (args: { email: string; password: string }) => Promise<void>;
  signUp: (args: { email: string; password: string; name?: string }) => Promise<{ requiresConfirmation: boolean; session: AuthSession }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (args: { email: string; redirectTo?: string }) => Promise<void>;
};

// Access Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate Supabase configuration - REQUIRED
// Accept both standard anon keys (eyJ...) and publishable keys (sb_publishable_...)
const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey.trim() !== "" &&
  supabaseUrl.startsWith("https://") &&
  supabaseUrl.includes(".supabase.co") &&
  (supabaseAnonKey.startsWith("eyJ") || supabaseAnonKey.startsWith("sb_publishable_"))
);

// Throw error if Supabase is not configured
if (!isSupabaseConfigured) {
  // Debug info
  console.error("[Auth] Configuration Check:", {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseAnonKey),
    urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "missing",
    keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "missing",
  });

  const errorMessage = `
⚠️ Supabase authentication is required but not configured!

Please set the following environment variables in your .env file:
- VITE_SUPABASE_URL=https://your-project.supabase.co
- VITE_SUPABASE_ANON_KEY=your-anon-key

Get these values from your Supabase dashboard:
1. Go to: Settings → API
2. Copy "Project URL" → VITE_SUPABASE_URL
3. Copy "anon public" key (starts with eyJ...) → VITE_SUPABASE_ANON_KEY
   Note: Use the "anon public" key, NOT the "publishable" key

⚠️ After updating .env, restart your dev server!
  `.trim();
  
  console.error("[Auth] Configuration Error:", errorMessage);
  
  // In development, show toast notification
  if (import.meta.env.DEV) {
    // Import toast dynamically to avoid circular dependencies
    import("sonner").then(({ toast }) => {
      toast.error("Authentication Configuration Error", {
        description: errorMessage,
        duration: 10000, // Show for 10 seconds
      });
    }).catch(() => {
      // Fallback: log to console if toast is not available
      console.error("[Auth] Toast not available, error logged above");
    });
  }
}

// Get shared Supabase client instance
let supabase: ReturnType<typeof getSupabaseClient> | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = getSupabaseClient();
    if (process.env.NODE_ENV === "development") {
      console.log("[Auth] Supabase client initialized successfully");
    }
  } catch (err) {
    console.error("[Auth] Failed to initialize Supabase client:", err);
    throw new Error("Failed to initialize Supabase authentication. Please check your configuration.");
  }
} else {
  throw new Error("Supabase authentication is required but not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

function mapSupabaseSession(session: Session | null): AuthSession {
  if (!session?.user) return null;
  const name =
    (session.user.user_metadata as any)?.name ??
    (session.user.user_metadata as any)?.full_name ??
    null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
      name,
    },
  };
}

// Helper to catch network errors and provide helpful diagnostics
function handleSupabaseError(error: unknown, operation: string): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for network/fetch errors
  if (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError") ||
    errorMessage.includes("Network request failed") ||
    (error instanceof TypeError && errorMessage.includes("fetch"))
  ) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const helpfulMessage = `
Unable to connect to Supabase (${operation}).

Common causes:
1. Your Supabase project may be paused (free tier pauses after inactivity)
   → Go to https://supabase.com/dashboard and check if your project is active
   → If paused, click "Restore project" to resume

2. Network connectivity issue
   → Check your internet connection
   → Try refreshing the page

3. Incorrect Supabase URL
   → Current URL: ${supabaseUrl || "not set"}
   → Verify in Supabase dashboard: Settings → API → Project URL

4. CORS or firewall blocking requests
   → Check browser console for CORS errors
   → Try disabling browser extensions or firewall temporarily

If the issue persists, check your Supabase project status at:
https://supabase.com/dashboard/project/${supabaseUrl?.replace("https://", "").replace(".supabase.co", "") || "your-project"}
    `.trim();
    
    throw new Error(helpfulMessage);
  }
  
  // Re-throw other errors as-is
  throw error;
}

// Supabase-backed implementation (REQUIRED)
const supabaseClient: AuthClient = {
  isConfigured: true,
  async getSession() {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return mapSupabaseSession(data.session);
    } catch (error) {
      handleSupabaseError(error, "getting session");
    }
  },
  onAuthStateChange(cb) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      cb(event as AuthChangeEvent, mapSupabaseSession(session));
    });
    return () => data.subscription.unsubscribe();
  },
  async signInWithPassword({ email, password }) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Provide more helpful error messages
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials or sign up if you don't have an account.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please check your email and confirm your account before signing in.");
        }
        throw error;
      }
      // Session is automatically set by Supabase client
    } catch (error) {
      handleSupabaseError(error, "signing in");
    }
  },
  async signUp({ email, password, name }) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: name ? { data: { name } } : undefined,
      });
      if (error) throw error;
      // Return whether email confirmation is required
      // If session exists, user is auto-confirmed. Otherwise, confirmation email was sent.
      return {
        requiresConfirmation: !data.session,
        session: data.session ? mapSupabaseSession(data.session) : null,
      };
    } catch (error) {
      handleSupabaseError(error, "signing up");
    }
  },
  async signInWithGoogle() {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, "signing in with Google");
    }
  },
  async signOut() {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, "signing out");
    }
  },
  async resetPassword({ email, redirectTo }) {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo ?? window.location.origin,
      });
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, "resetting password");
    }
  },
};

export const authClient: AuthClient = supabaseClient;
export const authProviderName = "supabase";
