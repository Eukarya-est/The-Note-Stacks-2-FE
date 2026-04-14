import { useEffect, useRef, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import MermaidDiagram from "@/components/MermaidDiagram";
import { useTheme } from "next-themes";
import "katex/dist/katex.min.css";
import "@/lib/highlightLanguages"; // Register additional syntax highlighting languages
import "highlight.js/styles/github-dark.css";
import { ArrowUp, Calendar, Edit, Eye, File, Loader2, List, ListX, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useMarkdownContent } from "@/hooks/useMarkdownContent";
import { useNoteViewCounts } from "@/hooks/useNoteViews";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import TableOfContents from "@/components/TableOfContents";
import StickyTocIndicator from "@/components/StickyTocIndicator";
import CodeBlockHeader from "@/components/CodeBlockHeader";

// Generate consistent ID from heading text
const generateHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\*([^*]+)\*/g, '$1') // Remove markdown emphasis *text*
    .replace(/`([^`]+)`/g, '$1')   // Remove inline code `text`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
};

// Helper function to recursively extract text content from React children
// Fixes [object Object] issue when copying code blocks
const extractTextFromChildren = (children: any): string => {
  if (typeof children === 'string') {
    return children;
  }
  
  if (typeof children === 'number') {
    return String(children);
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  
  if (children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  
  return '';
};

// Extract headings from markdown content (all levels), excluding code blocks and LaTeX
const extractHeadings = (content: string) => {
  // Remove fenced code blocks (``` or ~~~) before extracting headings
  let cleanedContent = content.replace(/^(```|~~~)[\s\S]*?^\1/gm, '');
  // Remove inline code blocks (`code`)
  cleanedContent = cleanedContent.replace(/`[^`]+`/g, '');
  // Remove LaTeX blocks (\begin{...} ... \end{...})
  cleanedContent = cleanedContent.replace(/\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, '');
  // Remove any remaining \begin{...} or \end{...} lines (handles nested environments)
  cleanedContent = cleanedContent.replace(/^\\(begin|end)\{[^}]+\}.*$/gm, '');

  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;
  
  while ((match = headingRegex.exec(cleanedContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateHeadingId(text);
    headings.push({ level, text, id });
  }
  
  return headings;
};

interface MarkdownFile {
  id: string;
  filename: string;
  filepath?: string;
  content?: string;
  category: string;
  contentNumber: number;
  revision: string;
  createdAt: string;
  revisedAt: string;
}

interface MarkdownViewerProps {
  file: MarkdownFile;
  totalContents: number;
  highlightOnMount?: boolean;
}

// Backend static file server URL
const BACKEND_STATIC_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/static`;

const MarkdownViewer = ({ file, totalContents, highlightOnMount }: MarkdownViewerProps) => {
  
  const headerRef = useRef<HTMLDivElement>(null);
  const { data: content, isLoading: contentLoading } = useMarkdownContent(
      file.content, // Use content from backend first
      file.filepath
  );
  const { data: viewCounts } = useNoteViewCounts();
  const { resolvedTheme } = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(() => {
    const stored = localStorage.getItem('markdown-show-line-numbers');
    return stored !== null ? stored === 'true' : true;
  });
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageZoom, setImageZoom] = useState(1);

  const viewCount = viewCounts?.[file.id] || 0;

  // Toggle line numbers with 'L' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setShowLineNumbers(prev => {
          const newValue = !prev;
          localStorage.setItem('markdown-show-line-numbers', String(newValue));
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamically load highlight.js theme based on current theme
  useEffect(() => {
    const loadHighlightTheme = async () => {
      const isDark = resolvedTheme === 'dark';
      if (isDark) {
        await import('highlight.js/styles/github-dark.css');
      } else {
        await import('highlight.js/styles/github.css');
      }
    };
    loadHighlightTheme();
  }, [resolvedTheme]);

  // Trigger highlight animation on mount when coming from search
  useEffect(() => {
    if (highlightOnMount) {
      setShowHighlight(true);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Remove highlight after animation completes
      const timer = setTimeout(() => setShowHighlight(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [highlightOnMount]);

  // Get the base directory of the current markdown file
  const baseDir = useMemo(() => {
    if (!file.filepath) return ''; //
    const pathParts = file.filepath.split('/');
    pathParts.pop(); // Remove filename
    return pathParts.join('/');
  }, [file.filepath]);

  // Resolve relative image path to storage URL
  const resolveImagePath = (src: string): string => {
    // Already absolute URL
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }

    console.log('Original src:', src);

    // Decode first in case the path is already URL-encoded
    let cleanPath = decodeURIComponent(src);
    console.log('After decode:', cleanPath);

    // Normalize backslashes to forward slashes (Windows-style paths)
    cleanPath = cleanPath.replace(/\\/g, '/');
    console.log('After backslash normalize:', cleanPath);

    // Remove leading ./ or .\ if present
    cleanPath = cleanPath.replace(/^\.\//, '').replace(/^\.\\/g, '');
    console.log('After leading dot removal:', cleanPath);

    // Remove any remaining leading slashes
    cleanPath = cleanPath.replace(/^\/+/, '');
    console.log('After leading slash removal:', cleanPath);

    // Determine base directory for images
    let finalBaseDir = baseDir;
    if (!finalBaseDir && file.category && file.category !== "Uncategorized") {
      // Use category name as base directory (e.g., "Linux" for Linux category)
      finalBaseDir = file.category;
    }
    console.log('Base directory:', finalBaseDir);

    // Construct full static server URL
    // Example: http://localhost:8080/static/Linux/imgs/grep-diagram.png
    const fullPath = finalBaseDir ? `${finalBaseDir}/${cleanPath}` : cleanPath;
    console.log('Full path before encoding:', fullPath);

    // URL encode the path properly, but keep slashes as slashes
    const encodedPath = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    console.log('Encoded path:', encodedPath);

    const finalUrl = `${BACKEND_STATIC_URL}/${encodedPath}`;
    console.log('Final URL:', finalUrl);

    return finalUrl;
  };

  // Track scroll position to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if content has [toc] marker, extract headings, and preprocess LaTeX
  const { hasToc, headings, processedContent } = useMemo(() => {
    if (!content) return { hasToc: false, headings: [], processedContent: content };
    
    const tocRegex = /^\[toc\]$/gim;
    const hasToc = tocRegex.test(content);
    const headings = hasToc ? extractHeadings(content) : [];
    
    // Remove [toc] marker from content
    let processed = content.replace(/^\[toc\]$/gim, '');
    
    // Wrap raw LaTeX environments (like \begin{equation}) in $$ delimiters for KaTeX
    // This handles Typora-style LaTeX blocks that don't use $$ delimiters
    processed = processed.replace(
      /(?<!\$\$\s*)(\\begin\{(equation|align|aligned|gather|matrix|bmatrix|pmatrix|vmatrix|cases|array)\*?\}[\s\S]*?\\end\{\2\*?\})(?!\s*\$\$)/g,
      '\n$$\n$1\n$$\n'
    );
    
    return { hasToc, headings, processedContent: processed };
  }, [content]);


  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      {/* Metadata Header */}
      <div 
        ref={headerRef}
        className={`mb-6 sm:mb-8 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm transition-shadow duration-300 ${showHighlight ? 'animate-highlight-pulse border-primary/50' : ''}`}
      >
        <div className="mb-4 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <h1 className="min-w-0 flex-1 text-xl sm:text-2xl font-bold text-primary break-words">{file.filename}</h1>
          <div className="flex shrink-0 items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <File className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">
              {file.contentNumber} / {totalContents}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Category:</span>
            <span className="text-muted-foreground">{file.category}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Revision:</span>
            <span className="text-muted-foreground">{file.revision}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Created:</span>
            <span className="text-muted-foreground truncate">{file.createdAt}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Revised:</span>
              <span className="text-muted-foreground truncate">{file.revisedAt}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Total views">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Markdown Content */}
      {contentLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : processedContent ? (
        <div className="markdown-content">
          {hasToc && <TableOfContents headings={headings} />}
          {hasToc && <StickyTocIndicator headings={headings} />}
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
            components={{
              h1: ({ children, ...props }: any) => {
                const id = generateHeadingId(String(children));
                return <h1 id={id} {...props}>{children}</h1>;
              },
              h2: ({ children, ...props }: any) => {
                const id = generateHeadingId(String(children));
                return <h2 id={id} {...props}>{children}</h2>;
              },
              h3: ({ children, ...props }: any) => {
                const id = generateHeadingId(String(children));
                return <h3 id={id} {...props}>{children}</h3>;
              },
              h4: ({ children, ...props }: any) => {
                const id = generateHeadingId(String(children));
                return <h4 id={id} {...props}>{children}</h4>;
              },
              h5: ({ children, ...props }: any) => {
                const id = generateHeadingId(String(children));
                return <h5 id={id} {...props}>{children}</h5>;
              },
              h6: ({ children, ...props }: any) => {
                const id = generateHeadingId(String(children));
                return <h6 id={id} {...props}>{children}</h6>;
              },
              pre({ children, ...props }: any) {
                // Extract the code element to get language info
                const codeElement = children?.props;
                const className = codeElement?.className || '';
                const match = /language-(\w+)/.exec(className);
                const language = match ? match[1] : null;
                const isMermaid = language === 'mermaid';

                if (isMermaid) {
                  return <>{children}</>;
                }

                // Only show header for code blocks with a language
                if (language) {
                  // Use the helper function to properly extract text from nested React elements
                  const codeContent = extractTextFromChildren(children).replace(/\n$/, '');

                  return (
                      <div className="code-block-container">
                        <CodeBlockHeader
                          language={language}
                          codeContent={codeContent}
                          showLineNumbers={showLineNumbers}
                          onToggleLineNumbers={() => {
                            setShowLineNumbers(prev => {
                              const newValue = !prev;
                              localStorage.setItem('markdown-show-line-numbers', String(newValue));
                              return newValue;
                            });
                          }}
                        />
                        <pre {...props}>{children}</pre>
                      </div>
                  );
                }

                return <pre {...props}>{children}</pre>;
              },
              code({ className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const isMermaid = match && match[1] === "mermaid";
                const isCodeBlock = match !== null;

                if (isMermaid) {
                  return <MermaidDiagram chart={String(children).replace(/\n$/, "")} />;
                }

                // For code blocks (with language), optionally add line numbers
                if (isCodeBlock) {
                  const codeString = String(children).replace(/\n$/, "");
                  const lines = codeString.split('\n');

                  return (
                      <code className={`${className} ${showLineNumbers ? 'code-with-lines' : ''}`} {...props}>
                        {showLineNumbers && (
                          <span className="line-numbers" aria-hidden="true">
                            {lines.map((_, i) => (
                              <span key={i}>{i + 1}</span>
                            ))}
                          </span>
                        )}
                        <span className={showLineNumbers ? "code-content" : ""}>{children}</span>
                      </code>
                  );
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              img({ src, alt, ...props }: any) {
                const resolvedSrc = resolveImagePath(src || '');
                return (
                  <img 
                    src={resolvedSrc} 
                    alt={alt || ''} 
                    loading="lazy"
                    className="cursor-zoom-in hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage({ src: resolvedSrc, alt: alt || '' })}
                    onError={(e) => {
                      // Log error for debugging
                      console.error('Image failed to load:', resolvedSrc);
                      // Optionally set a fallback image
                      // e.currentTarget.src = '/fallback-image.png';
                    }}
                    {...props}
                  />
                );
              },
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          No content available for this note.
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-opacity duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Image Detail Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => { if (!open) { setSelectedImage(null); setImageZoom(1); } }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none">
          <DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-background transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setImageZoom(prev => Math.max(0.25, prev - 0.25))}
                disabled={imageZoom <= 0.25}
                aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setImageZoom(1)}
                disabled={imageZoom === 1}
                aria-label="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setImageZoom(prev => Math.min(4, prev + 0.25))}
                disabled={imageZoom >= 4}
                aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="flex items-center bg-background/80 backdrop-blur-sm px-3 rounded-full text-sm font-medium">
              {Math.round(imageZoom * 100)}%
            </span>
          </div>

          {selectedImage && (
              <div
                  className="flex items-center justify-center w-full h-full overflow-auto"
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    setImageZoom(prev => Math.max(0.25, Math.min(4, prev + delta)));
                  }}
              >
                <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-w-none object-contain rounded-lg transition-transform duration-150"
                    style={{ transform: `scale(${imageZoom})` }}
                />
              </div>
          )}
          {selectedImage?.alt && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-foreground">
                {selectedImage.alt}
              </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarkdownViewer;
