import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Note Navigation",
    shortcuts: [
      { keys: ["←"], description: "Previous note" },
      { keys: ["→"], description: "Next note" },
      { keys: ["Shift", "←"], description: "Back 5 notes" },
      { keys: ["Shift", "→"], description: "Forward 5 notes" },
      { keys: ["Home"], description: "First note" },
      { keys: ["End"], description: "Last note" },
    ],
  },
  {
    title: "Category Navigation",
    shortcuts: [
      { keys: ["PageUp"], description: "Previous category" },
      { keys: ["PageDown"], description: "Next category" },
      { keys: ["\\"], description: "Toggle sidebar" },
    ],
  },
  {
    title: "Calendar (Desk)",
    shortcuts: [
      { keys: ["←"], description: "Previous month" },
      { keys: ["→"], description: "Next month" },
    ],
  },
  {
    title: "Viewer",
    shortcuts: [
      { keys: ["L"], description: "Toggle line numbers" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["/"], description: "Focus search" },
      { keys: ["Ctrl", "K"], description: "Focus search" },
      { keys: ["Ctrl", "D"], description: "Toggle dark/light mode" },
      { keys: ["Esc"], description: "Clear search / Close dialogs" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
];

export const KeyboardShortcutsDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === "?" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">?</kbd> to toggle this dialog
        </p>
      </DialogContent>
    </Dialog>
  );
};
