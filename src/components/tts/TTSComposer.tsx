import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import {
  Volume2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Settings2,
  Info,
} from "lucide-react";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { fetchTtsAudioBuffer, TTS_AUDIO_FORMAT } from "../../lib/tts";
import { settingsApi } from "../../lib/api";
import { ErrorBoundary } from "../ErrorBoundary";
import { QuickPhrases } from "./QuickPhrases";

interface TTSComposerProps {
  onSpeech?: (text: string, options: TTSOptions) => Promise<void>;
  maxCharacters?: number;
  disabled?: boolean;
  meetingId?: string; // Optional: link TTS messages to a meeting
}

interface TTSOptions {
  voice: string;
  language: string;
  speed: number;
  pitch: number;
}

type TTSState = "idle" | "generating" | "playing" | "success" | "error";

const ERROR_MESSAGES = {
  rateLimit: "⏱️ Slow down! Wait a moment before speaking again.",
  quotaExceeded: "📊 Daily limit reached. Upgrade or try tomorrow.",
  network: "🌐 Network issue. Check your connection.",
  ffmpeg: "🔧 Server setup issue. Contact support.",
  invalidText: "✏️ Please enter some text to speak.",
  default: "❌ Something went wrong. Please try again.",
} as const;

function getUserFriendlyError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Something went wrong.";
  const lower = raw.toLowerCase();

  if (
    (error as any)?.statusCode === 429 ||
    lower.includes("too many requests") ||
    lower.includes("rate limit")
  ) {
    return ERROR_MESSAGES.rateLimit;
  }
  if (
    lower.includes("insufficient_quota") ||
    lower.includes("exceeded your current quota") ||
    lower.includes("quota exceeded") ||
    lower.includes("daily limit")
  ) {
    return ERROR_MESSAGES.quotaExceeded;
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("connection") ||
    lower.includes("failed to fetch") ||
    ((error as any)?.name === "TypeError" && lower.includes("network"))
  ) {
    return ERROR_MESSAGES.network;
  }
  if (lower.includes("ffmpeg") || (lower.includes("invalid data") && lower.includes("decode"))) {
    return ERROR_MESSAGES.ffmpeg;
  }
  if (
    (lower.includes("empty") && (lower.includes("text") || lower.includes("input"))) ||
    lower.includes("please enter") ||
    lower.includes("text is required") ||
    lower.includes("input is required")
  ) {
    return ERROR_MESSAGES.invalidText;
  }
  return ERROR_MESSAGES.default;
}

export function TTSComposer({
  onSpeech,
  maxCharacters = 500,
  disabled = false,
  meetingId,
}: TTSComposerProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<TTSState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [language, setLanguage] = useState("en-US");
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved voice settings (preferred voice, speed, pitch) so composer uses user defaults
  useEffect(() => {
    let cancelled = false;
    settingsApi.get().then((settings) => {
      if (cancelled || !settings) return;
      const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
      if (settings.preferred_voice && validVoices.includes(settings.preferred_voice)) {
        setVoice(settings.preferred_voice);
      }
      const speedNum = Number(settings.default_speed);
      const pitchNum = Number(settings.default_pitch);
      if (Number.isFinite(speedNum) && speedNum >= 0.5 && speedNum <= 2) {
        setSpeed([speedNum]);
      }
      if (Number.isFinite(pitchNum) && pitchNum >= 0.5 && pitchNum <= 2) {
        setPitch([pitchNum]);
      }
      if (settings.default_language) {
        setLanguage(settings.default_language);
      }
    }).catch(() => {
      // Ignore: user may not be logged in or API unavailable; use built-in defaults
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Fetch audio output devices (only if API is available)
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      if (import.meta.env.DEV) {
        console.warn("Audio device enumeration not available in this browser/context");
      }
      return;
    }

    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // Filter to audiooutput devices and exclude any with empty deviceId
        const outputs = devices.filter((d) => d.kind === "audiooutput" && d.deviceId && d.deviceId.trim() !== "");
        setAudioDevices(outputs);
        if (outputs.length > 0) {
          // Default to 'default' or the first one (guaranteed to have non-empty deviceId)
          const defaultDevice = outputs.find(d => d.deviceId === "default")?.deviceId || outputs[0].deviceId;
          if (defaultDevice && defaultDevice.trim() !== "") {
            setSelectedAudioDevice((prev) => prev || defaultDevice);
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("Failed to list audio devices", msg);
        }
        // Don't crash - just leave devices empty
        setAudioDevices([]);
      }
    };

    fetchDevices();

    // Listen for device changes (only if addEventListener is available)
    try {
      navigator.mediaDevices.addEventListener("devicechange", fetchDevices);
      return () => {
        try {
          navigator.mediaDevices.removeEventListener("devicechange", fetchDevices);
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    } catch (e) {
      if (import.meta.env.DEV) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("Could not listen for device changes", msg);
      }
      return;
    }
  }, []);

  useEffect(() => {
    // Attach sink ID when selected device changes (if supported)
    if (!selectedAudioDevice) return;

    const audioEl = audioRef.current as any; // Cast to any because setSinkId is not in standard TS lib yet
    if (audioEl && typeof audioEl.setSinkId === "function") {
      audioEl.setSinkId(selectedAudioDevice).catch((err: any) => {
        if (import.meta.env.DEV) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("Could not set audio output device:", msg);
        }
      });
    }
  }, [selectedAudioDevice]);
  const abortRef = useRef<AbortController | null>(null);

  const characterCount = text.length;
  const isOverLimit = characterCount > maxCharacters;
  const characterPercentage = (characterCount / maxCharacters) * 100;

  const isDisabled = disabled || isOverLimit || text.trim().length === 0;
  const isProcessing = state === "generating" || state === "playing";

  // Keep progress in sync with actual audio playback.
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const update = () => {
      const d = audioEl.duration;
      const t = audioEl.currentTime;
      if (Number.isFinite(d) && d > 0) {
        setAudioProgress(Math.min(100, Math.max(0, (t / d) * 100)));
      } else {
        // Duration might be unknown while streaming. Show a gentle "in-progress" bar.
        setAudioProgress((p) => (state === "playing" ? (p >= 95 ? 10 : p + 1) : 0));
      }
    };

    audioEl.addEventListener("timeupdate", update);
    audioEl.addEventListener("progress", update);
    audioEl.addEventListener("loadedmetadata", update);
    audioEl.addEventListener("durationchange", update);

    return () => {
      audioEl.removeEventListener("timeupdate", update);
      audioEl.removeEventListener("progress", update);
      audioEl.removeEventListener("loadedmetadata", update);
      audioEl.removeEventListener("durationchange", update);
    };
  }, [state]);

  useEffect(() => {
    // Cleanup on unmount.
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      audioRef.current?.pause();
    };
  }, []);

  const handleGenerateAndPlay = async () => {
    if (isDisabled) return;

    setState("generating");
    setErrorMessage("");
    let objectUrl: string | null = null;

    try {
      if (onSpeech) {
        await onSpeech(text, {
          voice,
          language,
          speed: speed && speed.length > 0 ? speed[0] : 1.0,
          pitch: pitch && pitch.length > 0 ? pitch[0] : 1.0,
        });
      }

      const audioEl = audioRef.current;
      if (!audioEl) throw new Error("Audio output unavailable.");

      // Abort any previous stream / request.
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // 1) Request audio from the backend as a streamed response and accumulate
      //    the chunks into a single audio buffer in memory.
      const audioData = await fetchTtsAudioBuffer(
        {
          voice,
          input: text,
          language,
          speed: speed && speed.length > 0 ? speed[0] : 1.0,
          pitch: pitch && pitch.length > 0 ? pitch[0] : 1.0,
          meeting_id: meetingId || null, // Link TTS to meeting if provided
        },
        abortRef.current.signal
      );

      // 2) Blob as WAV (backend Phase 1: 48kHz mono 16-bit PCM)
      const blob = new Blob([audioData], { type: TTS_AUDIO_FORMAT.mimeType });
      objectUrl = URL.createObjectURL(blob);
      const loadStartTime = performance.now();

      // Debug: log blob size and expected format
      if (import.meta.env.DEV) {
        console.debug("[TTS Playback] blob size (bytes):", blob.size, "| format: ", TTS_AUDIO_FORMAT.sampleRate, "Hz,", TTS_AUDIO_FORMAT.channels, "ch");
      }

      audioEl.pause();
      audioEl.src = objectUrl;
      audioEl.volume = 0.8; // Prevent clipping into virtual cable / Meet
      audioEl.muted = false;
      audioEl.preload = "auto";
      audioEl.load();

      // setSinkId before playback (required for virtual audio cable)
      if (selectedAudioDevice && typeof (audioEl as any).setSinkId === "function") {
        try {
          await (audioEl as any).setSinkId(selectedAudioDevice);
          if (import.meta.env.DEV) {
            console.debug("[TTS Playback] sinkId:", selectedAudioDevice);
          }
        } catch (sinkErr) {
          if (import.meta.env.DEV) {
            const msg = sinkErr instanceof Error ? sinkErr.message : String(sinkErr);
            console.warn("Could not set audio output device before playback:", msg);
          }
        }
      }

      // 3) Wait for canplaythrough so audio is fully buffered (avoid buffer underruns)
      await new Promise<void>((resolve, reject) => {
        const onCanPlayThrough = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("Audio failed to load"));
        };
        const cleanup = () => {
          audioEl.removeEventListener("canplaythrough", onCanPlayThrough);
          audioEl.removeEventListener("error", onError);
        };
        if (audioEl.readyState >= 3) {
          resolve();
          return;
        }
        audioEl.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
        audioEl.addEventListener("error", onError, { once: true });
        setTimeout(() => {
          cleanup();
          if (audioEl.readyState >= 2) resolve();
          else reject(new Error("Audio loading timeout"));
        }, 5000);
      });

      // Reset playback position before starting
      audioEl.currentTime = 0;

      setState("playing");
      const playStartTime = performance.now();
      try {
        await audioEl.play();
        if (import.meta.env.DEV) {
          console.debug("[TTS Playback] load→play (ms):", Math.round(playStartTime - loadStartTime));
        }
      } catch (playErr: unknown) {
        const isNotAllowed = playErr instanceof Error && (playErr.name === "NotAllowedError" || (playErr as DOMException).name === "NotAllowedError");
        if (isNotAllowed) {
          setErrorMessage("Browser blocked audio. Click \"Generate & Speak\" again to play, or check your system/browser volume and output device below.");
        } else {
          throw playErr;
        }
        setState("error");
        return;
      }

      // 4) Wait for ended, pause, or error; clean up listeners and object URL
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          audioEl.removeEventListener("ended", onEnded);
          audioEl.removeEventListener("pause", onPause);
          audioEl.removeEventListener("error", onPlaybackError);
          abortRef.current?.signal.removeEventListener("abort", onAbort);
        };
        const onEnded = () => {
          cleanup();
          if (import.meta.env.DEV) {
            console.debug("[TTS Playback] load→ended (ms):", Math.round(performance.now() - loadStartTime));
          }
          resolve();
        };
        const onPause = () => {
          cleanup();
          resolve();
        };
        const onPlaybackError = () => {
          cleanup();
          reject(new Error("Audio playback error."));
        };
        const onAbort = () => {
          cleanup();
          reject(new DOMException("Aborted", "AbortError"));
        };

        abortRef.current?.signal.addEventListener("abort", onAbort, { once: true });
        audioEl.addEventListener("ended", onEnded, { once: true });
        audioEl.addEventListener("pause", onPause, { once: true });
        audioEl.addEventListener("error", onPlaybackError, { once: true });
      });

      setState("success");
      setTimeout(() => setState("idle"), 1500);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    } catch (error) {
      // AbortError is expected when user clicks Stop.
      if (error instanceof DOMException && error.name === "AbortError") {
        setState("idle");
        setAudioProgress(0);
        if (objectUrl != null) {
          try { URL.revokeObjectURL(objectUrl); } catch { /* ignore */ }
        }
        return;
      }
      setState("error");
      setErrorMessage(getUserFriendlyError(error));
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    setState("idle");
    setAudioProgress(0);
  };

  const getButtonContent = () => {
    switch (state) {
      case "generating":
        return (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating Voice...
          </>
        );
      case "playing":
        return (
          <>
            <Square className="size-4" />
            Stop Playing
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle2 className="size-4" />
            Speech Complete
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="size-4" />
            Failed
          </>
        );
      default:
        return (
          <>
            <Play className="size-4" />
            Generate & Speak
          </>
        );
    }
  };

  const getCharacterCountColor = () => {
    if (isOverLimit) return "text-red-600";
    if (characterPercentage > 80) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Hidden audio element used for real playback */}
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Status Banner */}
      {state === "playing" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Volume2 className="size-5 text-blue-600 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Playing TTS…
              </p>
              <p className="text-xs text-blue-700">
                Audio is playing on your device. Use your meeting tab (and mic selection) so others can hear.
              </p>
            </div>
          </div>
          <Progress value={audioProgress} className="h-1" />
        </div>
      )}

      {state === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-900">
                Speech generation failed
              </p>
              <p className="text-xs text-red-700 mt-1">
                {errorMessage.includes("platform.openai.com") ? (
                  <>
                    Your OpenAI account has no remaining quota. Add a payment method at{" "}
                    <a
                      href="https://platform.openai.com/account/billing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      platform.openai.com/account/billing
                    </a>{" "}
                    to use text-to-speech.
                  </>
                ) : (
                  errorMessage
                )}
              </p>
              <p className="text-xs text-red-600 mt-2">
                You can try again by clicking &quot;Generate &amp; Speak&quot; again.
              </p>
            </div>
          </div>
        </div>
      )}

      {state === "generating" && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 text-purple-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                Generating your voice...
              </p>
              <p className="text-xs text-purple-700">
                Processing with OpenAI text-to-speech
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Phrases */}
      <QuickPhrases
        onSelect={(phrase) => setText(phrase)}
        disabled={disabled || isProcessing}
      />

      {/* Main Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="tts-input" className="flex items-center gap-2">
            Type your message
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Type what you want to say and Voxa will convert it to
                  natural-sounding speech in real-time
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <span className={`text-xs font-medium ${getCharacterCountColor()}`}>
            {characterCount} / {maxCharacters}
          </span>
        </div>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            id="tts-input"
            placeholder="Start typing what you want to say... For example: 'Thank you everyone for joining this meeting. I'd like to share some updates on our project.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isProcessing}
            className={`min-h-[120px] resize-none ${isOverLimit ? "border-red-300 focus:border-red-500" : ""
              } ${isProcessing ? "opacity-60" : ""}`}
            maxLength={maxCharacters + 50} // Allow typing over to show error
          />
          {isOverLimit && (
            <p className="text-xs text-red-600 mt-1">
              Message exceeds character limit. Please shorten your text.
            </p>
          )}
        </div>
      </div>

      {/* Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">
            Voice
          </Label>
          <Select
            value={voice}
            onValueChange={setVoice}
            disabled={disabled || isProcessing}
          >
            <SelectTrigger id="voice-select" aria-label="Voice selection">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
              <SelectItem value="echo">Echo (Male)</SelectItem>
              <SelectItem value="fable">Fable (British Male)</SelectItem>
              <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
              <SelectItem value="nova">Nova (Female)</SelectItem>
              <SelectItem value="shimmer">Shimmer (Soft Female)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">
            Language
          </Label>
          <Select
            value={language}
            onValueChange={setLanguage}
            disabled={disabled || isProcessing}
          >
            <SelectTrigger id="language-select" aria-label="Language selection">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
              <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
              <SelectItem value="fr-FR">French</SelectItem>
              <SelectItem value="de-DE">German</SelectItem>
              <SelectItem value="it-IT">Italian</SelectItem>
              <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
              <SelectItem value="ja-JP">Japanese</SelectItem>
              <SelectItem value="zh-CN">Chinese (Mandarin)</SelectItem>
              <SelectItem value="ko-KR">Korean</SelectItem>
              <SelectItem value="hi-IN">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Controls */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2"
            disabled={disabled || isProcessing}
          >
            <Settings2 className="size-4" />
            {isAdvancedOpen ? "Hide" : "Show"} Advanced Settings
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <ErrorBoundary
            fallback={
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-900">
                  Advanced settings could not be loaded. Speed and pitch controls are unavailable, but you can still generate speech with default settings.
                </p>
              </div>
            }
          >
            <TooltipProvider>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="speed-slider" className="text-sm flex items-center gap-2">
                      Speech Speed
                      <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipPrimitive.Trigger>
                        <TooltipPrimitive.Portal>
                          <TooltipPrimitive.Content className="z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 max-w-xs">
                            <p className="text-xs">
                              Adjust how fast your voice speaks. 1.0 is normal speed, lower is slower, higher is faster.
                            </p>
                          </TooltipPrimitive.Content>
                        </TooltipPrimitive.Portal>
                      </TooltipPrimitive.Root>
                    </Label>
                    <span className="text-sm font-medium text-muted-foreground">
                      {speed && speed.length > 0 ? speed[0].toFixed(1) : "1.0"}x
                    </span>
                  </div>
                  <Slider
                    id="speed-slider"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={speed && speed.length > 0 ? speed : [1.0]}
                    onValueChange={setSpeed}
                    disabled={disabled || isProcessing}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slower (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Faster (2.0x)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pitch-slider" className="text-sm flex items-center gap-2">
                      Voice Pitch
                      <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipPrimitive.Trigger>
                        <TooltipPrimitive.Portal>
                          <TooltipPrimitive.Content className="z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 max-w-xs">
                            <p className="text-xs">
                              Adjust the pitch of your voice. 1.0 is normal pitch, lower is deeper, higher is more high-pitched.
                            </p>
                          </TooltipPrimitive.Content>
                        </TooltipPrimitive.Portal>
                      </TooltipPrimitive.Root>
                    </Label>
                    <span className="text-sm font-medium text-muted-foreground">
                      {pitch && pitch.length > 0 ? pitch[0].toFixed(1) : "1.0"}x
                    </span>
                  </div>
                  <Slider
                    id="pitch-slider"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={pitch && pitch.length > 0 ? pitch : [1.0]}
                    onValueChange={setPitch}
                    disabled={disabled || isProcessing}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Deeper (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Higher (2.0x)</span>
                  </div>
                </div>

                {/* Audio Output Selector */}
                {audioDevices.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-sm flex items-center gap-2">
                      Audio Output
                      <TooltipPrimitive.Root>
                        <TooltipPrimitive.Trigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipPrimitive.Trigger>
                        <TooltipPrimitive.Portal>
                          <TooltipPrimitive.Content className="z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 max-w-xs">
                            <p className="text-xs mb-2">
                              Select where the speech audio should play. To route into Google Meet, select a Virtual Audio Cable here, then set that cable as your microphone in Meet.
                            </p>
                            <p className="text-xs font-semibold mt-2 pt-2 border-t border-primary-foreground/20">
                              For clean audio in Meet:
                            </p>
                            <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                              <li>Disable Google Meet noise cancellation (Meet settings)</li>
                              <li>Virtual cable buffer size ≥ 512 samples</li>
                              <li>Use 48000 Hz sample rate in virtual cable / Windows sound device</li>
                              <li>Disable &quot;Allow applications to take exclusive control&quot; in Windows sound device properties</li>
                            </ul>
                          </TooltipPrimitive.Content>
                        </TooltipPrimitive.Portal>
                      </TooltipPrimitive.Root>
                    </Label>
                    <Select
                      value={
                        selectedAudioDevice &&
                          selectedAudioDevice.trim() !== "" &&
                          audioDevices.some(d => d.deviceId === selectedAudioDevice)
                          ? selectedAudioDevice
                          : audioDevices[0]?.deviceId && audioDevices[0].deviceId.trim() !== ""
                            ? audioDevices[0].deviceId
                            : undefined
                      }
                      onValueChange={(value) => {
                        if (value && value.trim() !== "") {
                          setSelectedAudioDevice(value);
                        }
                      }}
                      disabled={disabled || isProcessing}
                    >
                      <SelectTrigger id="audio-output" aria-label="Audio output device selection">
                        <SelectValue placeholder="Select output device" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices
                          .filter((device) => device.deviceId && device.deviceId.trim() !== "")
                          .map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                              {device.label || `Speaker (${device.deviceId.slice(0, 4)}...)`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      If you don&apos;t hear anything, choose your speakers or &quot;Default&quot; and check system volume.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Audio output device selection is not available in this browser. Audio will play on your default speakers.
                    </p>
                  </div>
                )}
              </div>
            </TooltipProvider>
          </ErrorBoundary>
        </CollapsibleContent>
      </Collapsible>

      {/* Action Button */}
      <Button
        onClick={state === "playing" ? handleStop : handleGenerateAndPlay}
        // Disable when text is invalid or a generation request is in progress.
        disabled={state !== "playing" && (isDisabled || state === "generating")}
        className={`w-full gap-2 ${state === "error"
          ? "bg-red-600 hover:bg-red-700"
          : state === "success"
            ? "bg-green-600 hover:bg-green-700"
            : state === "playing"
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        size="lg"
      >
        {getButtonContent()}
      </Button>

      {/* Helper Text */}
      {state === "idle" && text.length === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          💡 Tip: Keep messages concise for natural-sounding speech. Break
          longer content into multiple messages.
        </p>
      )}
    </div>
  );
}
