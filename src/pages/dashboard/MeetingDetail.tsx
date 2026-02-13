import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Calendar, Clock, ExternalLink, Mic, MessageSquare, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { meetingsApi } from "../../lib/api";
import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

/** Turn stored TTS error (often raw JSON) into a short readable message. */
function formatTtsErrorMessage(msg: string | null): string {
  if (!msg?.trim()) return "";
  const t = msg.trim();
  if (t.startsWith("{")) {
    try {
      const o = JSON.parse(t) as { error?: { message?: string } };
      if (o?.error?.message) return o.error.message;
    } catch {
      // not JSON, use as-is below
    }
  }
  return msg;
}

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [meeting, setMeeting] = useState<any>(null);
  const [ttsLogs, setTtsLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const [meetingData, logsData] = await Promise.all([
          meetingsApi.get(id).catch(() => null),
          meetingsApi.getTtsLogs(id).catch(() => []),
        ]);

        if (!meetingData) {
          setError("Meeting not found");
          return;
        }

        setMeeting(meetingData);
        setTtsLogs(logsData || []);
      } catch (err: any) {
        console.error("Failed to fetch meeting:", err);
        setError(err.message || "Failed to load meeting");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="size-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading meeting...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen">
        <DashboardNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2">Meeting not found</h2>
            <p className="text-muted-foreground mb-4">{error || "The meeting you're looking for doesn't exist."}</p>
            <Link to="/meetings">
              <Button variant="outline">Back to Meetings</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalCharacters = ttsLogs.reduce((sum, log) => sum + (log.text_length || 0), 0);
  
  const platformDisplay = meeting.platform === "google-meet" 
    ? "Google Meet" 
    : meeting.platform === "microsoft-teams" 
    ? "Microsoft Teams" 
    : meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1);
  
  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await meetingsApi.delete(id);
      toast.success("Meeting deleted");
      navigate("/meetings");
    } catch (err: any) {
      toast.error("Failed to delete meeting", { description: err?.message || "Please try again." });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="flex h-screen">
      <DashboardNav />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <Link to="/meetings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="size-4" />
            Back to Meetings
          </Link>
          
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="mb-2">{meeting.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{platformDisplay}</span>
                <span>·</span>
                <span>{meeting.scheduled_at ? new Date(meeting.scheduled_at).toLocaleString() : "Not scheduled"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[meeting.status]}>
                {meeting.status}
              </Badge>
              {meeting.meeting_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="size-4" />
                    Open Meeting
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete meeting
              </Button>
            </div>
          </div>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this meeting?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{meeting.title}&quot; and any TTS logs linked to it. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-xl font-semibold">{meeting.duration ? `${Math.floor(meeting.duration / 60)} min` : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Messages</p>
                    <p className="text-xl font-semibold">{ttsLogs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mic className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Characters</p>
                    <p className="text-xl font-semibold">{totalCharacters.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="text-xl font-semibold">{meeting.started_at ? new Date(meeting.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not started"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* TTS Logs */}
          <Card>
            <CardHeader>
              <h3>Text-to-Speech History</h3>
              <p className="text-sm text-muted-foreground">All messages converted to speech during this meeting</p>
            </CardHeader>
            <CardContent>
              {ttsLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mic className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No TTS messages for this meeting yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ttsLogs.map((log, index) => (
                    <div key={log.id}>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Mic className="size-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <Badge variant="outline" className="text-xs">{log.voice_used}</Badge>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{log.text_length} characters</span>
                            {log.status === "failed" && (
                              <>
                                <span className="text-xs text-muted-foreground">·</span>
                                <Badge variant="outline" className="text-xs text-red-600">Failed</Badge>
                              </>
                            )}
                          </div>
                          <p className="text-sm">{log.text_input}</p>
                          {log.error_message && (
                            <p className="text-xs text-red-600 mt-1">
                              {formatTtsErrorMessage(log.error_message)}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < ttsLogs.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
