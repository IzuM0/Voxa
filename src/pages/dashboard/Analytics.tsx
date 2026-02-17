import { useState, useEffect } from "react";
import { DashboardNav } from "../../components/dashboard/DashboardNav";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Calendar, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyticsApi } from "../../lib/api";

const platformDisplayName: Record<string, string> = {
  "google-meet": "Google Meet",
  "microsoft-teams": "Microsoft Teams",
  "zoom": "Zoom",
  "other": "Other",
};

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<any[]>([]);
  const [platformDistribution, setPlatformDistribution] = useState<any[]>([]);
  const [voiceUsage, setVoiceUsage] = useState<any[]>([]);
  const [dailyActivity, setDailyActivity] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const [statsData, monthlyData, platformsData, voicesData, activityData] = await Promise.all([
        analyticsApi.getStats().catch(() => null),
        analyticsApi.getMonthly(6).catch(() => []),
        analyticsApi.getPlatforms().catch(() => []),
        analyticsApi.getVoices().catch(() => []),
        analyticsApi.getDailyActivity().catch(() => []),
      ]);

      setStats(statsData ?? null);

      const formattedMonthly = (monthlyData ?? []).map((m: any) => ({
        month: m.month && typeof m.month === "string"
          ? new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" })
          : "",
        meetings: Number(m.meetings) || 0,
        characters: Number(m.characters) || 0,
      }));
      setMonthlyUsage(formattedMonthly);

      const platformColors: Record<string, string> = {
        "google-meet": "#4285F4",
        "zoom": "#2D8CFF",
        "microsoft-teams": "#5059C9",
        "other": "#9CA3AF",
      };
      const formattedPlatforms = (platformsData ?? []).map((p: any) => ({
        name: platformDisplayName[p.platform] ?? (p.platform ? String(p.platform).charAt(0).toUpperCase() + String(p.platform).slice(1).replace(/-/g, " ") : "Other"),
        value: Number(p.percentage) || 0,
        color: platformColors[p.platform] ?? "#9CA3AF",
      }));
      setPlatformDistribution(formattedPlatforms);

      const formattedVoices = (voicesData ?? []).map((v: any) => ({
        voice: v.voice ? String(v.voice).charAt(0).toUpperCase() + String(v.voice).slice(1) : "Unknown",
        count: Number(v.count) || 0,
      }));
      setVoiceUsage(formattedVoices);

      setDailyActivity(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setHasError(true);
      setStats(null);
      setMonthlyUsage([]);
      setPlatformDistribution([]);
      setVoiceUsage([]);
      setDailyActivity([]);
      const message = err instanceof Error ? err.message : "";
      toast.error("Failed to load analytics", {
        description: message || "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="flex h-screen">
      <DashboardNav />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <ErrorBoundary>
          <div className="p-8">
          <div className="mb-8">
            <h1 className="mb-2">Analytics</h1>
            <p className="text-muted-foreground">Track your usage and meeting insights</p>
          </div>

          {hasError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-red-800">Could not load analytics. Please try again.</p>
              <Button variant="outline" size="sm" onClick={() => fetchData()} className="shrink-0">
                Retry
              </Button>
            </div>
          )}
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Meetings</p>
                    <p className="text-3xl font-bold">{isLoading ? "..." : (stats?.total_meetings != null ? String(stats.total_meetings) : "0")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total TTS Messages</p>
                    <p className="text-3xl font-bold">{isLoading ? "..." : (stats?.total_tts_messages != null ? Number(stats.total_tts_messages).toLocaleString() : "0")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-3xl font-bold">{isLoading ? "..." : stats != null ? ((Number(stats.total_duration_seconds) || 0) / 3600).toFixed(1) : "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Duration</p>
                    <p className="text-3xl font-bold">{isLoading ? "..." : stats != null ? `${Math.round((Number(stats.average_meeting_duration_seconds) || 0) / 60)}m` : "0m"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="usage" className="space-y-6">
            <TabsList>
              <TabsTrigger value="usage">Usage Trends</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="voices">Voice Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <h3>Monthly Meeting Trends</h3>
                  <p className="text-sm text-muted-foreground">Number of meetings over the last 6 months</p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                  ) : monthlyUsage.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="meetings" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h3>Character Usage Over Time</h3>
                  <p className="text-sm text-muted-foreground">Total characters used per month</p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                  ) : monthlyUsage.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="characters" stroke="#8B5CF6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="platforms" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3>Platform Distribution</h3>
                    <p className="text-sm text-muted-foreground">Meetings by platform</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                    ) : platformDistribution.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={platformDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {platformDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <h3>Platform Statistics</h3>
                    <p className="text-sm text-muted-foreground">Detailed breakdown by platform</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
                    ) : platformDistribution.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No platform data available</div>
                    ) : (
                      <div className="space-y-4">
                        {platformDistribution.map((platform) => (
                        <div key={platform.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{platform.name}</span>
                            <span className="text-sm text-muted-foreground">{platform.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${platform.value}%`,
                                backgroundColor: platform.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="voices" className="space-y-6">
              <Card>
                <CardHeader>
                  <h3>Voice Preference Analysis</h3>
                  <p className="text-sm text-muted-foreground">Most commonly used voices</p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                  ) : voiceUsage.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={voiceUsage} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="voice" type="category" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <h3>Weekly Activity Pattern</h3>
                  <p className="text-sm text-muted-foreground">Average messages per day of the week</p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
                  ) : dailyActivity.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="messages" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
