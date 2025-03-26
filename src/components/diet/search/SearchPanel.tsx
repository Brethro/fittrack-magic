
import { useState, useEffect } from "react";
import { X, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandInput, CommandList } from "@/components/ui/command";
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
  // Fixed UserPreferences object to match the expected type
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferHighProtein: false,
  });
  
  // Initialize search hook
  const { 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    mergedResults,
    recentSearches,
    handleSelectFood,
    handleSelectUsdaFood,
    handleSearchWithOptions
  } = useSearch({ 
    open: isOpen, 
    toast, 
    usdaApiStatus 
  });
  
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

  // Handle search
  const handleSearch = async (query: string) => {
    await handleSearchWithOptions(query, searchSource, userPreferences);
  };
  
  // Handle search source change
  const handleSourceChange = (source: SearchSource) => {
    setSearchSource(source);
    if (searchQuery.length >= 2) {
      handleSearchWithOptions(searchQuery, source, userPreferences);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-background border-t border-border/50 rounded-t-xl shadow-lg z-50 overflow-hidden flex flex-col"
        >
          {/* Header with search bar */}
          <div className="p-3 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium">Search Foods</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                placeholder="Search foods..."
                className="h-11"
              />
            </Command>
            
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
            <RecentFoods />
            
            <Command className="hidden">
              <CommandList>
                {/* Recent searches */}
                {recentSearches.length > 0 && searchQuery.length < 2 && !isLoading && (
                  <RecentSearches
                    recentSearches={recentSearches}
                    onSelectSearch={handleSearch}
                  />
                )}
              </CommandList>
            </Command>
            
            {/* Use a different approach for recent searches since we're outside CommandList */}
            {recentSearches.length > 0 && searchQuery.length < 2 && !isLoading && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Recent Searches</h3>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <div 
                      key={`recent-${index}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => handleSearch(search)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{search}</span>
                    </div>
                  ))}
                </div>
              </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
