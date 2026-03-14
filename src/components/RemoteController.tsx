import { useState } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarkdownFile {
  id: string;
  name: string;
  title: string;
}

interface RemoteControllerProps {
  currentIndex: number;
  totalFiles: number;
  files: MarkdownFile[];
  onNavigate: (index: number) => void;
  onSelectFile: (fileId: string) => void;
}

export const RemoteController = ({
  currentIndex,
  totalFiles,
  files,
  onNavigate,
  onSelectFile,
}: RemoteControllerProps) => {
  const [inputValue, setInputValue] = useState((currentIndex + 1).toString());

  const handleFastBackward = () => {
    onNavigate(Math.max(0, currentIndex - 5));
  };

  const handlePrevious = () => {
    onNavigate(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    onNavigate(Math.min(totalFiles - 1, currentIndex + 1));
  };

  const handleFastForward = () => {
    onNavigate(Math.min(totalFiles - 1, currentIndex + 5));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 1 && num <= totalFiles) {
      onNavigate(num - 1);
    } else {
      setInputValue((currentIndex + 1).toString());
    }
  };

  // Get 5 files centered around current index
  const getVisibleFiles = () => {
    const start = Math.max(0, currentIndex - 2);
    const end = Math.min(totalFiles, start + 5);
    return files.slice(start, end);
  };

  return (
    <div className="sticky top-14 z-40 bg-card border-b border-border backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="px-6 py-4">
        {/* File selector */}
        <div className="mb-3">
          <Select value={files[currentIndex]?.id} onValueChange={onSelectFile}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a file" />
            </SelectTrigger>
            <SelectContent>
              {getVisibleFiles().map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  <span className="font-mono text-sm">{file.name}</span> -{" "}
                  {file.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFastBackward}
            disabled={currentIndex === 0}
            className="transition-smooth"
            title="Fast backward (5 files)"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="transition-smooth"
            title="Previous file"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-16 text-center"
              onFocus={(e) => e.target.select()}
            />
            <span className="text-sm text-muted-foreground">/ {totalFiles}</span>
          </form>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= totalFiles - 1}
            className="transition-smooth"
            title="Next file"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleFastForward}
            disabled={currentIndex >= totalFiles - 1}
            className="transition-smooth"
            title="Fast forward (5 files)"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
