export type TTSSpeakRequest = {
  voice: string;
  input: string;
  language?: string;
  speed?: number;
  pitch?: number;
  meeting_id?: string | null; // Optional: link TTS to a meeting
};

const API_BASE_URL =
  // Use an explicit API base when configured (e.g. http://localhost:4000 in development),
  // otherwise fall back to same-origin (frontend and backend behind the same host).
  import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Read the streamed TTS response from the backend and accumulate it into
 * a single audio buffer that can be played via an <audio> element.
 *
 * This function does not use MediaSource – it keeps the logic simple and
 * MVP-friendly by buffering the audio in memory before playback, while
 * still consuming the HTTP response as a stream (fetch().body).
 */
/**
 * Get the current JWT access token from Supabase (if available)
 */
async function getAccessToken(): Promise<string | null> {
  try {
    // Use shared Supabase client instance
    const { getSupabaseClientOrNull } = await import("./supabase/client");
    const supabase = getSupabaseClientOrNull();
    
    if (!supabase) {
      return null;
    }

    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function fetchTtsAudioBuffer(
  request: TTSSpeakRequest,
  signal?: AbortSignal
): Promise<Uint8Array> {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const url = `${base}/api/tts/stream`;

  // Get auth token if available
  const token = await getAccessToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: request.input,
      voice: request.voice,
      language: request.language,
      speed: request.speed,
      pitch: request.pitch,
      meeting_id: request.meeting_id || null,
    }),
    signal,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    
    // Handle rate limiting (429) specifically
    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      let message = "Too many requests. Please wait a moment and try again.";
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        const minutes = Math.ceil(seconds / 60);
        message = `Rate limit exceeded. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`;
      }
      
      // Try to get more details from response body
      if (contentType.includes("application/json")) {
        try {
          const errBody = await res.json().catch(() => ({})) as { error?: string; message?: string; details?: string };
          if (errBody.error || errBody.message) {
            message = errBody.error || errBody.message || message;
          }
        } catch {
          // Use default message
        }
      }
      
      const error = new Error(message) as Error & { statusCode?: number; retryAfter?: string };
      error.statusCode = 429;
      error.retryAfter = retryAfter || undefined;
      throw error;
    }
    
    if (contentType.includes("application/json")) {
      const errBody = await res.json().catch(() => ({})) as { error?: string; message?: string; details?: string };
      
      // Prefer error field, then message, then details
      let message = errBody.error || errBody.message || `TTS failed (${res.status})`;
      
      // If details exists and is different from message, append it
      if (errBody.details && errBody.details !== message) {
        // Try to parse details as JSON (OpenAI error format)
        try {
          const parsed = JSON.parse(errBody.details) as { error?: { message?: string } };
          if (parsed?.error?.message) {
            message = parsed.error.message;
          }
        } catch {
          // If not JSON, use details directly if it's short enough
          if (errBody.details.length < 200) {
            message = errBody.details;
          } else {
            // If too long, use the first part
            message = errBody.details.substring(0, 200);
          }
        }
      }
      
      const error = new Error(message) as Error & { statusCode?: number };
      error.statusCode = res.status;
      throw error;
    }
    const text = await res.text().catch(() => "");
    const error = new Error(text || `TTS failed (${res.status})`) as Error & { statusCode?: number };
    error.statusCode = res.status;
    throw error;
  }

  if (!res.body) {
    throw new Error("TTS response missing body.");
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value && value.byteLength) {
      chunks.push(value);
      totalLength += value.byteLength;
    }
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}

/** Expected TTS format from backend (Phase 1: 48kHz mono WAV) */
export const TTS_AUDIO_FORMAT = {
  mimeType: "audio/wav" as const,
  sampleRate: 48000,
  channels: 1,
} as const;

