import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { initializeDatabase, getPool, queryOne } from "./db/index";
import { optionalAuth, AuthenticatedRequest } from "./middleware/auth";
import { ttsRateLimiter, apiRateLimiter } from "./middleware/rateLimit";
import meetingsRouter from "./routes/meetings";
import ttsRouter from "./routes/tts";
import settingsRouter from "./routes/settings";
import analyticsRouter from "./routes/analytics";
import userRouter from "./routes/user";
import { convertMp3ToWav } from "./audio/convertToWav";

// Load server/.env from server directory (works whether run from repo root or server/)
dotenv.config({ path: path.join(__dirname, "..", ".env") });
if (process.env.DATABASE_URL) {
  console.log("📂 DATABASE_URL loaded");
} else {
  console.warn("⚠️  DATABASE_URL not set — add it to server/.env to enable database");
}
if (process.env.OPENAI_API_KEY) {
    console.log("🔑 OPENAI_API_KEY loaded — TTS is enabled");
  } else {
    console.warn("⚠️  OPENAI_API_KEY not set — add it to server/.env to enable text-to-speech");
  }
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (supabaseUrl) {
  console.log("🔐 SUPABASE_URL loaded — JWT verification enabled");
} else {
  console.warn("⚠️  SUPABASE_URL not set — JWT verification will fail. Add VITE_SUPABASE_URL or SUPABASE_URL to server/.env");
}

// Log rate limiting configuration
const ttsRateLimitMax = process.env.TTS_RATE_LIMIT_MAX 
  ? parseInt(process.env.TTS_RATE_LIMIT_MAX, 10) 
  : (process.env.NODE_ENV === 'production' ? 10 : 50);
const ttsRateLimitWindow = process.env.TTS_RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.TTS_RATE_LIMIT_WINDOW_MS, 10) / 60000
  : 15;
if (process.env.DISABLE_RATE_LIMIT === 'true' && process.env.NODE_ENV !== 'production') {
  console.log("⚠️  Rate limiting DISABLED (development mode)");
} else {
  console.log(`🚦 Rate limiting: ${ttsRateLimitMax} TTS requests per ${ttsRateLimitWindow} minutes`);
}

const app = express();
const port = process.env.PORT || 4000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://*.supabase.co"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

// CORS configuration - allow frontend origin
const frontendUrl = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Apply general API rate limiting
app.use("/api", apiRateLimiter);

// Apply optional auth to all routes (extracts user info if token present)
app.use(optionalAuth);

// Initialize database connection and run migrations
let dbInitialized = false;
initializeDatabase()
  .then(() => {
    dbInitialized = true;
    console.log("✅ Database ready");
  })
  .catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("⚠️  Database initialization failed:", message);
    console.log("⚠️  Server will continue without database features");
  });

type TtsMessageStatus = "pending" | "sent" | "failed";

// In-memory status tracking for this process (MVP – not persisted).
const ttsMessageStatus = new Map<string, TtsMessageStatus>();

const MAX_TTS_CHARS = 500;

/**
 * POST /api/tts/stream
 *
 * Proxies text to the OpenAI TTS API and streams the resulting audio
 * (as MP3 bytes) directly to the client using HTTP chunked transfer.
 * 
 * Protected by rate limiting: 10 requests per 15 minutes per user
 */
app.post("/api/tts/stream", ttsRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  const { text, voice, language, speed, pitch, meeting_id } = req.body ?? {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Text is required." });
  }

  if (text.length > MAX_TTS_CHARS) {
    return res.status(400).json({
      error: `Text is too long. Maximum allowed length is ${MAX_TTS_CHARS} characters.`,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
  }

  const messageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  ttsMessageStatus.set(messageId, "pending");

  // Log TTS message to database if user is authenticated and database is available
  let dbMessageId: string | null = null;
  if (req.userId) {
    try {
      const pool = getPool();
      if (pool) {
        // If meeting_id is provided, verify it belongs to user
        if (meeting_id) {
          const meeting = await queryOne(
            "SELECT id FROM meetings WHERE id = $1 AND user_id = $2",
            [meeting_id, req.userId]
          );
          if (!meeting) {
            // Don't fail the request, just log without meeting_id
            console.warn(`Meeting ${meeting_id} not found for user ${req.userId}`);
          }
        }

        const result = await queryOne<{ id: string }>(
          `INSERT INTO tts_messages (
            user_id, meeting_id, text_input, text_length, voice_used, language, speed, pitch, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id`,
          [
            req.userId,
            meeting_id || null,
            text,
            text.length,
            voice || "alloy",
            language || null,
            speed || 1.0,
            pitch || 1.0,
            "pending",
          ]
        );
        dbMessageId = result?.id ?? null;
      }
    } catch (dbErr: any) {
      // Don't fail the TTS request if DB logging fails
      console.error("Failed to log TTS message to database:", dbErr.message);
    }
  }

  try {
    const instructionsParts: string[] = [];
    if (language) instructionsParts.push(`Speak in ${language}.`);
    if (typeof pitch === "number") {
      instructionsParts.push(`Use a pitch of ${pitch.toFixed(1)}x (best-effort).`);
    }

    // Speed: use native API parameter (0.25–4.0) when available for reliable control
    const speedNum = typeof speed === "number" ? speed : 1.0;
    const clampedSpeed = Math.min(4, Math.max(0.25, speedNum));

    // Call OpenAI Audio Speech API. The response body is a readable stream
    // that we will forward to the client without buffering to disk.
    const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: voice || "alloy",
        input: text,
        response_format: "mp3",
        speed: clampedSpeed,
        ...(instructionsParts.length > 0 && { instructions: instructionsParts.join(" ") }),
      }),
    });

    if (!upstream.ok) {
      const textBody = await upstream.text().catch(() => "");
      let errorMessage = "TTS provider error";
      let errorDetails = textBody;
      
      // Try to parse OpenAI error response
      try {
        const errorJson = JSON.parse(textBody);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
          errorDetails = errorJson.error.message;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
          errorDetails = errorJson.message;
        }
      } catch {
        // If not JSON, use text body as error message
        if (textBody) {
          errorMessage = textBody.substring(0, 200);
          errorDetails = textBody;
        }
      }
      
      ttsMessageStatus.set(messageId, "failed");

      // Update database status if message was logged
      if (dbMessageId && req.userId) {
        try {
          const pool = getPool();
          if (pool) {
            await pool.query(
              "UPDATE tts_messages SET status = $1, error_message = $2 WHERE id = $3",
              ["failed", errorDetails.substring(0, 500), dbMessageId]
            );
          }
        } catch (dbErr) {
          // Ignore DB errors
        }
      }

      return res.status(upstream.status).json({
        error: errorMessage,
        details: errorDetails,
        statusCode: upstream.status,
      });
    }

    if (!upstream.body) {
      ttsMessageStatus.set(messageId, "failed");

      // Update database status if message was logged
      if (dbMessageId && req.userId) {
        try {
          const pool = getPool();
          if (pool) {
            await pool.query(
              "UPDATE tts_messages SET status = $1, error_message = $2 WHERE id = $3",
              ["failed", "TTS provider returned no audio stream", dbMessageId]
            );
          }
        } catch (dbErr) {
          // Ignore DB errors
        }
      }

      return res.status(502).json({ error: "TTS provider returned no audio stream." });
    }

    // Fully buffer MP3 from OpenAI (no streaming) for conversion to WAV
    const mp3Chunks: Buffer[] = [];
    for await (const chunk of upstream.body as any) {
      mp3Chunks.push(Buffer.from(chunk));
    }
    const mp3Buffer = Buffer.concat(mp3Chunks);

    let wavBuffer: Buffer;
    try {
      wavBuffer = await convertMp3ToWav(mp3Buffer);
    } catch (convErr: any) {
      ttsMessageStatus.set(messageId, "failed");
      if (dbMessageId && req.userId) {
        try {
          const pool = getPool();
          if (pool) {
            await pool.query(
              "UPDATE tts_messages SET status = $1, error_message = $2 WHERE id = $3",
              ["failed", convErr?.message?.substring(0, 500) ?? "Audio conversion failed", dbMessageId]
            );
          }
        } catch (dbErr) {
          // Ignore
        }
      }
      return res.status(503).json({
        error: "Audio conversion unavailable.",
        details: convErr?.message ?? "Install ffmpeg and ensure it is on PATH for 48kHz mono WAV output.",
      });
    }

    res.status(200);
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", String(wavBuffer.length));
    res.send(wavBuffer);

    ttsMessageStatus.set(messageId, "sent");
    if (dbMessageId && req.userId) {
      try {
        const pool = getPool();
        if (pool) {
          await pool.query("UPDATE tts_messages SET status = $1 WHERE id = $2", ["sent", dbMessageId]);
        }
      } catch (dbErr) {
        // Ignore
      }
    }
  } catch (err: any) {
    ttsMessageStatus.set(messageId, "failed");

    // Update database status if message was logged
    if (dbMessageId && req.userId) {
      try {
        const pool = getPool();
        if (pool) {
          await pool.query(
            "UPDATE tts_messages SET status = $1, error_message = $2 WHERE id = $3",
            ["failed", err?.message || "Unexpected error", dbMessageId]
          );
        }
      } catch (dbErr) {
        // Ignore DB errors
      }
    }

    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: err?.message ?? "Unexpected error while generating TTS audio." });
    }
    if (!res.writableEnded) {
      res.end();
    }
  }
});

// Simple health check
app.get("/api/health", async (_req, res) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(200).json({
        status: "ok",
        database: "not-configured",
      });
    }

    await pool.query("SELECT 1");
    return res.status(200).json({
      status: "ok",
      database: "connected",
      migrations: dbInitialized ? "ready" : "pending",
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      database: "error",
      message: err?.message ?? "Unknown database error",
    });
  }
});

// Register API routes
app.use("/api/meetings", meetingsRouter);
app.use("/api/tts", ttsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Voxa backend listening on http://localhost:${port}`);
});

