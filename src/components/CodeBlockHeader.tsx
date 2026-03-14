import { useState } from "react";
import { Copy, Check, List, ListX } from "lucide-react";

interface CodeBlockHeaderProps {
  language: string;
  codeContent: string;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
}

const CodeBlockHeader = ({ 
  language, 
  codeContent, 
  showLineNumbers, 
  onToggleLineNumbers 
}: CodeBlockHeaderProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block-header">
      <span className="code-language">{language}</span>
      <div className="code-block-actions">
        <button
          onClick={handleCopy}
          className="code-action-button"
          title={copied ? "Copied!" : "Copy code"}
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          onClick={onToggleLineNumbers}
          className="code-action-button"
          title={showLineNumbers ? "Hide line numbers (L)" : "Show line numbers (L)"}
          aria-label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
        >
          {showLineNumbers ? <ListX className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default CodeBlockHeader;
