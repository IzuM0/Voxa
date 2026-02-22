import { useState } from "react";
import { Link } from "react-router";
import { TTSComposer } from "../../components/tts/TTSComposer";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { ChevronDown, Mic, Sparkles } from "lucide-react";

export default function TTSDemo() {
  const [showDevOptions, setShowDevOptions] = useState(false);

  const handleSpeech = async (_text: string, _options: any) => {
    // Demo: no-op handler; TTSComposer handles playback internally when used in demo
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Compact header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
          >
            ← Back to home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mic className="size-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Try Whispra</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Type below and hear it spoken with AI. No sign-up required for this demo.
          </p>
        </div>

        {/* Single composer — main focus */}
        <Card className="shadow-sm border-border/80">
          <CardContent className="p-4 sm:p-6 pt-6">
            <TTSComposer
              onSpeech={handleSpeech}
              maxCharacters={500}
              disabled={false}
            />
          </CardContent>
        </Card>

        {/* Short hint */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Choose a voice, adjust speed and pitch in settings, then generate & speak.
        </p>

        {/* Optional developer section — collapsed by default */}
        <Collapsible open={showDevOptions} onOpenChange={setShowDevOptions}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mt-8 text-muted-foreground hover:text-foreground w-full justify-center gap-1"
            >
              <Sparkles className="size-3.5" />
              Developer options
              <ChevronDown
                className={`size-4 transition-transform ${showDevOptions ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 p-4 rounded-lg bg-muted/40 border border-border/60 text-sm text-muted-foreground space-y-2">
              <p>Sign in to use TTS in meetings, save voice preferences, and view analytics.</p>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">Go to app</Button>
              </Link>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
