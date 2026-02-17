/**
 * Converts MP3 buffer to WAV: 48000 Hz, mono, 16-bit PCM.
 * Uses ffmpeg (must be on PATH). Fully buffers output before resolving.
 */

import { spawn } from "child_process";

const TARGET_SAMPLE_RATE = 48000;
const TARGET_CHANNELS = 1;
const TARGET_CODEC = "pcm_s16le";

export async function convertMp3ToWav(mp3Buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const args = [
      "-nostdin",
      "-i", "pipe:0",
      "-acodec", TARGET_CODEC,
      "-ar", String(TARGET_SAMPLE_RATE),
      "-ac", String(TARGET_CHANNELS),
      "-f", "wav",
      "pipe:1",
    ];

    const proc = spawn("ffmpeg", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const chunks: Buffer[] = [];
    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.stdout.on("end", () => {
      // Wait for process to exit before resolving
    });
    proc.stderr.on("data", (data: Buffer) => {
      // Log stderr for debugging (ffmpeg often writes progress to stderr)
      if (process.env.NODE_ENV !== "production") {
        const msg = data.toString().trim();
        if (msg && !msg.startsWith("frame=")) {
          console.debug("[ffmpeg]", msg);
        }
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`ffmpeg not available: ${err.message}. Install ffmpeg and ensure it is on PATH for 48kHz mono WAV output.`));
    });

    proc.on("close", (code, signal) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`ffmpeg exited with code ${code}. Ensure ffmpeg is installed and supports the requested format.`));
        return;
      }
      if (signal) {
        reject(new Error(`ffmpeg killed by signal ${signal}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });

    proc.stdin.on("error", (err) => {
      reject(err);
    });
    proc.stdin.write(mp3Buffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      proc.stdin.end();
    });
  });
}

export const WAV_SAMPLE_RATE = TARGET_SAMPLE_RATE;
export const WAV_CHANNELS = TARGET_CHANNELS;
