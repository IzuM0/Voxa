import { Link } from "react-router";
import { Button } from "../ui/button";
import { Play, Mic, Waves } from "lucide-react";
import heroImage from "figma:asset/ff4765ca525ad369eb89dbe52a4e550d18fcb78d.png";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Give Your Silence a Voice in Every Virtual Meeting.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              Voxa AI empowers you to communicate effortlessly in virtual meetings. Type your message and let our advanced AI convert it into natural-sounding speech in real-time ensuring accessibility and inclusion for everyone.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="size-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right column - Illustration */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-8 overflow-hidden">
              {/* Person illustration placeholder */}
              <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-48 h-48 bg-blue-300 rounded-full flex items-center justify-center mb-8">
                  <div className="w-32 h-32 bg-blue-400 rounded-full flex items-center justify-center">
                    <Mic className="size-16 text-white" />
                  </div>
                </div>
                
                {/* Speech bubble */}
                <div className="absolute top-20 right-20 bg-white rounded-2xl p-4 shadow-lg">
                  <Waves className="size-8 text-blue-600" />
                </div>
              </div>
              
              {/* Waveform animation */}
              <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 pb-4">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500/30 rounded-full"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}