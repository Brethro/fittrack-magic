
import { useState, useEffect } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useToast } from "@/hooks/use-toast";
import { useFoodLog } from "@/contexts/FoodLogContext";
import {
  CommandDialog,
  CommandList,
  Command,
} from "@/components/ui/command";
import { trackFoodSelection } from "@/services/foodSearchService";
import { SearchInput } from "@/components/diet/search/SearchInput";
import { RecentSearches } from "@/components/diet/search/RecentSearches";
import { SearchResults } from "@/components/diet/search/SearchResults";
import { SearchFooter } from "@/components/diet/search/SearchFooter";
import { useSearch } from "@/hooks/useSearch";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { toast } = useToast();
  const { usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  
  const { 
    searchQuery, 
    setSearchQuery,
    isLoading,
    mergedResults,
    recentSearches,
    handleSelectFood,
    handleSelectUsdaFood
  } = useSearch({ open, toast, usdaApiStatus });
  
  // Check USDA API connection when opened
  useEffect(() => {
    if (open) {
      checkUsdaApiConnection();
    }
  }, [open, checkUsdaApiConnection]);
  
  // Clear search data when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open, setSearchQuery]);
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[80vh] overflow-hidden flex flex-col">
        {/* Search Input */}
        <SearchInput 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <div className="overflow-y-auto flex-1">
          <Command className="h-full">
            <CommandList>
              {/* Recent Searches */}
              {!isLoading && searchQuery.length < 2 && recentSearches.length > 0 && (
                <RecentSearches 
                  recentSearches={recentSearches} 
                  onSelectSearch={setSearchQuery} 
                />
              )}
              
              {/* Search Results */}
              <SearchResults 
                isLoading={isLoading}
                searchQuery={searchQuery}
                mergedResults={mergedResults}
                onSelectFood={handleSelectFood}
                onSelectUsdaFood={handleSelectUsdaFood}
              />
            </CommandList>
          </Command>
        </div>
        
        {/* Footer with API status */}
        <SearchFooter usdaApiStatus={usdaApiStatus} />
      </div>
    </CommandDialog>
  );
}
