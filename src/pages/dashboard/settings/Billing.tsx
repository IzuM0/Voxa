import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Check, CreditCard, AlertCircle } from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { analyticsApi } from "../../../lib/api";
import { toast } from "sonner@2.0.3";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "10,000 characters/month",
      "Basic voice options",
      "Google Meet integration",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    features: [
      "100,000 characters/month",
      "All premium voices",
      "All platform integrations",
      "Priority support",
    ],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited characters",
      "Custom voice training",
      "Team management",
      "Dedicated support",
    ],
  },
];

export default function SettingsBilling() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load usage stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Default plan (Pro) - in future, this could come from user settings
  const currentPlan = {
    name: "Pro",
    price: "$19",
    charactersUsed: stats?.total_characters || 0,
    charactersLimit: 100000,
    billingCycle: "Monthly",
    nextBillingDate: "2026-02-28",
  };

  const usagePercentage = (currentPlan.charactersUsed / currentPlan.charactersLimit) * 100;
  
  return (
    <div className="space-y-6">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="size-5 text-amber-600" />
        <AlertDescription>
          <strong>Payment integration coming soon.</strong> Usage limits shown below are for display only and are not yet enforced.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <h3>Current Plan</h3>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h4>{currentPlan.name} Plan</h4>
                <Badge className="bg-blue-100 text-blue-700">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currentPlan.price}/month · {currentPlan.billingCycle}
              </p>
            </div>
            <Button variant="outline" onClick={() => document.getElementById("available-plans")?.scrollIntoView({ behavior: "smooth" })}>
              Change Plan
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm">Character Usage</p>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${currentPlan.charactersUsed.toLocaleString()} / ${currentPlan.charactersLimit.toLocaleString()}`}
              </p>
            </div>
            <Progress value={Math.min(100, Math.max(0, usagePercentage))} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {isLoading ? "Loading..." : `${Math.max(0, 100 - usagePercentage).toFixed(0)}% remaining this billing cycle`}
            </p>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next billing date</span>
            <span>{new Date(currentPlan.nextBillingDate).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h3>Payment Method</h3>
          <CardDescription>
            Manage your payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Payment methods and real billing are not yet available. The options below are placeholders.
          </p>
          <div className="flex items-center gap-4 p-4 border rounded-lg opacity-60">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
              <CreditCard className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/2027 (placeholder)</p>
            </div>
            <Badge className="bg-green-100 text-green-700">Default</Badge>
          </div>
          
          <Button variant="outline" className="w-full" disabled onClick={() => toast.info("Payment integration coming soon.")}>
            Add Payment Method (coming soon)
          </Button>
        </CardContent>
      </Card>
      
      <Card id="available-plans">
        <CardHeader>
          <h3>Available Plans</h3>
          <CardDescription>
            Upgrade or downgrade your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-4 border rounded-lg ${
                  plan.current ? "border-blue-600 bg-blue-50" : ""
                }`}
              >
                <div className="mb-4">
                  <h4 className="mb-1">{plan.name}</h4>
                  <p className="text-2xl font-bold">{plan.price}</p>
                  {plan.price !== "Custom" && <p className="text-sm text-muted-foreground">/month</p>}
                </div>
                
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                  onClick={() => {
                    if (plan.current) return;
                    if (plan.price === "Custom") {
                      window.location.href = "mailto:sales@voxa.example.com?subject=Enterprise plan";
                    } else {
                      toast.info("Upgrade flow coming soon.");
                    }
                  }}
                >
                  {plan.current ? "Current Plan" : plan.price === "Custom" ? "Contact Sales" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
