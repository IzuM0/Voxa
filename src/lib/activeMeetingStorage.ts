const ACTIVE_MEETING_STORAGE_KEY = "voxa_active_meeting_id";

export function clearActiveMeetingStorage(): void {
  try {
    sessionStorage.removeItem(ACTIVE_MEETING_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getActiveMeetingId(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_MEETING_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setActiveMeetingId(meetingId: string): void {
  try {
    sessionStorage.setItem(ACTIVE_MEETING_STORAGE_KEY, meetingId);
  } catch {
    // ignore
  }
}
