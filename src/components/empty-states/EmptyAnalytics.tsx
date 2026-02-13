import { Button } from "../ui/button";
import { BarChart3, Video } from "lucide-react";

interface EmptyAnalyticsProps {
  onAddMeeting: () => void;
}

export function EmptyAnalytics({ onAddMeeting }: EmptyAnalyticsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <BarChart3 className="size-12 text-blue-600" />
      </div>
      <h3 className="mb-2 text-center">No analytics data yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Start using Voxa in your meetings to see detailed analytics about 
        your text-to-speech usage, meeting patterns, and performance metrics.
      </p>
      <Button 
        onClick={onAddMeeting}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Video className="size-4 mr-2" />
        Join a Meeting
      </Button>
    </div>
  );
}
