
import { useState, useEffect } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useToast } from "@/hooks/use-toast";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
} from "@/components/ui/command";
import { Search, Plus, History, Star, Database, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { FoodSearchResultsSkeleton, UnifiedFoodResults } from "./FoodSearchResults";
import { UsdaFoodItem } from "@/utils/usdaApi";
import {
  searchOpenFoodFacts,
  searchUsdaDatabase,
  searchWithFallback,
  trackFoodSelection
} from "@/services/foodSearchService";
import { UserPreferences } from "./FoodSearchForm";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { toast } = useToast();
  const { usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodItem[]>([]);
  const [mergedResults, setMergedResults] = useState<Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("fitTrackRecentSearches");
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(parsedSearches);
      } catch (error) {
        console.error("Error parsing recent searches:", error);
      }
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (!query || query.trim().length < 2) return;
    
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("fitTrackRecentSearches", JSON.stringify(updatedSearches));
  };
  
  // Check USDA API connection when opened
  useEffect(() => {
    if (open) {
      checkUsdaApiConnection();
    }
  }, [open, checkUsdaApiConnection]);
  
  // Update merged results whenever search results or USDA results change
  useEffect(() => {
    if (searchResults.length > 0 || usdaResults.length > 0) {
      const merged = mergeAndSortResults(searchResults, usdaResults);
      setMergedResults(merged);
    } else {
      setMergedResults([]);
    }
  }, [searchResults, usdaResults]);
  
  // Function to merge and sort results by score
  const mergeAndSortResults = (offResults: any[], usdaItems: UsdaFoodItem[]) => {
    const merged: Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}> = [];
    
    // Add Open Food Facts results
    offResults.forEach(product => {
      // Get the search score (default to 0 if not available)
      const score = typeof product._searchScore === 'number' ? product._searchScore : 0;
      merged.push({
        type: 'openfoodfacts',
        item: product,
        score
      });
    });
    
    // Add USDA results
    usdaItems.forEach(foodItem => {
      // Get the search score (default to 0 if not available)
      const score = typeof (foodItem as any)._searchScore === 'number' ? (foodItem as any)._searchScore : 0;
      merged.push({
        type: 'usda',
        item: foodItem,
        score
      });
    });
    
    // Sort by score (highest first)
    return merged.sort((a, b) => b.score - a.score);
  };
  
  // Track selected food to improve future search results
  const handleFoodSelection = (foodName: string) => {
    trackFoodSelection(foodName);
  };
  
  // Handle selecting a food from search results
  const handleSelectFood = (food: any) => {
    if (food && food.product_name) {
      handleFoodSelection(food.product_name);
    }
  };
  
  // Handle selecting a USDA food
  const handleSelectUsdaFood = (food: UsdaFoodItem) => {
    if (food && food.description) {
      handleFoodSelection(food.description);
    }
  };
  
  // Perform search when query changes
  const handleSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setUsdaResults([]);
      return;
    }
    
    setIsLoading(true);
    setSearchResults([]);
    setUsdaResults([]);
    saveRecentSearch(query);
    
    try {
      // Always use both sources
      const searchSource = "both"; 
      const searchType = "broad";
      const userPreferences: UserPreferences = {}; // Default preferences
      
      // Search in Open Food Facts
      if (searchSource === "openfoods" || searchSource === "both") {
        let offResults = await searchOpenFoodFacts(query, searchType, userPreferences);
        
        // If broad search returns no results, try fallback search
        if (offResults.length === 0) {
          console.log("Broad search returned no results, trying fallback search");
          const fallbackResults = await searchWithFallback(encodeURIComponent(query.trim()));
          if (fallbackResults.length > 0) {
            offResults = fallbackResults;
            toast({
              title: "Limited results found",
              description: "We found some items that might match what you're looking for.",
            });
          }
        }
        
        // Update search results
        setSearchResults(offResults);
      }
      
      // Search in USDA if not rate limited
      if ((searchSource === "usda" || searchSource === "both") && usdaApiStatus !== "rate_limited") {
        try {
          const usdaSearchResults = await searchUsdaDatabase(query, userPreferences);
          setUsdaResults(usdaSearchResults);
        } catch (error) {
          console.error("USDA search error:", error);
          
          // Check if it's a rate limit error
          if (error instanceof Error && 
              (error.message.includes("OVER_RATE_LIMIT") || 
               error.message.includes("rate limit") || 
               error.message.includes("429"))) {
            toast({
              title: "USDA API rate limited",
              description: "You've reached the USDA API rate limit. Only showing Open Food Facts results.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "USDA search failed",
              description: `Could not fetch USDA food data: ${error instanceof Error ? error.message : "Unknown error"}`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: `Could not fetch food data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Clear search data when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setUsdaResults([]);
      setMergedResults([]);
    }
  }, [open]);
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[80vh] overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="border-b shadow-sm">
          <CommandInput 
            placeholder="Search foods..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </div>
        
        <div className="overflow-y-auto flex-1">
          <Command className="h-full">
            <CommandList>
              <CommandEmpty>
                {isLoading ? (
                  <div className="p-4">
                    <FoodSearchResultsSkeleton />
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
                  </div>
                )}
              </CommandEmpty>
              
              {/* Recent Searches */}
              {!isLoading && searchQuery.length < 2 && recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((search, index) => (
                    <CommandItem 
                      key={`recent-${index}`}
                      onSelect={() => setSearchQuery(search)}
                      className="flex items-center gap-2 py-3"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Search Results */}
              {isLoading ? (
                <div className="p-4">
                  <FoodSearchResultsSkeleton />
                </div>
              ) : mergedResults.length > 0 ? (
                <div className="p-2">
                  <UnifiedFoodResults 
                    mergedResults={mergedResults}
                    onSelectFood={handleSelectFood}
                    onSelectUsdaFood={handleSelectUsdaFood}
                  />
                </div>
              ) : null}
            </CommandList>
          </Command>
        </div>
        
        {/* Footer with API status */}
        {usdaApiStatus === "rate_limited" && (
          <div className="p-2 text-xs text-amber-700 bg-amber-50 border-t">
            USDA API rate limit reached. Only showing Open Food Facts results.
          </div>
        )}
      </div>
    </CommandDialog>
  );
}
