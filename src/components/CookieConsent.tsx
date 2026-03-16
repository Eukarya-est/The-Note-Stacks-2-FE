import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-muted-foreground flex-1">
            This site uses cookies for analytics and personalized ads.{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-foreground hover:text-primary transition-colors"
            >
              Learn more
            </a>
          </p>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={decline} className="flex-1 sm:flex-none">
              Decline
            </Button>
            <Button size="sm" onClick={accept} className="flex-1 sm:flex-none">
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
