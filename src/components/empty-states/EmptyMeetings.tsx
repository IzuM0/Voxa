import { Button } from "../ui/button";
import { Calendar, Video } from "lucide-react";

interface EmptyMeetingsProps {
  onAddMeeting: () => void;
}

export function EmptyMeetings({ onAddMeeting }: EmptyMeetingsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Calendar className="size-12 text-blue-600" />
      </div>
      <h3 className="mb-2 text-center">No meeting history</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Your meeting history will appear here once you start using Voxa 
        for text-to-speech in your virtual meetings.
      </p>
      <Button 
        onClick={onAddMeeting}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Video className="size-4 mr-2" />
        Start Your First Meeting
      </Button>
    </div>
  );
}
