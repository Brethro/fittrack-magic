
import { useState, useEffect } from "react";
import { X, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/diet/search/SearchInput";
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
    preferVegan: false
    // We removed 'preferLowCalorie' as it's not part of the UserPreferences type
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
            
            <SearchInput 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />
            
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
          
          {/* Content area with scrolling */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Recent Foods - at the top of the search panel */}
            <RecentFoods />
            
            {/* Recent searches - fixed prop name from onSelect to onSelectSearch */}
            {recentSearches.length > 0 && searchQuery.length < 2 && !isLoading && (
              <RecentSearches
                recentSearches={recentSearches}
                onSelectSearch={handleSearch}
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
          
          {/* Footer - removed className prop as it's not part of SearchFooterProps */}
          <SearchFooter 
            usdaApiStatus={usdaApiStatus}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
