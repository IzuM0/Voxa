import { MarketingNav } from "../components/marketing/MarketingNav";
import { Hero } from "../components/marketing/Hero";
import { Features } from "../components/marketing/FeaturesSection";
import { PlatformIntegrations } from "../components/marketing/PlatformIntegrations";
import { Footer } from "../components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <Hero />
      <Features />
      <PlatformIntegrations />
      <Footer />
    </div>
  );
}
