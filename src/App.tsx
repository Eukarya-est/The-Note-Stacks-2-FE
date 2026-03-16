import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import Index from "./pages/Index";
import Desk from "./pages/Desk";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const ThemeShortcut = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, setTheme]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="note-shelf-theme">
      <ThemeShortcut />
      <KeyboardShortcutsDialog />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/note/:noteId" element={<Index />} />
            <Route path="/desk" element={<Desk />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CookieConsent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
