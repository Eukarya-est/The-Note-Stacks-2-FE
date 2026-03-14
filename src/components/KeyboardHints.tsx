import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

const hints = [
  { keys: ["←", "→"], description: "Navigate" },
  { keys: ["/"], description: "Search" },
  { keys: ["?"], description: "All shortcuts" },
];

export const KeyboardHints = () => {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("keyboard-hints-dismissed");
    if (wasDismissed === "true") {
      setDismissed(true);
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    localStorage.setItem("keyboard-hints-dismissed", "true");
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 hidden md:block">
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 max-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Keyboard className="h-3 w-3" />
            <span>Shortcuts</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss hints"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-1.5">
          {hints.map((hint, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs gap-2"
            >
              <span className="text-muted-foreground truncate">
                {hint.description}
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {hint.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
