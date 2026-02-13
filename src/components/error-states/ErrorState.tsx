import { AlertCircle, WifiOff, Link2Off, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface ErrorStateProps {
  type: "invalid-link" | "unsupported-platform" | "network-error" | "limit-exceeded";
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const errorConfig = {
  "invalid-link": {
    icon: Link2Off,
    defaultTitle: "Invalid Meeting Link",
    defaultMessage: "The meeting link you provided is invalid or has expired. Please check the link and try again.",
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  "unsupported-platform": {
    icon: XCircle,
    defaultTitle: "Unsupported Platform",
    defaultMessage: "This meeting platform is not currently supported. We support Google Meet, Zoom, and Microsoft Teams.",
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  "network-error": {
    icon: WifiOff,
    defaultTitle: "Network Error",
    defaultMessage: "Unable to connect to the meeting. Please check your internet connection and try again.",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  "limit-exceeded": {
    icon: AlertCircle,
    defaultTitle: "Usage Limit Exceeded",
    defaultMessage: "You've reached your plan's usage limit. Upgrade your plan to continue using text-to-speech.",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
  },
};

export function ErrorState({ type, title, message, onRetry, onDismiss }: ErrorStateProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`size-10 ${config.iconColor}`} />
      </div>
      <h3 className="mb-2 text-center">{title || config.defaultTitle}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {message || config.defaultMessage}
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        )}
        {onDismiss && (
          <Button onClick={onDismiss} variant="outline">
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}

// Inline error banner component
interface ErrorBannerProps {
  type: "invalid-link" | "unsupported-platform" | "network-error" | "limit-exceeded";
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ type, title, message, onDismiss }: ErrorBannerProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <Alert variant="destructive" className="mb-6">
      <Icon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-4"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
