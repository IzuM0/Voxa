import { Button } from "../ui/button";
import { MessageCircle, Video } from "lucide-react";

interface EmptyVoiceAnalyticsProps {
  onAddMeeting: () => void;
}

export function EmptyVoiceAnalytics({ onAddMeeting }: EmptyVoiceAnalyticsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <MessageCircle className="size-10 text-blue-600" />
      </div>
      <h3 className="mb-2 text-center text-lg">No voice usage recorded</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm">
        Your text-to-speech activity will be tracked here once you start 
        using Voxa in meetings.
      </p>
      <Button 
        onClick={onAddMeeting}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Video className="size-4 mr-2" />
        Start Using TTS
      </Button>
    </div>
  );
}
