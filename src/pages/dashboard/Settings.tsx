import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { User, Mic, CreditCard } from "lucide-react";

const settingsTabs = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Voice", href: "/settings/voice", icon: Mic },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect /settings to /settings/profile
  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/profile", { replace: true });
    }
  }, [location.pathname, navigate]);
  
  const currentPath = location.pathname === "/settings" ? "/settings/profile" : location.pathname;
  
  return (
    <div className="flex h-screen">
      <DashboardNav />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          
          <div className="flex gap-8">
            {/* Settings Sidebar */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const isActive = currentPath === tab.href;
                  return (
                    <Link
                      key={tab.name}
                      to={tab.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="size-5" />
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Settings Content */}
            <div className="flex-1 max-w-3xl">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
