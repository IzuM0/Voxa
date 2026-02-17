import { createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Meetings from "./pages/dashboard/Meetings";
import MeetingDetail from "./pages/dashboard/MeetingDetail";
import LiveMeeting from "./pages/dashboard/LiveMeeting";
import Settings from "./pages/dashboard/Settings";
import SettingsProfile from "./pages/dashboard/settings/Profile";
import SettingsVoice from "./pages/dashboard/settings/Voice";
import SettingsBilling from "./pages/dashboard/settings/Billing";
import Analytics from "./pages/dashboard/Analytics";
import Help from "./pages/dashboard/Help";
import Features from "./pages/marketing/Features";
import Pricing from "./pages/marketing/Pricing";
import HowItWorks from "./pages/marketing/HowItWorks";
import TTSDemo from "./pages/demo/TTSDemo";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireGuest } from "./auth/RequireGuest";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "features", Component: Features },
      { path: "how-it-works", Component: HowItWorks },
      { path: "pricing", Component: Pricing },
      { path: "demo", Component: TTSDemo },

      // Guest-only auth pages
      {
        Component: RequireGuest,
        children: [
          { path: "signin", Component: SignIn },
          { path: "signup", Component: SignUp },
          { path: "forgot-password", Component: ForgotPassword },
        ],
      },

      // Protected app pages
      {
        Component: RequireAuth,
        children: [
          { path: "dashboard", Component: Dashboard },
          { path: "meetings", Component: Meetings },
          { path: "meetings/:id", Component: MeetingDetail },
          { path: "livemeeting", Component: LiveMeeting },
          {
            path: "settings",
            Component: Settings,
            children: [
              { index: true, Component: SettingsProfile },
              { path: "profile", Component: SettingsProfile },
              { path: "voice", Component: SettingsVoice },
              { path: "billing", Component: SettingsBilling },
            ],
          },
          { path: "analytics", Component: Analytics },
          { path: "help", Component: Help },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);