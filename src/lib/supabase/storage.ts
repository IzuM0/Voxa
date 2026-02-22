/**
 * Supabase Storage utilities for avatar uploads
 */

import { getSupabaseClient } from "./client";

// Lazy initialization - get client when needed to avoid errors if env vars aren't set
function getSupabase() {
  return getSupabaseClient();
}

const AVATAR_BUCKET = "avatars";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, and WebP images are allowed",
    };
  }

  return { valid: true };
}

/**
 * Upload avatar image to Supabase Storage
 * @param userId - User ID (UUID)
 * @param file - Image file to upload
 * @returns Public URL of the uploaded avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file");
  }

  // Ensure we have an authenticated session
  const supabase = getSupabase();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error("You must be logged in to upload an avatar. Please sign in and try again.");
  }

  // Verify the userId matches the authenticated user
  if (sessionData.session.user.id !== userId) {
    throw new Error("You can only upload avatars for your own account.");
  }

  // Convert image to PNG format for consistency
  // We'll upload with the original extension but store as PNG path
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const fileName = `${userId}.png`; // Always use .png extension for consistency

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite existing file
    });

  if (error) {
    const msg = error?.message ?? String(error);
    console.error("Avatar upload error:", msg);
    
    // Provide helpful error message for bucket not found
    if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
      throw new Error(
        `Storage bucket '${AVATAR_BUCKET}' not found. Please create it in your Supabase dashboard:\n\n` +
        `1. Go to: Storage → Buckets\n` +
        `2. Click "New Bucket"\n` +
        `3. Name: ${AVATAR_BUCKET}\n` +
        `4. Enable "Public bucket"\n` +
        `5. Click "Create bucket"\n\n` +
        `Then set up storage policies for authenticated uploads.`
      );
    }
    
    // Provide helpful error message for RLS policy violations
    if (error.message?.includes("row-level security") || error.message?.includes("RLS") || error.message?.includes("policy")) {
      throw new Error(
        `Storage policy error: Upload blocked by Row Level Security (RLS) policies.\n\n` +
        `Please set up storage policies in Supabase:\n\n` +
        `1. Go to: Storage → Buckets → avatars → Policies\n` +
        `2. Create a policy for INSERT:\n` +
        `   - Name: "Allow authenticated upload"\n` +
        `   - Operation: INSERT\n` +
        `   - Roles: authenticated\n` +
        `   - Policy: bucket_id = 'avatars'::text\n\n` +
        `See SUPABASE_BUCKET_SETUP.md for detailed instructions.`
      );
    }
    
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded avatar");
  }

  return urlData.publicUrl;
}

/**
 * Delete avatar from Supabase Storage
 * @param userId - User ID (UUID)
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = getSupabase();
  const fileName = `${userId}.png`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([fileName]);

  if (error) {
    const msg = error?.message ?? String(error);
    console.error("Avatar deletion error:", msg);
    throw new Error(`Failed to delete avatar: ${error.message}`);
  }
}

/**
 * Get public URL for an avatar
 * @param userId - User ID (UUID)
 * @returns Public URL or null if avatar doesn't exist
 */
export function getAvatarUrl(userId: string): string | null {
  try {
    const supabase = getSupabase();
    const fileName = `${userId}.png`;
    const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(fileName);

    return data?.publicUrl || null;
  } catch {
    return null;
  }
}
