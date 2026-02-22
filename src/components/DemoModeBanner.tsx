import { AlertTriangle } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 py-2 px-3 text-xs border-b border-amber-200/80 bg-amber-50/90 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>Demo mode — try everything without signing in.</span>
    </div>
  );
}
