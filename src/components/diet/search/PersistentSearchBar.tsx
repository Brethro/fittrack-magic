
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersistentSearchBarProps {
  onClick: () => void;
  isActive?: boolean;
}

export function PersistentSearchBar({ onClick, isActive = false }: PersistentSearchBarProps) {
  return (
    <div 
      className={`border ${isActive ? 'border-primary' : 'border-border/50'} rounded-full p-2 px-4 bg-background shadow-sm cursor-pointer flex items-center gap-2 hover:bg-accent/10 transition-colors`}
      onClick={onClick}
    >
      <Search className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground flex-1">Search for foods...</span>
      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hidden sm:inline-flex">
        Ctrl+K
      </Button>
    </div>
  );
}
