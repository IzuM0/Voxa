import { Card, CardContent, CardHeader } from "../ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h4 className="text-sm text-muted-foreground">{title}</h4>
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="size-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {change && (
          <p className={`text-sm ${
            changeType === "positive" ? "text-green-600" : 
            changeType === "negative" ? "text-red-600" : 
            "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
