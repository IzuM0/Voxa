import { AlertTriangle, LogOut, Trash2, CreditCard, Power } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "leave-meeting" | "delete-account" | "change-billing" | "disconnect-integration";
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  isDestructive?: boolean;
  integrationName?: string;
}

const modalConfig = {
  "leave-meeting": {
    icon: LogOut,
    defaultTitle: "End Voxa session?",
    defaultDescription:
      "This will end your Voxa session for this meeting and return you to the meetings list. Your actual meeting (e.g. Google Meet) will continue in its tab until you leave it there.",
    confirmText: "End session",
    isDestructive: true,
  },
  "delete-account": {
    icon: Trash2,
    defaultTitle: "Delete Account?",
    defaultDescription:
      "This action cannot be undone. All your meeting history, preferences, and data will be permanently deleted. Your subscription will be cancelled immediately.",
    confirmText: "Delete Account",
    isDestructive: true,
  },
  "change-billing": {
    icon: CreditCard,
    defaultTitle: "Change Billing Plan?",
    defaultDescription:
      "Changing your plan will take effect immediately. Your new billing cycle will begin today and you'll be charged the prorated amount.",
    confirmText: "Confirm Change",
    isDestructive: false,
  },
  "disconnect-integration": {
    icon: Power,
    defaultTitle: "Disconnect Integration?",
    defaultDescription:
      "You will no longer be able to use this platform for meetings until you reconnect. Any scheduled meetings on this platform will not work.",
    confirmText: "Disconnect",
    isDestructive: true,
  },
};

export function ConfirmationModal({
  open,
  onOpenChange,
  type,
  onConfirm,
  title,
  description,
  confirmText,
  isDestructive,
  integrationName,
}: ConfirmationModalProps) {
  const config = modalConfig[type];
  const Icon = config.icon;

  const finalTitle =
    title ||
    (type === "disconnect-integration" && integrationName
      ? `Disconnect ${integrationName}?`
      : config.defaultTitle);

  const finalDescription = description || config.defaultDescription;
  const finalConfirmText = confirmText || config.confirmText;
  const finalIsDestructive = isDestructive !== undefined ? isDestructive : config.isDestructive;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                finalIsDestructive ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              <Icon
                className={`size-6 ${
                  finalIsDestructive ? "text-red-600" : "text-blue-600"
                }`}
              />
            </div>
            <AlertDialogTitle>{finalTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{finalDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              finalIsDestructive
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
            }
          >
            {finalConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
