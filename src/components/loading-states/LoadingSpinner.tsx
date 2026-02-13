import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <p className="mt-4 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
