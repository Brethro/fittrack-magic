
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  
  return (
    <div className="relative mb-4">
      {isLoading ? (
        <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        type="search"
        placeholder="Search foods..."
        className="pl-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery.length > 0 && (
        <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">
          {searchQuery.length < 2 ? "Type at least 2 characters" : "Searching..."}
        </div>
      )}
    </div>
  );
}
