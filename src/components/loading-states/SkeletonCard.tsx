import { Skeleton } from "../ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
