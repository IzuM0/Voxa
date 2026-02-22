import { useState, useEffect } from "react";
import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { MeetingCard } from "../../components/dashboard/MeetingCard";
import { EmptyMeetings } from "../../components/empty-states/EmptyMeetings";
import { SkeletonCard } from "../../components/loading-states/SkeletonCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

export default function Meetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  // Select doesn't submit with FormData; keep platform in state for create
  const [newMeetingPlatform, setNewMeetingPlatform] = useState<"google-meet" | "zoom" | "microsoft-teams" | "other">("google-meet");

  const handleDeleteMeeting = async (id: string) => {
    try {
      const { meetingsApi } = await import("../../lib/api");
      await meetingsApi.delete(id);
      const updated = await meetingsApi.list({ limit: 100 });
      setMeetings(updated);
      toast.success("Meeting deleted");
    } catch (err: any) {
      toast.error("Failed to delete meeting", { description: err?.message || "Please try again." });
    }
  };
  
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { meetingsApi } = await import("../../lib/api");
        const data = await meetingsApi.list({ limit: 100 });
        setMeetings(data || []);
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Failed to fetch meetings:", msg);
        setError(err.message || "Failed to load meetings");
        setMeetings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);
  
  const filterMeetings = (status?: string) => {
    let filtered = meetings;
    
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const isEmpty = meetings.length === 0;
  
  return (
    <div className="flex h-screen">
      <DashboardNav />

      <main className="flex-1 overflow-y-auto bg-background">
        <ErrorBoundary>
          <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2">Meetings</h1>
              <p className="text-muted-foreground">Manage and track all your meetings</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="size-4" />
                  New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Meeting</DialogTitle>
                  <DialogDescription>
                    Create a new meeting entry to track your voice usage
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (isCreatingMeeting) return;
                    const formData = new FormData(e.currentTarget);
                    const title = (formData.get("meeting-title") as string)?.trim();
                    const url = (formData.get("meeting-url") as string)?.trim() || null;
                    const scheduledAt = (formData.get("scheduled-at") as string) || null;

                    if (!title) {
                      toast.error("Title is required");
                      return;
                    }

                    setIsCreatingMeeting(true);
                    try {
                      const { meetingsApi } = await import("../../lib/api");
                      await meetingsApi.create({
                        title,
                        platform: newMeetingPlatform,
                        meeting_url: url || null,
                        scheduled_at: scheduledAt || null,
                      });

                      setIsDialogOpen(false);
                      setNewMeetingPlatform("google-meet");
                      const updated = await meetingsApi.list({ limit: 100 });
                      setMeetings(updated);
                      toast.success("Meeting created");
                    } catch (err: any) {
                      toast.error("Failed to create meeting", {
                        description: err.message || "Please try again.",
                      });
                    } finally {
                      setIsCreatingMeeting(false);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="meeting-title">Meeting Title</Label>
                    <Input id="meeting-title" name="meeting-title" placeholder="Team Standup" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meeting-url">Meeting URL</Label>
                    <Input id="meeting-url" name="meeting-url" placeholder="https://meet.google.com/..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={newMeetingPlatform} onValueChange={(v) => setNewMeetingPlatform(v as typeof newMeetingPlatform)}>
                      <SelectTrigger id="platform" aria-label="Platform selection">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google-meet">Google Meet</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-at">Scheduled Date & Time</Label>
                    <Input id="scheduled-at" name="scheduled-at" type="datetime-local" />
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isCreatingMeeting}>
                    {isCreatingMeeting ? "Creating..." : "Create Meeting"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : isEmpty ? (
                <EmptyMeetings onAddMeeting={() => setIsDialogOpen(true)} />
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterMeetings().map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      id={meeting.id}
                      title={meeting.title}
                      platform={meeting.platform === "google-meet" ? "Google Meet" : meeting.platform === "microsoft-teams" ? "Microsoft Teams" : meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1)}
                      scheduledAt={meeting.scheduled_at || meeting.created_at}
                      status={meeting.status}
                      duration={meeting.duration}
                      meetingUrl={meeting.meeting_url || "#"}
                      onDelete={handleDeleteMeeting}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : filterMeetings("scheduled").length === 0 ? (
                <EmptyMeetings onAddMeeting={() => setIsDialogOpen(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterMeetings("scheduled").map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      id={meeting.id}
                      title={meeting.title}
                      platform={meeting.platform === "google-meet" ? "Google Meet" : meeting.platform === "microsoft-teams" ? "Microsoft Teams" : meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1)}
                      scheduledAt={meeting.scheduled_at || meeting.created_at}
                      status={meeting.status}
                      duration={meeting.duration}
                      meetingUrl={meeting.meeting_url || "#"}
                      onDelete={handleDeleteMeeting}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : filterMeetings("completed").length === 0 ? (
                <EmptyMeetings onAddMeeting={() => setIsDialogOpen(true)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterMeetings("completed").map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      id={meeting.id}
                      title={meeting.title}
                      platform={meeting.platform === "google-meet" ? "Google Meet" : meeting.platform === "microsoft-teams" ? "Microsoft Teams" : meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1)}
                      scheduledAt={meeting.scheduled_at || meeting.created_at}
                      status={meeting.status}
                      duration={meeting.duration}
                      meetingUrl={meeting.meeting_url || "#"}
                      onDelete={handleDeleteMeeting}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}