import { MarketingNav } from "../../components/marketing/MarketingNav";
import { Footer } from "../../components/marketing/Footer";
import { Mic, Settings, BarChart3, Zap, Shield, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

const features = [
  {
    icon: Mic,
    title: "Natural Voice Synthesis",
    description: "Powered by OpenAI's advanced TTS API, delivering human-like speech quality with multiple voice options.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Instant text-to-speech conversion with minimal latency for seamless meeting participation.",
  },
  {
    icon: Settings,
    title: "Voice Customization",
    description: "Adjust voice, speed, and pitch to match your preferences and speaking style.",
  },
  {
    icon: Users,
    title: "Multi-Platform Support",
    description: "Works with Google Meet, Zoom, Microsoft Teams, and other popular meeting platforms.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description: "Track your meeting history, TTS usage, and get insights into your speaking patterns.",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Your data is encrypted and secure. We never store meeting content or share your information.",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="mb-4">Powerful Features for Every Meeting</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to participate confidently in virtual meetings
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="size-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
