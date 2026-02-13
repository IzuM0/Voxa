import { Skeleton } from "../ui/skeleton";

export function SkeletonStats() {
  return (
    <div className="rounded-lg border border-border p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-32 mt-4" />
    </div>
  );
}
