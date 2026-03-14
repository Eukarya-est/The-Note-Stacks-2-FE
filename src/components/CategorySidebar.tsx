import { Folder, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  disableActiveAnimation?: boolean;
}

const CategorySidebar = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isCollapsed,
  onToggleCollapse,
  disableActiveAnimation = false,
}: CategorySidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setMobileOpen(false);
  };

  const CategoryList = ({ onSelect }: { onSelect: (category: string) => void }) => (
    <div className="space-y-1">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            "category-item flex w-full items-center gap-2 sm:gap-3 rounded-md px-2 sm:px-3 py-2 sm:py-2 text-sm transition-colors",
              selectedCategory === category && !disableActiveAnimation
              ? "active font-medium"
              : "text-sidebar-foreground",
          )}
        >
          <Folder className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{category}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile drawer trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-[4.5rem] left-3 z-50 rounded-full bg-background border-border hover:bg-primary hover:text-primary-foreground shadow-lg h-8 w-8 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-left">Stack</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="p-4">
              <CategoryList onSelect={handleCategorySelect} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleCollapse}
        className={cn(
          "fixed top-20 z-50 rounded-full bg-background border-border hover:bg-primary hover:text-primary-foreground shadow-lg h-10 w-10 hidden md:flex",
          isCollapsed ? "left-4" : "left-[17rem]",
        )}
      >
        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "sticky top-16 h-[calc(100vh-4rem)] border-r border-border bg-sidebar transition-all duration-300 hidden md:block",
          isCollapsed ? "w-0 overflow-hidden" : "w-64",
        )}
      >
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="mb-4 text-sm font-semibold text-sidebar-foreground">Stack</h2>
            <CategoryList onSelect={onCategorySelect} />
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default CategorySidebar;
