import { useState } from "react";
import { TTSComposer } from "../../components/tts/TTSComposer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { ErrorState } from "../../components/error-states/ErrorState";

export default function TTSDemo() {
  const [showError, setShowError] = useState<string | null>(null);

  const handleSpeech = async (text: string, options: any) => {
    console.log("TTS Options:", options);
    console.log("Text to speak:", text);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2">TTS Composer Demo</h1>
          <p className="text-muted-foreground">
            Test the Text-to-Speech composer with different states and configurations
          </p>
        </div>

        {/* Main Composer Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Full-Featured TTS Composer</CardTitle>
              </CardHeader>
              <CardContent>
                <TTSComposer
                  onSpeech={handleSpeech}
                  maxCharacters={500}
                  disabled={false}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Character counter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Voice selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Language options</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Speed control</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Pitch adjustment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Loading states</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Error handling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span>Success feedback</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowError("network-error")}
                >
                  Test Network Error
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowError("invalid-link")}
                >
                  Test Invalid Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowError("limit-exceeded")}
                >
                  Test Limit Exceeded
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowError(null)}
                >
                  Clear Errors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error States Demo */}
        {showError && (
          <Card>
            <CardHeader>
              <CardTitle>Error State Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorState
                type={showError as any}
                onRetry={() => setShowError(null)}
                onDismiss={() => setShowError(null)}
              />
            </CardContent>
          </Card>
        )}

        {/* State Variations */}
        <Tabs defaultValue="disabled">
          <TabsList>
            <TabsTrigger value="disabled">Disabled State</TabsTrigger>
            <TabsTrigger value="limited">Character Limit</TabsTrigger>
            <TabsTrigger value="compact">Compact Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="disabled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Disabled TTS Composer</CardTitle>
                <p className="text-sm text-muted-foreground">
                  When the meeting is not connected or user is offline
                </p>
              </CardHeader>
              <CardContent>
                <TTSComposer
                  onSpeech={handleSpeech}
                  maxCharacters={500}
                  disabled={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limited" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Character Limit</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Testing with a reduced character limit (100 characters)
                </p>
              </CardHeader>
              <CardContent>
                <TTSComposer
                  onSpeech={handleSpeech}
                  maxCharacters={100}
                  disabled={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compact Mode</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Smaller version for mobile or embedded contexts
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <TTSComposer
                    onSpeech={handleSpeech}
                    maxCharacters={200}
                    disabled={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Component Details */}
        <Card>
          <CardHeader>
            <CardTitle>Component Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">States Implemented</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Idle:</strong> Ready to accept input
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Generating:</strong> Converting text to speech
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Playing:</strong> Audio is being played in meeting
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Success:</strong> Speech completed successfully
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Error:</strong> Generation or playback failed
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <strong>Disabled:</strong> Not connected to meeting
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Visual Feedback</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Real-time character count with color-coded warnings</li>
                <li>Animated status banners for each state</li>
                <li>Progress bar during audio playback</li>
                <li>Pulsing indicators when voice is active</li>
                <li>Contextual button colors and icons</li>
                <li>Helper tooltips for advanced controls</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Controls Available</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>6 different voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)</li>
                <li>12 language selections</li>
                <li>Speed adjustment (0.5x - 2.0x)</li>
                <li>Pitch adjustment (0.5x - 2.0x)</li>
                <li>Collapsible advanced settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
