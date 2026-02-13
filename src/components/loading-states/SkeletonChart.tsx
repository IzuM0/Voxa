import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";

export function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-end gap-2 h-12">
              <Skeleton
                className="w-full rounded-t"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
