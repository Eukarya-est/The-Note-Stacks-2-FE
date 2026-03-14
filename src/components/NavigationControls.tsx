import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavigationControlsProps {
  currentIndex: number;
  totalCount: number;
  fileNames: string[];
  onNavigate: (index: number) => void;
  onFileSelect: (fileName: string) => void;
}

const NavigationControls = ({
  currentIndex,
  totalCount,
  fileNames,
  onNavigate,
  onFileSelect,
}: NavigationControlsProps) => {
  const handleInputChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= totalCount) {
      onNavigate(num - 1);
    }
  };

  return (
    <div className="sticky top-14 sm:top-16 z-40 border-b border-border bg-card/95 backdrop-blur-sm p-2 sm:p-4 pl-12 sm:pl-16">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(Math.max(0, currentIndex - 5))}
            disabled={currentIndex === 0}
            className="nav-control h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="nav-control h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
            <Input
              type="number"
              min={1}
              max={totalCount}
              value={currentIndex + 1}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-14 sm:w-20 text-center h-8 sm:h-10 text-xs sm:text-sm"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">/ {totalCount}</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={currentIndex >= totalCount - 1}
            className="nav-control h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate(Math.min(totalCount - 1, currentIndex + 5))}
            disabled={currentIndex >= totalCount - 1}
            className="nav-control h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        
        <div className="flex-1 max-w-full sm:max-w-md">
          <Select
            value={fileNames[currentIndex]}
            onValueChange={(value) => {
              const index = fileNames.indexOf(value);
              if (index !== -1) onNavigate(index);
            }}
          >
            <SelectTrigger className="nav-control h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Select a file..." />
            </SelectTrigger>
            <SelectContent>
              {fileNames.map((fileName, index) => (
                <SelectItem key={index} value={fileName} className="text-xs sm:text-sm">
                  {fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;
