
import { useEffect, useState } from "react";
import { Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentSearchesProps {
  recentSearches: string[];
  onSelectSearch: (query: string) => void;
}

export function RecentSearches({ 
  recentSearches, 
  onSelectSearch 
}: RecentSearchesProps) {
  // Only render if we have recent searches
  if (!Array.isArray(recentSearches) || recentSearches.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2 mb-5">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        Recent Searches
      </h3>
      
      <div className="flex flex-wrap gap-1.5">
        {recentSearches.map((query, index) => (
          <Button
            key={`${query}-${index}`}
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => {
              // Use a callback to ensure this function is completely separated from event handlers
              setTimeout(() => {
                onSelectSearch(query);
              }, 0);
            }}
          >
            <Search className="h-3 w-3 mr-1.5 text-muted-foreground" />
            {query}
          </Button>
        ))}
      </div>
    </div>
  );
}
