import { useState } from "react";
import { Link } from "react-router";
import { Calendar, Clock, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface MeetingCardProps {
  id: string;
  title: string;
  platform: string;
  scheduledAt?: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  duration?: number;
  meetingUrl: string;
  onDelete?: (id: string) => void | Promise<void>;
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export function MeetingCard({ 
  id, 
  title, 
  platform, 
  scheduledAt, 
  status, 
  duration, 
  meetingUrl,
  onDelete,
}: MeetingCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Not started";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/meetings/${id}`}>
              <h4 className="hover:text-blue-600 transition-colors">{title}</h4>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{platform}</p>
          </div>
          <Badge className={statusColors[status]}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>{new Date(scheduledAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/meetings/${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          {meetingUrl && meetingUrl !== "#" && (meetingUrl.startsWith("http://") || meetingUrl.startsWith("https://")) && (
            <Button variant="outline" size="sm" asChild>
              <a href={meetingUrl} target="_blank" rel="noopener noreferrer" aria-label="Open meeting link">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={(e) => {
                e.preventDefault();
                setDeleteDialogOpen(true);
              }}
              aria-label="Delete meeting"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    {onDelete && (
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{title}&quot; and any TTS logs linked to it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
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
    )}
  </>
  );
}
