import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ExternalLink, Headphones, Settings, Video } from "lucide-react";

const STORAGE_KEY = "whispra_guide_shown";

const STEPS = [
  {
    title: "Welcome",
    description:
      "Welcome to Whispra! Let's get you set up in 3 simple steps to use AI voice in Google Meet.",
  },
  {
    title: "Install a virtual cable",
    description:
      "Install a virtual audio cable so your computer can send Whispra's voice into your meeting.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
          <p className="font-medium text-foreground flex items-center gap-2">
            <span className="rounded bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              Windows
            </span>
            VB-Cable
          </p>
          <p className="text-xs">
            Download and install VB-Cable, then reboot if prompted.
          </p>
          <a
            href="https://vb-audio.com/Cable/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-medium"
          >
            Download VB-Cable
            <ExternalLink className="size-3" />
          </a>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
          <p className="font-medium text-foreground flex items-center gap-2">
            <span className="rounded bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              Mac
            </span>
            BlackHole
          </p>
          <p className="text-xs">
            Download and run the BlackHole installer, then restart if prompted.
          </p>
          <a
            href="https://existential.audio/blackhole/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-medium"
          >
            Download BlackHole
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    ),
  },
  {
    title: "Configure Whispra",
    description: "Set Whispra's audio output to your virtual cable so speech is sent there.",
    content: (
      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Settings className="size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground mb-1">Audio output device</p>
          <p>
            In this page, open <strong>Advanced settings</strong> and choose your virtual cable (e.g. &quot;VB-Cable&quot; or &quot;BlackHole&quot;) as the <strong>Audio output device</strong>. That way, Whispra will play TTS into the cable.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Configure Google Meet",
    description: "In your meeting, set the microphone to the same cable so others hear you.",
    content: (
      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Video className="size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground mb-1">Microphone in Meet</p>
          <p>
            In Google Meet, click the microphone/settings icon and set your <strong>microphone</strong> to the same virtual cable (e.g. &quot;VB-Cable&quot; or &quot;BlackHole&quot;). Then when you generate speech in Whispra, it will be heard in the meeting.
          </p>
        </div>
      </div>
    ),
  },
];

export function FirstTimeGuide({
  open,
  onComplete,
}: {
  open: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  const handleClose = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onComplete();
  }, [onComplete]);

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      handleClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg" onEscapeKeyDown={() => handleClose()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="size-5 text-primary" />
            {current.title}
          </DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-[120px] py-2">
          {current.content && (
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-0">{current.content}</CardContent>
            </Card>
          )}
        </div>

        {/* Step counter */}
        <p className="text-xs text-muted-foreground text-center">
          {step + 1} of {STEPS.length}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground"
          >
            Skip Guide
          </Button>
          <Button type="button" onClick={handleNext}>
            {isLastStep ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const FIRST_TIME_GUIDE_STORAGE_KEY = STORAGE_KEY;
