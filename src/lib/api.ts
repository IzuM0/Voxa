/**
 * API Client for Voxa Backend
 * Handles authenticated requests to the backend API
 */

import { getSupabaseClientOrNull } from "./supabase/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Get shared Supabase client instance for getting JWT tokens
const supabaseClient = getSupabaseClientOrNull();

/**
 * Get the current JWT access token from Supabase
 */
async function getAccessToken(): Promise<string | null> {
  if (!supabaseClient) {
    throw new Error("Supabase client not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  try {
    const { data } = await supabaseClient.auth.getSession();
    return data.session?.access_token || null;
  } catch (err) {
    console.error("Failed to get access token:", err);
    throw err;
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `Request failed with status ${response.status}`,
    }));
    throw new Error(error.error || error.message || "API request failed");
  }

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ============================================================================
// Meetings API
// ============================================================================

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  platform: "google-meet" | "zoom" | "microsoft-teams" | "other";
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration: number | null;
  status: "scheduled" | "active" | "completed" | "cancelled";
  meeting_url: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingInput {
  title: string;
  platform: "google-meet" | "zoom" | "microsoft-teams" | "other";
  scheduled_at?: string | null;
  meeting_url?: string | null;
  language?: string | null;
}

export interface UpdateMeetingInput {
  title?: string;
  platform?: "google-meet" | "zoom" | "microsoft-teams" | "other";
  scheduled_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration?: number | null;
  status?: "scheduled" | "active" | "completed" | "cancelled";
  meeting_url?: string | null;
  language?: string | null;
}

export const meetingsApi = {
  list: async (params?: { status?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const query = queryParams.toString();
    return apiRequest<Meeting[]>(`/api/meetings${query ? `?${query}` : ""}`);
  },

  get: async (id: string) => {
    return apiRequest<Meeting>(`/api/meetings/${id}`);
  },

  create: async (input: CreateMeetingInput) => {
    return apiRequest<Meeting>("/api/meetings", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update: async (id: string, input: UpdateMeetingInput) => {
    return apiRequest<Meeting>(`/api/meetings/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/api/meetings/${id}`, {
      method: "DELETE",
    });
  },

  getTtsLogs: async (id: string) => {
    return apiRequest<any[]>(`/api/meetings/${id}/tts-logs`);
  },
};

// ============================================================================
// TTS Messages API
// ============================================================================

export interface TTSMessage {
  id: string;
  user_id: string;
  meeting_id: string | null;
  text_input: string;
  text_length: number;
  voice_used: string;
  language: string | null;
  speed: number;
  pitch: number;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  created_at: string;
  meeting_title?: string | null;
}

export interface CreateTTSMessageInput {
  meeting_id?: string | null;
  text_input: string;
  voice_used?: string;
  language?: string | null;
  speed?: number;
  pitch?: number;
}

export const ttsApi = {
  list: async (params?: {
    meeting_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.meeting_id) queryParams.append("meeting_id", params.meeting_id);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const query = queryParams.toString();
    return apiRequest<TTSMessage[]>(`/api/tts/messages${query ? `?${query}` : ""}`);
  },

  get: async (id: string) => {
    return apiRequest<TTSMessage>(`/api/tts/messages/${id}`);
  },

  create: async (input: CreateTTSMessageInput) => {
    return apiRequest<TTSMessage>("/api/tts/messages", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateStatus: async (id: string, status: "pending" | "sent" | "failed", error_message?: string) => {
    return apiRequest<TTSMessage>(`/api/tts/messages/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, error_message }),
    });
  },
};

// ============================================================================
// User Settings API
// ============================================================================

export interface UserSettings {
  user_id: string;
  preferred_voice: string;
  default_speed: number;
  default_pitch: number;
  default_language: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsInput {
  preferred_voice?: string;
  default_speed?: number;
  default_pitch?: number;
  default_language?: string;
}

export const settingsApi = {
  get: async () => {
    return apiRequest<UserSettings>("/api/settings");
  },

  update: async (input: UpdateUserSettingsInput) => {
    return apiRequest<UserSettings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
};

// ============================================================================
// Analytics API
// ============================================================================

export interface UsageStats {
  total_meetings: number;
  total_tts_messages: number;
  total_characters: number;
  total_duration_seconds: number;
  average_meeting_duration_seconds: number;
}

export interface PlatformStats {
  platform: string;
  count: number;
  percentage: number;
}

export interface VoiceStats {
  voice: string;
  count: number;
}

export interface MonthlyUsage {
  month: string;
  meetings: number;
  characters: number;
}

export interface DailyActivity {
  day: string;
  messages: number;
}

export const analyticsApi = {
  getStats: async () => {
    return apiRequest<UsageStats>("/api/analytics/stats");
  },

  getPlatforms: async () => {
    return apiRequest<PlatformStats[]>("/api/analytics/platforms");
  },

  getVoices: async () => {
    return apiRequest<VoiceStats[]>("/api/analytics/voices");
  },

  getMonthly: async (months?: number) => {
    const query = months ? `?months=${months}` : "";
    return apiRequest<MonthlyUsage[]>(`/api/analytics/monthly${query}`);
  },

  getDailyActivity: async () => {
    return apiRequest<DailyActivity[]>("/api/analytics/daily-activity");
  },
};

// ============================================================================
// User Profile API
// ============================================================================

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileInput {
  display_name?: string;
  avatar_url?: string | null;
}

export const userApi = {
  getProfile: async () => {
    return apiRequest<UserProfile>("/api/user/profile");
  },

  updateProfile: async (input: UpdateUserProfileInput) => {
    return apiRequest<UserProfile>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  deleteAccount: async () => {
    return apiRequest<null>("/api/user", {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Health Check
// ============================================================================

export const healthApi = {
  check: async () => {
    return apiRequest<{ status: string; database: string; migrations?: string }>(
      "/api/health"
    );
  },
};
