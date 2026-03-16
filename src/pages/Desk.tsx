import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import GoogleAdBanner, { GoogleAdBannerTablet, GoogleAdBannerMobile } from "@/components/GoogleAdBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { ReadOnlyCalendar } from "@/components/calendar/ReadOnlyCalendar";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const TECH_STACK_STORAGE_KEY = "desk-techstack-open";

const techStackCategories = [
  {
    category: "Frontend",
    items: [
      { name: "HTML", logo: "/tech-logos/html5.svg" },
      { name: "TailwindCSS", logo: "/tech-logos/tailwindcss.svg" },
      { name: "TypeScript", logo: "/tech-logos/typescript.svg" },
      { name: "React", logo: "/tech-logos/react.svg" },
    ],
  },
  {
    category: "Backend",
    items: [{ name: "Go", logo: "/tech-logos/go.svg" }],
  },
  {
    category: "Database",
    items: [{ name: "Redis", logo: "/tech-logos/redis.svg" }],
  },
  {
    category: "Infra",
    items: [
      { name: "AWS", logo: "/tech-logos/aws.svg" },
      { name: "Linux(Debian)", logo: "/tech-logos/debian.svg" },
      { name: "Docker", logo: "/tech-logos/docker.svg" },
      { name: "Docker Registry", logo: "/tech-logos/docker.svg" },
      { name: "Cloudflare", logo: "/tech-logos/cloudflare.svg" },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Python", logo: "/tech-logos/python.svg" },
      { name: "Git", logo: "/tech-logos/git.svg" },
      { name: "Github", logo: "/tech-logos/github.svg" },
      { name: "GithubAction", logo: "/tech-logos/githubactions.svg" },
    ],
  },
  {
    category: "Deprecated",
    items: [
      { name: "ElasticSearch", logo: "/tech-logos/elasticsearch.svg" },
      { name: "Nginx", logo: "/tech-logos/nginx.svg" },
    ],
  },
];

const Desk = () => {
  const [isTechStackOpen, setIsTechStackOpen] = useState(() => {
    const stored = localStorage.getItem(TECH_STACK_STORAGE_KEY);
    return stored !== null ? stored === "true" : true; // default open
  });

  useEffect(() => {
    localStorage.setItem(TECH_STACK_STORAGE_KEY, String(isTechStackOpen));
  }, [isTechStackOpen]);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <Navbar onSearch={() => {}} />
      <GoogleAdBannerTablet />

      <div className="flex">
        <main className="flex-1 min-w-0 p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Section */}
        <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-accent">
                <AvatarImage src="/profile.png" alt="Profile" />
                <AvatarFallback className="bg-accent/20 text-accent text-xl sm:text-2xl">
                  <User className="h-8 w-8 sm:h-10 sm:w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Eukarya</h2>
                <div className="flex justify-center sm:justify-start gap-4 text-sm">
                  <span className="icon-wrapper flex">
                    <a href="https://github.com/Eukarya-est">
                      <img src="/github.svg" alt="GitHub" className="h-6 w-6 sm:h-7 sm:w-7 dark:invert" />
                    </a>
                  </span>
                  <span className="icon-wrapper flex">
                    <a href="https://www.linkedin.com/in/dongkyun-park-306945258/">
                      <img src="/linkedin.svg" alt="LinkedIn" className="h-6 w-6 sm:h-7 sm:w-7 dark:invert" />
                    </a>
                  </span>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">© 2024. D.K Park. All rights reserved.</p>
                </div>

                {/* Tech Stack Collapsible Section */}
                <Collapsible open={isTechStackOpen} onOpenChange={setIsTechStackOpen} className="mt-4">
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {isTechStackOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span>About the Note Stacks</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                      The Note Stacks is produced with
                      <span className="tech-badge inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md cursor-default">
                        <img src="/tech-logos/lovable.svg" alt="Lovable" className="h-4 w-4" />
                        Lovable
                      </span>
                      and
                      <span className="tech-badge inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md cursor-default">
                        <img src="/tech-logos/claude.svg" alt="Claude" className="h-4 w-4" />
                        Claude
                      </span>
                    </p>
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        The Note Stacks made with:
                      </span>
                      <div className="space-y-2">
                        {techStackCategories.map((category) => (
                          <div key={category.category} className="flex flex-wrap items-center gap-2 border border-border rounded-lg p-2 transition-colors duration-200 hover:bg-accent/10 hover:border-accent/30">
                            <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0 border-r border-border pr-2">
                              {category.category}
                            </span>
                            {category.items.map((tech) => (
                              <span
                                key={tech.name}
                                className="tech-badge inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md text-xs font-medium cursor-default transition-all duration-200 hover:scale-105 hover:shadow-[0_0_12px_rgba(var(--accent),0.4)] hover:bg-accent/20"
                              >
                                <img src={tech.logo} alt={tech.name} className="h-4 w-4" />
                                {tech.name}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              Calendar Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <ReadOnlyCalendar />
          </CardContent>
        </Card>
      </main>

        <GoogleAdBanner />
      </div>
    </div>
  );
};

export default Desk;
