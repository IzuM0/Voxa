import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

const QUICK_PHRASES = [
  "Thank you everyone",
  "I agree",
  "Good point",
  "Can you repeat that?",
  "I have a question",
  "One moment please",
  "Yes, that's correct",
  "Let me think about that",
] as const;

interface QuickPhrasesProps {
  onSelect: (phrase: string) => void;
  disabled?: boolean;
}

export function QuickPhrases({ onSelect, disabled }: QuickPhrasesProps) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquare className="size-3.5 text-muted-foreground" />
        Quick Phrases
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        {QUICK_PHRASES.map((phrase) => (
          <Button
            key={phrase}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(phrase)}
            className="h-8 justify-start text-left font-normal"
          >
            {phrase}
          </Button>
        ))}
      </div>
    </div>
  );
}
