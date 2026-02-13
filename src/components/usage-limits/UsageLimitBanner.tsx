import { AlertTriangle, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Link } from "react-router";

interface UsageLimitBannerProps {
  currentUsage: number;
  limit: number;
  type: "characters" | "meetings" | "hours";
  planName: string;
}

export function UsageLimitBanner({
  currentUsage,
  limit,
  type,
  planName,
}: UsageLimitBannerProps) {
  const percentage = (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const typeLabels = {
    characters: "characters",
    meetings: "meetings",
    hours: "hours",
  };

  const formatValue = (value: number) => {
    if (type === "characters") {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  if (!isNearLimit) return null;

  return (
    <Alert
      variant={isAtLimit ? "destructive" : "default"}
      className={`mb-6 ${
        isAtLimit
          ? "border-red-200 bg-red-50"
          : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <AlertTriangle className={`size-4 ${isAtLimit ? "text-red-600" : "text-yellow-600"}`} />
      <AlertTitle>
        {isAtLimit
          ? `${planName} Plan Limit Reached`
          : `Approaching ${planName} Plan Limit`}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div>
          <p className="text-sm mb-2">
            {isAtLimit
              ? `You've used all ${formatValue(limit)} ${typeLabels[type]} in your current billing cycle.`
              : `You've used ${formatValue(currentUsage)} of ${formatValue(limit)} ${typeLabels[type]} (${percentage.toFixed(0)}%) in your current billing cycle.`}
          </p>
          <Progress value={Math.min(percentage, 100)} className="h-2" />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Link to="/settings/billing">
            <Button
              size="sm"
              className={
                isAtLimit
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
            >
              <TrendingUp className="size-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
          {!isAtLimit && (
            <span className="text-xs text-muted-foreground">
              Resets on Feb 1, 2026
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
