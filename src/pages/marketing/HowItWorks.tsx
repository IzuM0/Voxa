import { MarketingNav } from "../../components/marketing/MarketingNav";
import { Footer } from "../../components/marketing/Footer";
import { Card, CardContent } from "../../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import {
  Keyboard,
  Sparkles,
  Mic,
  ArrowRight,
  Monitor,
  Laptop,
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* SECTION 1 — HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            How Voxa Works
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Turn your typed messages into natural AI speech in your virtual meetings.
          </p>
          <p className="text-lg text-muted-foreground">
            Voxa works alongside Zoom, Google Meet, and Microsoft Teams to help you speak effortlessly.
          </p>
        </div>
      </section>

      {/* SECTION 2 — 3 STEP FLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="border shadow-sm">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Keyboard className="size-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">
                  Type Your Message
                </h3>
                <p className="text-muted-foreground text-center">
                  Write what you want to say inside Voxa.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border shadow-sm">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="size-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">
                  AI Generates Your Voice
                </h3>
                <p className="text-muted-foreground text-center">
                  Voxa converts your text into natural-sounding speech instantly.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border shadow-sm">
              <CardContent className="pt-8 pb-8 px-6">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mic className="size-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">
                  Route Audio to Your Meeting
                </h3>
                <p className="text-muted-foreground text-center">
                  Use a virtual microphone so others in your meeting can hear it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SIMPLE FLOW DIAGRAM */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Flow Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
            <div className="flex items-center gap-4">
              <div className="px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold">
                Voxa AI
              </div>
              <ArrowRight className="size-6 text-muted-foreground hidden md:block" />
            </div>
            <div className="flex items-center gap-4">
              <div className="px-6 py-4 bg-muted rounded-lg font-semibold">
                Virtual Audio Cable
              </div>
              <ArrowRight className="size-6 text-muted-foreground hidden md:block" />
            </div>
            <div className="flex items-center gap-2">
              <div className="px-6 py-4 bg-muted rounded-lg font-semibold">
                Zoom / Meet / Teams
              </div>
            </div>
          </div>

          {/* Platform Logos */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 font-bold text-sm">GM</span>
              </div>
              <p className="text-xs text-muted-foreground">Google Meet</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-sm">Z</span>
              </div>
              <p className="text-xs text-muted-foreground">Zoom</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold text-sm">MS</span>
              </div>
              <p className="text-xs text-muted-foreground">Microsoft Teams</p>
            </div>
          </div>

          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Voxa runs alongside your meeting. You join your meeting normally in another tab.
          </p>
        </div>
      </section>

      {/* SECTION 4 — QUICK SETUP */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Setup</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="windows">
              <AccordionTrigger className="text-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="size-5" />
                  Windows Setup
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 text-muted-foreground pl-8">
                  <li className="list-disc">Install VB-Cable</li>
                  <li className="list-disc">
                    Select "CABLE Input" as Voxa's audio output
                  </li>
                  <li className="list-disc">
                    Select "CABLE Output" as your microphone in Zoom/Meet/Teams
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mac">
              <AccordionTrigger className="text-lg">
                <div className="flex items-center gap-3">
                  <Laptop className="size-5" />
                  Mac Setup
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 text-muted-foreground pl-8">
                  <li className="list-disc">Install BlackHole</li>
                  <li className="list-disc">
                    Select it as Voxa's audio output
                  </li>
                  <li className="list-disc">
                    Select it as microphone in your meeting
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
