/**
 * Google Ad Banner Component
 * 
 * Placeholder for Google AdSense integration.
 * Replace the placeholder content with your actual AdSense ad unit code.
 * 
 * To use real ads:
 * 1. Add the AdSense script to index.html: <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>
 * 2. Replace the placeholder div below with your <ins class="adsbygoogle" ... /> tag
 */

const GoogleAdBanner = () => {
  return (
    <aside className="hidden lg:block w-[160px] shrink-0 sticky top-20 h-fit self-start">
      <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
        {/* Placeholder - replace with real AdSense code */}
        <div className="flex flex-col items-center justify-center min-h-[600px] p-3 text-center">
          <div className="w-full h-full min-h-[600px] rounded bg-muted/50 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              Advertisement
            </span>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            <span className="text-[9px] text-muted-foreground/40">160 × 600</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GoogleAdBanner;
