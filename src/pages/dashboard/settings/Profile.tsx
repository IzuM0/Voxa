import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { useAuth } from "../../../auth/AuthProvider";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { userApi } from "../../../lib/api";
import { toast } from "sonner@2.0.3";
import { AvatarUpload } from "../../../components/profile/AvatarUpload";
import { getSupabaseClient } from "../../../lib/supabase/client";

export default function SettingsProfile() {
  const { user, provider } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        // Load from auth context (email comes from Supabase)
        if (user) {
          setEmail(user.email || "");
          setName(user.name || "");
        }

        // Load display name and avatar from our database
        try {
          const profile = await userApi.getProfile();
          if (profile?.display_name) {
            setName(profile.display_name);
          }
          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          }
        } catch (err) {
          // Profile might not exist yet, that's okay
          console.error("Failed to load profile:", err);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update display name in our database
      await userApi.updateProfile({
        display_name: name || null,
      });

      // Update email through Supabase
      if (email !== user?.email) {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.updateUser({ email });
        if (error) {
          throw new Error(`Failed to update email: ${error.message}`);
        }
      }

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile", {
        description: err.message || "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password too short", {
        description: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "New password and confirmation do not match.",
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw new Error(error.message);
      }

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update password", {
        description: err.message || "Unknown error",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone. All your meetings, TTS messages, and settings will be permanently deleted.")) {
      return;
    }

    if (!confirm("This is your last chance. Are you absolutely sure you want to delete your account?")) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete data from our database
      await userApi.deleteAccount();

      // Note: Supabase user deletion requires admin access (service role key)
      // Users cannot delete their own Supabase auth account via client SDK
      // The database data is deleted, but the Supabase auth account remains
      // User would need to contact support or use Supabase dashboard to delete auth account

      // Sign out and redirect
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      toast.success("Account deleted", {
        description: "Your account data has been deleted. Please contact support to delete your Supabase authentication account, or delete it manually from the Supabase dashboard.",
        duration: 5000,
      });

      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (err: any) {
      toast.error("Failed to delete account", {
        description: err.message || "Unknown error",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3>Profile Information</h3>
          <CardDescription>
            Update your account profile information and email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.id && (
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={avatarUrl}
              onAvatarUpdate={(url) => setAvatarUrl(url)}
              size="md"
            />
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h3>Change Password</h3>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input 
                id="new-password" 
                type={showNewPassword ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input 
                id="confirm-password" 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handlePasswordUpdate}
            disabled={isUpdatingPassword || !newPassword || !confirmPassword}
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader>
          <h3 className="text-red-600">Danger Zone</h3>
          <CardDescription>
            Permanently delete your account and all of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
