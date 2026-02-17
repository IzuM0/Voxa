import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { TTSComposer } from "../../components/tts/TTSComposer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { Link } from "react-router";
import {
  Video,
  Mic,
  PhoneOff,
  Clock,
  MessageSquare,
  Settings,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { ConfirmationModal } from "../../components/confirmation-modals/ConfirmationModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { meetingsApi } from "../../lib/api";
import { clearActiveMeetingStorage, getActiveMeetingId, setActiveMeetingId } from "../../lib/activeMeetingStorage";

export default function LiveMeeting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const meetingId = searchParams.get("meetingId");

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState("00:00:00");
  const [messagesSent, setMessagesSent] = useState(0);
  const [ttsLogs, setTtsLogs] = useState<any[]>([]);
  const [meeting, setMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const leftViaButtonRef = useRef(false);
  const meetingRef = useRef(meeting);
  meetingRef.current = meeting;

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    // If no meetingId in URL, try to resume from last active meeting (so user doesn't have to re-add)
    if (!meetingId) {
      const savedId = getActiveMeetingId();
      if (savedId) {
        navigate(`/livemeeting?meetingId=${savedId}`, { replace: true });
        return;
      }
      setIsLoading(false);
      navigate("/meetings", { replace: true });
      return;
    }

    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        const meetingData = await meetingsApi.get(meetingId);
        setMeeting(meetingData);

        // Persist so user can return to composer without re-adding (cleared only when they click Leave meeting)
        setActiveMeetingId(meetingId);

        // Update meeting status to active and keep UI in sync
        await meetingsApi.update(meetingId, {
          status: "active",
          started_at: new Date().toISOString(),
        });
        setMeeting((prev) =>
          prev ? { ...prev, status: "active", started_at: new Date().toISOString() } : null
        );

        // Fetch TTS messages
        const logs = await meetingsApi.getTtsLogs(meetingId);
        setTtsLogs(logs);
        setMessagesSent(logs.length);
      } catch (err) {
        console.error("Failed to load meeting:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId, navigate]);

  // Update meeting duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      setMeetingDuration(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleSpeech = async (text: string, options: any) => {
    try {
      // Refresh TTS logs to show the new message
      if (meetingId) {
        const logs = await meetingsApi.getTtsLogs(meetingId);
        setTtsLogs(logs);
        setMessagesSent(logs.length);
      } else {
        setMessagesSent((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to handle speech:", err);
    }
  };

  const markMeetingCompleted = (durationSeconds?: number) => {
    if (!meetingId) return;
    const elapsed = durationSeconds ?? Math.floor((Date.now() - startTime) / 1000);
    meetingsApi
      .update(meetingId, {
        status: "completed",
        ended_at: new Date().toISOString(),
        duration: elapsed,
      })
      .catch(() => {});
  };

  const handleLeaveMeeting = async () => {
    leftViaButtonRef.current = true;
    clearActiveMeetingStorage();
    try {
      if (meetingId) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        await meetingsApi.update(meetingId, {
          status: "completed",
          ended_at: new Date().toISOString(),
          duration: elapsed,
        });
      }
    } catch (err) {
      console.error("Failed to update meeting:", err);
    }

    setShowLeaveModal(false);
    navigate("/meetings");
  };

  // When user closes tab or navigates away without clicking "Leave", keep meeting active so they can resume
  // (Only "Leave meeting" marks completed and clears stored meeting id.)
  useEffect(() => {
    return () => {
      if (leftViaButtonRef.current) return;
      // Optionally mark completed on tab close; we don't here so resume works across navigation
    };
  }, [meetingId]);

  return (
    <div className="flex h-screen">
      <DashboardNav />

      <main className="flex-1 overflow-y-auto bg-background">
        <ErrorBoundary>
          <div className="h-full flex flex-col">
          {/* Meeting Header */}
          <div className="border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <h1 className="text-xl">{isLoading ? "Loading..." : meeting?.title || "Live Meeting"}</h1>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" />
                  {meetingDuration}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {meeting?.meeting_url && (
                  <a
                    href={meeting.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                  >
                    <Video className="size-3" />
                    Open meeting in new tab
                  </a>
                )}
                <Badge variant="outline" className="gap-1" title="TTS messages generated and played on your device">
                  <MessageSquare className="size-3" />
                  {messagesSent} TTS generated
                </Badge>
              </div>
            </div>

            {/* Companion hint */}
            <p className="mt-2 text-xs text-muted-foreground">
              Join your meeting in another tab 
            </p>
            {/* Meeting Platform Info */}
            {meeting && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="size-4" />
                <span>
                  {meeting.platform === "google-meet"
                    ? "Google Meet"
                    : meeting.platform === "microsoft-teams"
                    ? "Microsoft Teams"
                    : meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1)}
                </span>
                {meeting.meeting_url && (
                  <>
                    <span className="text-xs">•</span>
                    <span className="truncate max-w-md">{meeting.meeting_url}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left Column - Meeting View */}
              <div className="lg:col-span-2 space-y-4">
                {/* Video Preview Card */}
                <Card className="h-[400px] bg-gray-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="size-12" />
                      </div>
                      <p className="text-lg font-medium">
                        Companion session active
                      </p>
                      <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                        Generate speech here. Join your meeting in another tab and use your system audio (or a virtual mic) so others can hear it.
                      </p>
                      <div className="flex flex-col items-center gap-2 mt-4">
                        {meeting?.meeting_url && (
                          <a
                            href={meeting.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-white underline"
                          >
                            <Video className="size-4" />
                            Open meeting in another tab to see video and participants
                          </a>
                        )}
                        <Link
                          to="/help"
                          className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-white underline"
                        >
                          <HelpCircle className="size-4" />
                          How to get TTS into your meeting
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mute/video/settings are controlled by your meeting app — these are disabled for clarity */}
                  <TooltipProvider>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full w-12 h-12"
                              disabled
                            >
                              <Mic className="size-5" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Audio/video control is handled by your meeting platform (Zoom, Meet, Teams).</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full w-12 h-12"
                              disabled
                            >
                              <Video className="size-5" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Audio/video control is handled by your meeting platform (Zoom, Meet, Teams).</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full w-12 h-12"
                              disabled
                            >
                              <Settings className="size-5" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>Audio/video control is handled by your meeting platform (Zoom, Meet, Teams).</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-full w-12 h-12"
                        onClick={() => setShowLeaveModal(true)}
                      >
                        <PhoneOff className="size-5" />
                      </Button>
                    </div>
                  </TooltipProvider>
                </Card>

                {/* Meeting Activity Log */}
                <Card>
                  <CardHeader>
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      Recent TTS Messages
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[200px] overflow-y-auto">
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin mx-auto mb-2" />
                        Loading messages...
                      </div>
                    ) : ttsLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No messages sent yet. Type and send your first TTS message!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {ttsLogs.slice().reverse().map((log, index) => (
                          <div key={log.id}>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Mic className="size-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <Badge variant="outline" className="text-xs">{log.voice_used}</Badge>
                                  {log.status === "failed" && (
                                    <Badge variant="outline" className="text-xs text-red-600">Failed</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-foreground break-words">{log.text_input}</p>
                                {log.error_message && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {log.error_message.length > 100 
                                      ? `${log.error_message.substring(0, 100)}...` 
                                      : log.error_message}
                                  </p>
                                )}
                              </div>
                            </div>
                            {index < ttsLogs.length - 1 && <Separator className="mt-3" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - TTS Composer */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        Text-to-Speech Composer
                      </h3>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Ready
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <TTSComposer
                        onSpeech={handleSpeech}
                        maxCharacters={500}
                        disabled={false}
                        meetingId={meetingId || undefined}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Usage Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          TTS generated
                        </span>
                        <span className="font-medium">{messagesSent}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Time in meeting
                        </span>
                        <span className="font-medium">{meetingDuration}</span>
                      </div>
                      {meeting && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Meeting status
                          </span>
                          <Badge className={statusColors[meeting.status] ?? "bg-gray-100 text-gray-700"}>
                            {meeting.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          </div>
        </ErrorBoundary>
      </main>

      {/* Leave Meeting Confirmation Modal */}
      <ConfirmationModal
        open={showLeaveModal}
        onOpenChange={setShowLeaveModal}
        type="leave-meeting"
        onConfirm={handleLeaveMeeting}
      />
    </div>
  );
}
