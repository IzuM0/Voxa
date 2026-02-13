import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Play, Loader2 } from "lucide-react";
import { settingsApi } from "../../../lib/api";
import { fetchTtsAudioBuffer } from "../../../lib/tts";
import { toast } from "sonner@2.0.3";

const voices = [
  { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
  { id: "echo", name: "Echo", description: "Warm and friendly" },
  { id: "fable", name: "Fable", description: "Clear and expressive" },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
  { id: "nova", name: "Nova", description: "Energetic and bright" },
  { id: "shimmer", name: "Shimmer", description: "Smooth and elegant" },
];

export default function SettingsVoice() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await settingsApi.get();
        if (settings) {
          setSelectedVoice(settings.preferred_voice ?? "alloy");
          const speedNum = Number(settings.default_speed);
          const pitchNum = Number(settings.default_pitch);
          setSpeed([Number.isFinite(speedNum) ? speedNum : 1.0]);
          setPitch([Number.isFinite(pitchNum) ? pitchNum : 1.0]);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await settingsApi.update({
        preferred_voice: selectedVoice,
        default_speed: Number(speed[0]) || 1.0,
        default_pitch: Number(pitch[0]) || 1.0,
      });
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error("Failed to save settings", {
        description: err.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      setIsPreviewing(true);
      const previewText = `Hello! This is a preview of the ${voices.find(v => v.id === selectedVoice)?.name} voice. You can adjust the speed and pitch settings below.`;
      
      const audioData = await fetchTtsAudioBuffer({
        voice: selectedVoice,
        input: previewText,
        speed: Number(speed[0]) || 1.0,
        pitch: Number(pitch[0]) || 1.0,
      });

      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // Handle audio playback errors
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        toast.error("Failed to play preview", {
          description: "There was an error playing the audio. Please try again.",
        });
        URL.revokeObjectURL(url);
        setIsPreviewing(false);
      };

      // Handle successful playback end
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsPreviewing(false);
      };

      // Play audio
      try {
        await audio.play();
      } catch (playError: any) {
        // Browser autoplay policy might block this
        console.error("Audio play error:", playError);
        toast.error("Failed to play preview", {
          description: playError?.message || "Browser blocked audio playback. Please interact with the page first.",
        });
        URL.revokeObjectURL(url);
        setIsPreviewing(false);
      }
    } catch (err: any) {
      console.error("Preview failed:", err);
      toast.error("Preview failed", {
        description: err?.message || "Failed to generate preview. Please check your connection and try again.",
      });
      setIsPreviewing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3>Voice Selection</h3>
          <CardDescription>
            Choose your preferred voice for text-to-speech conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div>
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs text-muted-foreground">{voice.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm mb-3">
              "Hello! This is a preview of the {voices.find(v => v.id === selectedVoice)?.name} voice. 
              You can adjust the speed and pitch settings below."
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={handlePreview}
              disabled={isPreviewing || isLoading}
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Playing...
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Preview Voice
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h3>Voice Settings</h3>
          <CardDescription>
            Fine-tune your voice output preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Speed</Label>
              <span className="text-sm text-muted-foreground">{Number(speed[0]).toFixed(1)}x</span>
            </div>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adjust how fast the voice speaks (0.5x to 2.0x)
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pitch</Label>
              <span className="text-sm text-muted-foreground">{Number(pitch[0]).toFixed(1)}</span>
            </div>
            <Slider
              value={pitch}
              onValueChange={setPitch}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adjust the pitch of the voice (0.5 to 2.0)
            </p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
