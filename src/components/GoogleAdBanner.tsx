/**
 * Google Ad Banner Component
 * 
 * Responsive ad placements with collapse/expand toggle:
 * - Desktop (lg+): 160×600 vertical skyscraper on the right side
 * - Tablet (md-lg): 728×90 horizontal leaderboard between navbar and content
 * - Mobile (<md): 320×100 sticky bottom banner
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from "lucide-react";

const AdPlaceholder = ({ width, height, className }: { width: number; height: number; className?: string }) => (
  <div className={`rounded-lg border border-border bg-card/50 overflow-hidden ${className ?? ""}`}>
    <div className="flex flex-col items-center justify-center p-2" style={{ minHeight: height }}>
      <div
        className="w-full rounded bg-muted/50 flex flex-col items-center justify-center gap-1.5"
        style={{ height }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Advertisement
        </span>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/40"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 8 6 4-6 4Z" />
          </svg>
        </div>
        <span className="text-[9px] text-muted-foreground/40">{width} × {height}</span>
      </div>
    </div>
  </div>
);

const CollapseButton = ({ onClick, children, className }: { onClick: () => void; children: React.ReactNode; className?: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center rounded-md border border-border bg-card hover:bg-accent/20 text-muted-foreground hover:text-foreground transition-colors ${className ?? ""}`}
    aria-label="Toggle ad"
  >
    {children}
  </button>
);

/** Desktop: 160×600 vertical skyscraper, sticky on the right */
export const GoogleAdBannerDesktop = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className="hidden lg:block shrink-0 sticky top-20 h-fit self-start">
      {collapsed ? (
        <CollapseButton onClick={() => setCollapsed(false)} className="w-6 h-16 mr-1">
          <ChevronLeft className="h-3.5 w-3.5" />
        </CollapseButton>
      ) : (
        <div className="w-[160px] relative">
          <CollapseButton
            onClick={() => setCollapsed(true)}
            className="absolute -left-3 top-2 w-6 h-6 z-10 rounded-full shadow-sm"
          >
            <ChevronRight className="h-3 w-3" />
          </CollapseButton>
          <AdPlaceholder width={160} height={600} />
        </div>
      )}
    </aside>
  );
};

/** Tablet: 728×90 horizontal leaderboard */
export const GoogleAdBannerTablet = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="hidden md:flex lg:hidden justify-center px-4 py-2">
      {collapsed ? (
        <CollapseButton onClick={() => setCollapsed(false)} className="w-full max-w-[728px] h-7 gap-1">
          <ChevronDown className="h-3 w-3" />
          <span className="text-[10px]">Show Ad</span>
        </CollapseButton>
      ) : (
        <div className="relative w-full max-w-[728px]">
          <CollapseButton
            onClick={() => setCollapsed(true)}
            className="absolute -top-1 right-1 w-5 h-5 z-10 rounded-full shadow-sm"
          >
            <X className="h-3 w-3" />
          </CollapseButton>
          <AdPlaceholder width={728} height={90} className="w-full max-w-[728px]" />
        </div>
      )}
    </div>
  );
};

/** Mobile: 320×100 sticky bottom banner */
export const GoogleAdBannerMobile = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-center bg-background/80 backdrop-blur-sm border-t border-border">
      {collapsed ? (
        <CollapseButton onClick={() => setCollapsed(false)} className="w-full h-7 rounded-none border-x-0 border-b-0 gap-1">
          <ChevronUp className="h-3 w-3" />
          <span className="text-[10px]">Show Ad</span>
        </CollapseButton>
      ) : (
        <div className="relative px-3 py-1.5">
          <CollapseButton
            onClick={() => setCollapsed(true)}
            className="absolute -top-1 right-4 w-5 h-5 z-10 rounded-full shadow-sm"
          >
            <X className="h-3 w-3" />
          </CollapseButton>
          <AdPlaceholder width={320} height={100} className="w-full max-w-[320px]" />
        </div>
      )}
    </div>
  );
};

/** Default export kept for backward compatibility (desktop sidebar) */
const GoogleAdBanner = GoogleAdBannerDesktop;
export default GoogleAdBanner;
