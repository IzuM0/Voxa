import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Loader2, Upload, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { uploadAvatar, validateImageFile } from "../../lib/supabase/storage";
import { userApi } from "../../lib/api";
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
} from "../ui/alert-dialog";

/** Default avatar image shown after reset (place file at public/images/default-avatar.png) */
export const DEFAULT_AVATAR_PATH = "/images/default-avatar.png";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  size?: "sm" | "md" | "lg";
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  onAvatarUpdate,
  size = "md",
}: AvatarUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [defaultImageFailed, setDefaultImageFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentAvatarUrl changes
  useEffect(() => {
    setPreviewUrl(currentAvatarUrl);
    if (currentAvatarUrl !== DEFAULT_AVATAR_PATH) setDefaultImageFailed(false);
  }, [currentAvatarUrl]);

  const isDefaultAvatar =
    !currentAvatarUrl || currentAvatarUrl === DEFAULT_AVATAR_PATH;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setUploadState("error");
      toast.error("Invalid file", {
        description: validation.error,
      });
      return;
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    try {
      setUploadState("uploading");

      // Upload to Supabase Storage
      const avatarUrl = await uploadAvatar(userId, file);

      // Update profile in database
      await userApi.updateProfile({ avatar_url: avatarUrl });

      // Clean up preview URL
      URL.revokeObjectURL(preview);

      // Update state
      setPreviewUrl(avatarUrl);
      setUploadState("success");
      onAvatarUpdate(avatarUrl);

      toast.success("Avatar updated successfully!");

      // Reset success state after 2 seconds
      setTimeout(() => {
        setUploadState("idle");
      }, 2000);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      
      // Check error type for better messaging
      const errorMessage = err.message || "Failed to upload avatar";
      const isBucketError = errorMessage.includes("Bucket not found") || errorMessage.includes("not found");
      const isPolicyError = errorMessage.includes("row-level security") || errorMessage.includes("RLS") || errorMessage.includes("policy");
      
      setError(errorMessage);
      setUploadState("error");
      
      // Revert preview on error
      URL.revokeObjectURL(preview);
      setPreviewUrl(currentAvatarUrl);

      // Show detailed error for different error types
      if (isBucketError) {
        toast.error("Storage bucket not configured", {
          description: "Please create the 'avatars' bucket in Supabase Storage. Check the error message below for instructions.",
          duration: 10000,
        });
      } else if (isPolicyError) {
        toast.error("Storage policy error", {
          description: "Please set up storage policies in Supabase. Check the error message below for instructions.",
          duration: 10000,
        });
      } else {
        toast.error("Failed to upload avatar", {
          description: errorMessage,
        });
      }
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    setError(null);
    setUploadState("idle");
    fileInputRef.current?.click();
  };

  const handleResetAvatar = async () => {
    try {
      setIsResetting(true);
      await userApi.updateProfile({ avatar_url: null });
      setDefaultImageFailed(false);
      setPreviewUrl(DEFAULT_AVATAR_PATH);
      onAvatarUpdate(DEFAULT_AVATAR_PATH);
      setResetDialogOpen(false);
      toast.success("Avatar reset to default");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset avatar";
      toast.error("Could not reset avatar", { description: message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-6">
        {/* Avatar Display */}
        <div className="relative">
          <div
            className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 ${
              uploadState === "success"
                ? "border-green-500"
                : uploadState === "error"
                ? "border-red-500"
                : "border-transparent"
            } transition-colors`}
          >
            {previewUrl && !(previewUrl === DEFAULT_AVATAR_PATH && defaultImageFailed) ? (
              <img
                src={previewUrl}
                alt="User profile avatar"
                className="w-full h-full object-cover"
                onError={() => {
                  if (previewUrl === DEFAULT_AVATAR_PATH) setDefaultImageFailed(true);
                }}
              />
            ) : (
              <span className={`font-semibold text-blue-600 ${
                size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-2xl"
              }`}>
                {userId.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Uploading overlay */}
          {uploadState === "uploading" && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="size-6 text-white animate-spin" />
            </div>
          )}

          {/* Success indicator */}
          {uploadState === "success" && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle2 className="size-4 text-white" />
            </div>
          )}
        </div>

        {/* Upload & Reset Buttons */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload avatar image"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleButtonClick}
              disabled={uploadState === "uploading"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadState === "uploading" ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : uploadState === "success" ? (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Uploaded
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Change Avatar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              disabled={isDefaultAvatar || uploadState === "uploading"}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <RotateCcw className="size-4 mr-2" />
              Remove / Reset
            </Button>
          </div>

          <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset avatar?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your profile photo will be set back to the default image. You can upload a new one anytime.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleResetAvatar();
                  }}
                  disabled={isResetting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset avatar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Error message */}
          {error && uploadState === "error" && (
            <div className="flex items-start gap-2 text-sm text-red-600 max-w-md">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Upload failed</p>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{error}</p>
                {(error.includes("Bucket not found") || error.includes("not found")) && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-700 dark:text-red-400">
                    <p className="font-medium mb-1">Quick Setup:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to Supabase Dashboard → Storage → Buckets</li>
                      <li>Click "New Bucket"</li>
                      <li>Name: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">avatars</code></li>
                      <li>Enable "Public bucket"</li>
                      <li>Click "Create bucket"</li>
                    </ol>
                  </div>
                )}
                {(error.includes("row-level security") || error.includes("RLS") || error.includes("policy")) && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs text-yellow-700 dark:text-yellow-400">
                    <p className="font-medium mb-1">Fix Storage Policies:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to Storage → Buckets → <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">avatars</code> → Policies</li>
                      <li>Click "New Policy" → "For full customization"</li>
                      <li>Name: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">Allow authenticated upload</code></li>
                      <li>Operation: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">INSERT</code></li>
                      <li>Roles: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">authenticated</code></li>
                      <li>Policy: <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">bucket_id = 'avatars'::text</code></li>
                      <li>Click "Review" → "Save policy"</li>
                    </ol>
                    <p className="mt-2 text-xs opacity-90">See SUPABASE_BUCKET_SETUP.md for full instructions.</p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-2 h-auto p-0 text-xs text-red-600 hover:text-red-700"
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {/* Help text */}
          {uploadState === "idle" && !error && (
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or WebP. Max 2MB.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
