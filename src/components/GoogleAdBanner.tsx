/**
 * Google Ad Banner Component
 * 
 * Responsive ad placements:
 * - Desktop (lg+): 160×600 vertical skyscraper on the right side
 * - Tablet (md-lg): 728×90 horizontal leaderboard between navbar and content
 * - Mobile (<md): 320×100 horizontal banner between navbar and content
 * 
 * To use real ads:
 * 1. Add the AdSense script to index.html
 * 2. Replace placeholder divs with actual <ins class="adsbygoogle" /> tags
 */

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

/** Desktop: 160×600 vertical skyscraper, sticky on the right */
export const GoogleAdBannerDesktop = () => (
  <aside className="hidden lg:block w-[160px] shrink-0 sticky top-20 h-fit self-start">
    <AdPlaceholder width={160} height={600} />
  </aside>
);

/** Tablet: 728×90 horizontal leaderboard */
export const GoogleAdBannerTablet = () => (
  <div className="hidden md:flex lg:hidden justify-center px-4 py-2">
    <AdPlaceholder width={728} height={90} className="w-full max-w-[728px]" />
  </div>
);

/** Mobile: 320×100 sticky bottom banner */
export const GoogleAdBannerMobile = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-center bg-background/80 backdrop-blur-sm border-t border-border px-3 py-1.5">
    <AdPlaceholder width={320} height={100} className="w-full max-w-[320px]" />
  </div>
);

/** Default export kept for backward compatibility (desktop sidebar) */
const GoogleAdBanner = GoogleAdBannerDesktop;
export default GoogleAdBanner;
