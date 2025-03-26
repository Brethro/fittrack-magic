
import { Clock } from "lucide-react";

interface RecentSearchesProps {
  recentSearches: string[];
  onSelectSearch: (search: string) => void;
}

export function RecentSearches({ recentSearches, onSelectSearch }: RecentSearchesProps) {
  if (!Array.isArray(recentSearches) || recentSearches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium mb-2">Recent Searches</h3>
      {recentSearches.map((search, index) => (
        <div 
          key={`recent-${index}`}
          className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent cursor-pointer"
          onClick={() => onSelectSearch(search)}
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{search}</span>
        </div>
      ))}
    </div>
  );
}
