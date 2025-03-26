
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchResults } from "@/components/diet/search/SearchResults";
import { SearchFooter } from "@/components/diet/search/SearchFooter";
import { RecentSearches } from "@/components/diet/search/RecentSearches";
import RecentFoods from "@/components/diet/RecentFoods";
import { useSearch, SearchSource } from "@/hooks/useSearch";
import { useToast } from "@/hooks/use-toast";
import { UserPreferences } from "@/components/diet/FoodSearchForm";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  usdaApiStatus: string;
}

export function SearchPanel({ isOpen, onClose, usdaApiStatus }: SearchPanelProps) {
  const { toast } = useToast();
  const [searchSource, setSearchSource] = useState<SearchSource>("both");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferHighProtein: false,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shouldInitiateSearch = useRef(false);
  
  // Initialize search hook
  const { 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    mergedResults = [],
    recentSearches = [],
    handleSelectFood,
    handleSelectUsdaFood,
    handleSearchWithOptions,
    clearSearchResults
  } = useSearch({ 
    open: isOpen, 
    toast, 
    usdaApiStatus 
  });
  
  // Focus the input when the panel opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Short timeout to ensure the animation has started
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);
  
  // Close panel when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Clear results when panel is closed
  useEffect(() => {
    if (!isOpen) {
      clearSearchResults();
      setSearchQuery("");
    }
  }, [isOpen, clearSearchResults, setSearchQuery]);

  // Explicitly trigger search (used by recent searches)
  const handleExplicitSearch = useCallback((query: string) => {
    // Set the query which will trigger the useEffect in useSearch
    setSearchQuery(query);
    
    // Also mark that the search should be initiated
    shouldInitiateSearch.current = true;
  }, [setSearchQuery]);
  
  // Handle search source change
  const handleSourceChange = useCallback((source: SearchSource) => {
    setSearchSource(source);
    
    // Only trigger a search if there's already a query
    if (searchQuery.trim().length >= 2) {
      // Use setTimeout to ensure state is updated before search
      setTimeout(() => {
        handleSearchWithOptions(searchQuery, source, userPreferences);
      }, 10);
    }
  }, [searchQuery, handleSearchWithOptions, userPreferences]);
  
  return (
    <div className="w-full h-full glass-panel bg-card rounded-lg shadow-lg z-40 overflow-hidden flex flex-col">
      {/* Header with search bar */}
      <div className="p-3 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium">Search Foods</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Direct input field */}
        <div className="flex items-center border rounded-lg p-2 bg-background">
          <Search className="h-4 w-4 text-muted-foreground ml-2 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods..."
            className="flex-1 bg-transparent border-none outline-none text-sm h-9 px-2"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Search filters */}
        <div className="flex items-center space-x-2 mt-2">
          <Badge 
            variant={searchSource === "both" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => handleSourceChange("both")}
          >
            All Sources
          </Badge>
          <Badge 
            variant={searchSource === "openfoods" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => handleSourceChange("openfoods")}
          >
            Open Food Facts
          </Badge>
          <Badge 
            variant={searchSource === "usda" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => handleSourceChange("usda")}
          >
            USDA
          </Badge>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Recent Foods */}
        {searchQuery.length < 2 && (
          <RecentFoods />
        )}
        
        {/* Recent searches */}
        {Array.isArray(recentSearches) && recentSearches.length > 0 && searchQuery.length < 2 && !isLoading && (
          <RecentSearches 
            recentSearches={recentSearches} 
            onSelectSearch={handleExplicitSearch} 
          />
        )}
        
        {/* Search results */}
        <SearchResults 
          isLoading={isLoading}
          searchQuery={searchQuery}
          mergedResults={mergedResults}
          onSelectFood={handleSelectFood}
          onSelectUsdaFood={handleSelectUsdaFood}
        />
      </div>
      
      {/* Footer */}
      <SearchFooter 
        usdaApiStatus={usdaApiStatus}
        className="border-t"
      />
    </div>
  );
}
