
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FoodSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export function FoodSearchBar({ 
  searchQuery, 
  setSearchQuery, 
  onSearch,
  isLoading = false
}: FoodSearchBarProps) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  
  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2 && onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="relative mb-2">
      <div className="glass-panel p-3 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
        <h3 className="text-base font-medium mb-2">Search Foods Database</h3>
        <div className="relative flex items-center">
          {isLoading ? (
            <Loader2 className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
          )}
          <Input
            type="search"
            placeholder="Type to search Open Food Facts..."
            className="pl-10 pr-10 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery.length > 0 && (
          <div className="mt-2 text-xs text-foreground">
            {searchQuery.length < 2 ? (
              "Type at least 2 characters to search"
            ) : isLoading ? (
              "Searching Open Food Facts database..."
            ) : (
              "Showing search results from Open Food Facts"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
