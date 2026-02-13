import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Info, Mic, Volume2, AlertCircle } from "lucide-react";

export default function Help() {
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Help & How It Works</h1>
          <p className="text-muted-foreground mb-8">
            What Voxa does, how to use it, and what to expect.
          </p>

          {/* A. What Whispra Does */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="size-5" />
                What Voxa Does
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Voxa converts typed text into <strong>AI-generated speech</strong>. You type a
                message, choose a voice and language, and Voxa generates natural-sounding audio
                that plays on your device.
              </p>
              <p>
                Voxa is designed to be used <strong>alongside</strong> Zoom, Google Meet, or
                Microsoft Teams. You join your meeting in your usual way (in another tab or app).
                Voxa runs as a companion: you type here, speech is generated and played on your
                computer. To have others in the meeting hear it, you need to route that audio into
                your meeting (see below).
              </p>
            </CardContent>
          </Card>

          {/* B. AI Voice Disclosure - MANDATORY */}
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="size-5 text-amber-600" />
            <AlertDescription>
              <strong className="text-amber-900">AI voice disclosure:</strong>{" "}
              <span className="text-amber-900">
                The voice you hear is AI-generated and not a human voice.
              </span>
            </AlertDescription>
          </Alert>

          {/* C. How to Get TTS Into Your Meeting */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="size-5" />
                How to Get TTS Into Your Meeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Voxa plays audio through your <strong>system speakers</strong> (or default
                playback device). It does not yet inject audio directly into your microphone. To
                have participants in Zoom, Meet, or Teams hear the AI speech, you can use one of
                these approaches:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <strong>Virtual audio cable / loopback:</strong> Install software that creates a
                  virtual microphone (e.g. VB-Cable, BlackHole, Loopback). Route your system audio
                  (or a specific app output) to that virtual mic, then in Zoom/Meet/Teams select
                  that virtual mic as your microphone. When Voxa plays TTS, it goes to the
                  virtual mic and into the call.
                </li>
                <li>
                  <strong>Speaker + physical mic:</strong> Play Voxa through speakers and let
                  your real microphone pick it up. This can cause echo or lower quality; use in a
                  quiet room if at all.
                </li>
              </ol>
              <p className="text-muted-foreground text-sm">
                We do not provide step-by-step setup for every OS or tool. Check your virtual
                audio software’s documentation for “system audio” or “loopback” options.
              </p>
            </CardContent>
          </Card>

          {/* D. Known Limitations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="size-5" />
                Known Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>No direct microphone injection yet — audio plays on your device; you route it yourself.</li>
                <li>No built-in video or meeting embed — you open your meeting in Zoom/Meet/Teams separately.</li>
                <li>No built-in recording feature — “Start recording” is not yet available.</li>
                <li>Billing and usage limits are for display only — payment integration and enforcement are coming later.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
