import { Link, useLocation, useNavigate } from "react-router";
import { Home, Calendar, Settings, BarChart3, LogOut, Mic } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../auth/AuthProvider";
import { useState, useEffect } from "react";
import { userApi } from "../../lib/api";
import { getActiveMeetingId } from "../../lib/activeMeetingStorage";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);

  // Show "Back to composer" when user has an active meeting and is not already on the live meeting page
  useEffect(() => {
    const id = getActiveMeetingId();
    setActiveMeetingId(id);
  }, [location.pathname]);

  // Load user profile (avatar and display name)
  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      try {
        const profile = await userApi.getProfile();
        if (profile) {
          setAvatarUrl(profile.avatar_url);
          setDisplayName(profile.display_name);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // 503 = database not configured or unavailable; nav still works with auth user name
        if (message.includes("Database") || message.includes("503")) {
          return;
        }
        console.error("Failed to load profile in nav:", message);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  const name = displayName || user?.name || "User";
  const email = user?.email ?? "—";
  const initials = (name || email || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-xl">Voxa</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {activeMeetingId && !location.pathname.startsWith("/livemeeting") && (
            <Link
              to={`/livemeeting?meetingId=${activeMeetingId}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              <Mic className="size-5" />
              <span>Back to composer</span>
            </Link>
          )}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="size-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-transparent">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-semibold text-blue-600">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}