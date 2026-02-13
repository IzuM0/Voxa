import { Progress } from "../ui/progress";
import { Card, CardContent, CardHeader } from "../ui/card";

interface UsageIndicatorProps {
  title: string;
  currentUsage: number;
  limit: number;
  unit: string;
  icon?: React.ReactNode;
}

export function UsageIndicator({
  title,
  currentUsage,
  limit,
  unit,
  icon,
}: UsageIndicatorProps) {
  const percentage = (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-600";
    if (isNearLimit) return "bg-yellow-600";
    return "bg-blue-600";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-blue-600">{icon}</div>}
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <span
            className={`text-xs font-medium ${
              isAtLimit
                ? "text-red-600"
                : isNearLimit
                ? "text-yellow-600"
                : "text-muted-foreground"
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={Math.min(percentage, 100)} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {formatNumber(currentUsage)} / {formatNumber(limit)} {unit}
          </span>
          <span>
            {isAtLimit
              ? "Limit reached"
              : `${formatNumber(limit - currentUsage)} ${unit} remaining`}
          </span>
        </div>
        {isNearLimit && (
          <p className="text-xs text-yellow-600 mt-2">
            {isAtLimit
              ? "You've reached your plan limit. Upgrade to continue."
              : "You're approaching your plan limit."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
