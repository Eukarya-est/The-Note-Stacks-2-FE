import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { AlertTriangle, Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

let mermaidIdCounter = 0;

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram = ({ chart }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { resolvedTheme } = useTheme();
  const idRef = useRef(`mermaid-${++mermaidIdCounter}`);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        // Clear previous render
        const id = idRef.current;
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
        setSvg(renderedSvg);
        setError(null);
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        setError(err?.message || "Failed to render diagram");
        setSvg("");
        // Clean up failed render element
        const el = document.getElementById(idRef.current);
        el?.remove();
      }
    };

    renderDiagram();
  }, [chart, resolvedTheme]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Mermaid Diagram Error
        </div>
        <pre className="overflow-x-auto text-xs text-muted-foreground">{chart}</pre>
        <p className="mt-2 text-xs text-destructive/80">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="group relative my-6 overflow-x-auto rounded-lg border border-border bg-card p-4">
        <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm"
            onClick={() => setExpanded(true)}
            title="Expand diagram"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm"
            onClick={handleCopy}
            title="Copy source"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div
          ref={containerRef}
          className="flex justify-center [&>svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto p-6">
          <div
            className="flex justify-center [&>svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MermaidDiagram;
