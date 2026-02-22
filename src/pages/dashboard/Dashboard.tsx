import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Link, useNavigate } from "react-router";
import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { MeetingCard } from "../../components/dashboard/MeetingCard";
import { EmptyDashboard } from "../../components/empty-states/EmptyDashboard";
import { SkeletonStats } from "../../components/loading-states/SkeletonStats";
import { SkeletonCard } from "../../components/loading-states/SkeletonCard";
import { UsageLimitBanner } from "../../components/usage-limits/UsageLimitBanner";
import { Calendar, Clock, MessageSquare, TrendingUp, Video, CalendarPlus, Upload, Mic, Timer, Monitor, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ChevronDown } from "lucide-react";

// Helper function to format stats for display
function formatStatsForDisplay(stats: any, platforms: any[]): any[] {
  if (!stats) {
    return [
      { title: "Total Meetings", value: "0", change: "No data", changeType: "neutral" as const, icon: Calendar },
      { title: "Hours Spoken", value: "0", change: "No data", changeType: "neutral" as const, icon: Clock },
      { title: "Total TTS Messages", value: "0", change: "No data", changeType: "neutral" as const, icon: MessageCircle },
      { title: "Average Meeting Duration", value: "0 min", change: "No data", changeType: "neutral" as const, icon: Timer },
      { title: "Primary Platform", value: "N/A", change: "No data", changeType: "neutral" as const, icon: Monitor },
      { title: "Characters Used", value: "0", change: "0% of limit", changeType: "neutral" as const, icon: MessageSquare },
    ];
  }

  const hoursSpoken = (stats.total_duration_seconds || 0) / 3600;
  const avgDurationMinutes = Math.round((stats.average_meeting_duration_seconds || 0) / 60);
  const primaryPlatform = platforms.length > 0 ? platforms[0].platform : "N/A";
  const charactersK = Math.round((stats.total_characters || 0) / 1000);
  const usagePercent = Math.round(((stats.total_characters || 0) / 100000) * 100);

  return [
    {
      title: "Total Meetings",
      value: stats.total_meetings?.toString() || "0",
      change: "All time",
      changeType: "neutral" as const,
      icon: Calendar,
    },
    {
      title: "Hours Spoken",
      value: hoursSpoken.toFixed(1),
      change: "Total duration",
      changeType: "neutral" as const,
      icon: Clock,
    },
    {
      title: "Total TTS Messages",
      value: stats.total_tts_messages?.toLocaleString() || "0",
      change: "All messages",
      changeType: "neutral" as const,
      icon: MessageCircle,
    },
    {
      title: "Average Meeting Duration",
      value: `${avgDurationMinutes} min`,
      change: "Across all meetings",
      changeType: "neutral" as const,
      icon: Timer,
    },
    {
      title: "Primary Platform",
      value: primaryPlatform === "N/A" ? "N/A" : primaryPlatform.charAt(0).toUpperCase() + primaryPlatform.slice(1).replace(/-/g, " "),
      change: platforms.length > 0 ? `${platforms[0].percentage}% of meetings` : "No data",
      changeType: "neutral" as const,
      icon: Monitor,
    },
    {
      title: "Characters Used",
      value: `${charactersK}K`,
      change: `${usagePercent}% of limit`,
      changeType: usagePercent > 80 ? "negative" as const : "neutral" as const,
      icon: MessageSquare,
    },
  ];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [meetingName, setMeetingName] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLanguage, setMeetingLanguage] = useState("english");
  
  // Schedule meeting states
  const [scheduledTitle, setScheduledTitle] = useState("");
  const [scheduledPlatform, setScheduledPlatform] = useState("google-meet");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledDuration, setScheduledDuration] = useState("30");
  const [scheduledMeetingLink, setScheduledMeetingLink] = useState("");
  const [isStartingCapturing, setIsStartingCapturing] = useState(false);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
  
  const [meetings, setMeetings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const isEmpty = meetings.length === 0;
  
  // Usage stats
  const characterUsage = stats
    ? { current: stats.total_characters || 0, limit: 100000 }
    : { current: 0, limit: 100000 };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const { meetingsApi, analyticsApi } = await import("../../lib/api");
      const [meetingsData, statsData, platformsData] = await Promise.all([
        meetingsApi.list({ limit: 10 }).catch(() => []),
        analyticsApi.getStats().catch(() => null),
        analyticsApi.getPlatforms().catch(() => []),
      ]);
      setMeetings(meetingsData || []);
      setStats(statsData);
      setPlatforms(platformsData || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to fetch dashboard data:", msg);
      setHasError(true);
      setMeetings([]);
      setStats(null);
      setPlatforms([]);
      toast.error("Failed to load dashboard", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const meetingLanguageToCode: Record<string, string> = {
    english: "en-US",
    spanish: "es",
    french: "fr",
    german: "de",
    mandarin: "zh-CN",
    japanese: "ja",
  };

  const handleStartCapturing = async () => {
    if (isStartingCapturing) return;
    setIsStartingCapturing(true);
    try {
      const { meetingsApi } = await import("../../lib/api");
      const languageCode = meetingLanguageToCode[meetingLanguage] || "en-US";
      const meeting = await meetingsApi.create({
        title: meetingName?.trim() || "New Meeting",
        platform: "google-meet",
        meeting_url: meetingLink?.trim() || null,
        language: languageCode,
      });

      setIsAddMeetingOpen(false);
      setMeetingName("");
      setMeetingLink("");
      navigate(`/livemeeting?meetingId=${meeting.id}`);
      if (meeting.meeting_url) {
        window.open(meeting.meeting_url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to create meeting:", msg);
      toast.error("Failed to create meeting", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsStartingCapturing(false);
    }
  };
  
  const handleScheduleMeeting = async () => {
    if (isSchedulingMeeting) return;
    setIsSchedulingMeeting(true);
    try {
      const { meetingsApi } = await import("../../lib/api");
      
      const scheduledDateTime = scheduledDate && scheduledTime
        ? `${scheduledDate}T${scheduledTime}:00`
        : null;

      await meetingsApi.create({
        title: scheduledTitle,
        platform: scheduledPlatform as any,
        scheduled_at: scheduledDateTime,
        meeting_url: scheduledMeetingLink || null,
        language: "en-US",
      });

      setIsScheduleMeetingOpen(false);
      setScheduledTitle("");
      setScheduledDate("");
      setScheduledTime("");
      setScheduledMeetingLink("");

      const { meetingsApi: refreshApi } = await import("../../lib/api");
      const updated = await refreshApi.list({ limit: 10 });
      setMeetings(updated);
      toast.success("Meeting scheduled");
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to schedule meeting:", msg);
      toast.error("Failed to schedule meeting", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsSchedulingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      const { meetingsApi, analyticsApi } = await import("../../lib/api");
      await meetingsApi.delete(id);
      const [meetingsData, statsData, platformsData] = await Promise.all([
        meetingsApi.list({ limit: 10 }).catch(() => []),
        analyticsApi.getStats().catch(() => null),
        analyticsApi.getPlatforms().catch(() => []),
      ]);
      setMeetings(meetingsData || []);
      setStats(statsData);
      setPlatforms(platformsData || []);
      toast.success("Meeting deleted");
    } catch (err: any) {
      toast.error("Failed to delete meeting", { description: err?.message || "Please try again." });
    }
  };

  return (
    <div className="flex h-screen">
      <DashboardNav />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <ErrorBoundary>
          <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2">Home</h1>
              <p className="text-muted-foreground">Welcome back! Here's your meeting overview.</p>
            </div>
            
            {/* Capture Button with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Video className="size-4" />
                  Capture
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsAddMeetingOpen(true)}>
                  <Video className="size-4 mr-2" />
                  Add to live meeting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsScheduleMeetingOpen(true)}>
                  <CalendarPlus className="size-4 mr-2" />
                  Schedule new meeting
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-70 cursor-not-allowed">
                  <Mic className="size-4 mr-2" />
                  Start recording <span className="text-muted-foreground text-xs ml-1">(coming soon)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Add to Live Meeting Modal */}
          <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to live meeting</DialogTitle>
                <DialogDescription>
                  Connect Voxa to your active meeting to start using text-to-speech
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-name">Name your meeting <span className="text-muted-foreground">(Optional)</span></Label>
                  <Input
                    id="meeting-name"
                    placeholder="E.g. Product team sync"
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meeting-link">Meeting link</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Capture meetings from GMeet, Zoom, MS teams, and more.
                  </p>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <Input
                      id="meeting-link"
                      placeholder="https://zoom.us/j/7727195107"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Meeting language</Label>
                  <Select value={meetingLanguage} onValueChange={setMeetingLanguage}>
                    <SelectTrigger id="meeting-language" aria-label="Meeting language selection">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English (Global)</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="mandarin">Mandarin</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddMeetingOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleStartCapturing}
                  disabled={!meetingLink || isStartingCapturing}
                >
                  {isStartingCapturing ? "Creating..." : "Start Capturing"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Schedule New Meeting Modal */}
          <Dialog open={isScheduleMeetingOpen} onOpenChange={setIsScheduleMeetingOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule new meeting</DialogTitle>
                <DialogDescription>
                  Schedule a meeting and set up Voxa to join automatically
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-title">Meeting title</Label>
                  <Input
                    id="scheduled-title"
                    placeholder="E.g. Product team sync"
                    value={scheduledTitle}
                    onChange={(e) => setScheduledTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={scheduledPlatform} onValueChange={setScheduledPlatform}>
                    <SelectTrigger id="scheduled-platform" aria-label="Platform selection">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google-meet">Google Meet</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Date</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduled-time">Time</Label>
                  <Input
                    id="scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduled-duration">Duration (minutes)</Label>
                  <Input
                    id="scheduled-duration"
                    type="number"
                    value={scheduledDuration}
                    onChange={(e) => setScheduledDuration(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduled-meeting-link">Meeting link</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Capture meetings from GMeet, Zoom, MS teams, and more.
                  </p>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <Input
                      id="scheduled-meeting-link"
                      placeholder="https://zoom.us/j/7727195107"
                      value={scheduledMeetingLink}
                      onChange={(e) => setScheduledMeetingLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsScheduleMeetingOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleScheduleMeeting}
                  disabled={!scheduledTitle || !scheduledDate || !scheduledTime || !scheduledDuration || isSchedulingMeeting}
                >
                  {isSchedulingMeeting ? "Scheduling..." : "Schedule Meeting"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Error state */}
          {hasError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-red-800">Could not load dashboard data. Please try again.</p>
              <Button variant="outline" size="sm" onClick={() => fetchData()} className="shrink-0">
                Retry
              </Button>
            </div>
          )}

          {/* Usage Limit Banner */}
          <UsageLimitBanner
            currentUsage={characterUsage.current}
            limit={characterUsage.limit}
            type="characters"
            planName="Professional"
          />
          
          {/* Show empty state if no meetings */}
          {!isLoading && isEmpty && !hasError ? (
            <EmptyDashboard
              onAddMeeting={() => setIsAddMeetingOpen(true)}
              onScheduleMeeting={() => setIsScheduleMeetingOpen(true)}
            />
          ) : (
            <>
              {/* Voice Insights Section */}
              <div className="mb-8">
                <div className="mb-4">
                  <h2>Voice Insights</h2>
                  <p className="text-sm text-muted-foreground">Track your text-to-speech activity and meeting performance</p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    <>
                      <SkeletonStats />
                      <SkeletonStats />
                      <SkeletonStats />
                      <SkeletonStats />
                      <SkeletonStats />
                      <SkeletonStats />
                    </>
                  ) : (
                    formatStatsForDisplay(stats, platforms).map((stat, index) => (
                      <StatsCard key={index} {...stat} />
                    ))
                  )}
                </div>
              </div>
              
              {/* Recent Meetings */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2>Recent Meetings</h2>
                  <Link to="/meetings">
                    <Button variant="outline">View All</Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : (
                    meetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        id={meeting.id}
                        title={meeting.title}
                        platform={meeting.platform === "google-meet" ? "Google Meet" : meeting.platform === "microsoft-teams" ? "Microsoft Teams" : meeting.platform?.charAt(0)?.toUpperCase() + meeting.platform?.slice(1) || meeting.platform}
                        scheduledAt={meeting.scheduled_at || meeting.created_at}
                        status={meeting.status}
                        duration={meeting.duration}
                        meetingUrl={meeting.meeting_url || "#"}
                        onDelete={handleDeleteMeeting}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}