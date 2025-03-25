
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { Clock } from "lucide-react";

interface RecentSearchesProps {
  recentSearches: string[];
  onSelectSearch: (search: string) => void; // Changed from onSelect to onSelectSearch
}

export function RecentSearches({ recentSearches, onSelectSearch }: RecentSearchesProps) {
  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Recent Searches">
      {recentSearches.map((search, index) => (
        <CommandItem 
          key={`recent-${index}`}
          onSelect={() => onSelectSearch(search)}
          className="flex items-center gap-2 py-3"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{search}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
