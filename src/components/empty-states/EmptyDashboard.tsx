import { Button } from "../ui/button";
import { Video, CalendarPlus } from "lucide-react";

interface EmptyDashboardProps {
  onAddMeeting: () => void;
  onScheduleMeeting: () => void;
}

export function EmptyDashboard({ onAddMeeting, onScheduleMeeting }: EmptyDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Video className="size-12 text-blue-600" />
      </div>
      <h3 className="mb-2 text-center">No meetings yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by joining a live meeting or scheduling one for later. 
        Voxa will help you participate with text-to-speech.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onAddMeeting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Video className="size-4 mr-2" />
          Add to Live Meeting
        </Button>
        <Button 
          onClick={onScheduleMeeting}
          variant="outline"
        >
          <CalendarPlus className="size-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>
    </div>
  );
}
