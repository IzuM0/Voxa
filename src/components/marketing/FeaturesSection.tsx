import { Mic, Waves } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon: Mic,
    title: "Real-Time Text-to-Speech",
    description: "Instantly convert text to natural-sounding speech in meetings.",
  },
  {
    icon: () => (
      <div className="size-12 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="6" width="18" height="18" rx="2" fill="#4285F4"/>
          <rect x="28" y="6" width="14" height="18" rx="2" fill="#34A853"/>
          <rect x="6" y="28" width="14" height="14" rx="2" fill="#FBBC04"/>
          <rect x="24" y="28" width="18" height="14" rx="2" fill="#EA4335"/>
        </svg>
      </div>
    ),
    title: "Seamless Integration",
    description: "Works with Google Meet and other platforms.",
  },
  {
    icon: Waves,
    title: "Customizable Voices",
    description: "Choose from a variety of voices to suit your style.",
  },
];

export function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-6">
                  {typeof feature.icon === 'function' ? (
                    <feature.icon />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <feature.icon className="size-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <h3 className="mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}