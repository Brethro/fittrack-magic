
import { useState, useEffect, useCallback, useRef } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { UsdaFoodItem } from "@/utils/usdaApi";
import {
  searchOpenFoodFacts,
  searchUsdaDatabase,
  searchWithFallback,
  trackFoodSelection
} from "@/services/foodSearchService";
import { UserPreferences } from "@/components/diet/FoodSearchForm";

// Define the search source type explicitly to avoid type errors
export type SearchSource = "both" | "openfoods" | "usda";

interface UseSearchProps {
  open: boolean;
  toast: any;
  usdaApiStatus: string;
}

export function useSearch({ open, toast, usdaApiStatus }: UseSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodItem[]>([]);
  const [mergedResults, setMergedResults] = useState<Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("fitTrackRecentSearches");
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error("Error parsing recent searches:", error);
        setRecentSearches([]);
      }
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return;
    
    // Ensure recentSearches is an array
    const currentSearches = Array.isArray(recentSearches) ? recentSearches : [];
    const updatedSearches = [query, ...currentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("fitTrackRecentSearches", JSON.stringify(updatedSearches));
  }, [recentSearches]);
  
  // Update merged results whenever search results or USDA results change
  useEffect(() => {
    // Ensure both arrays are defined before merging
    const offResultsArray = Array.isArray(searchResults) ? searchResults : [];
    const usdaResultsArray = Array.isArray(usdaResults) ? usdaResults : [];
    
    if (offResultsArray.length > 0 || usdaResultsArray.length > 0) {
      const merged = mergeAndSortResults(offResultsArray, usdaResultsArray);
      setMergedResults(merged);
    } else {
      setMergedResults([]);
    }
  }, [searchResults, usdaResults]);
  
  // Function to merge and sort results by score
  const mergeAndSortResults = (offResults: any[], usdaItems: UsdaFoodItem[]) => {
    const merged: Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}> = [];
    
    // Add Open Food Facts results
    if (Array.isArray(offResults)) {
      offResults.forEach(product => {
        // Get the search score (default to 0 if not available)
        const score = typeof product._searchScore === 'number' ? product._searchScore : 0;
        merged.push({
          type: 'openfoodfacts',
          item: product,
          score
        });
      });
    }
    
    // Add USDA results
    if (Array.isArray(usdaItems)) {
      usdaItems.forEach(foodItem => {
        // Get the search score (default to 0 if not available)
        const score = typeof (foodItem as any)._searchScore === 'number' ? (foodItem as any)._searchScore : 0;
        merged.push({
          type: 'usda',
          item: foodItem,
          score
        });
      });
    }
    
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
  
  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setUsdaResults([]);
    setMergedResults([]);
  }, []);
  
  // Method to handle search with specific options
  const handleSearchWithOptions = useCallback(async (
    query: string,
    searchSource: SearchSource = "both",
    userPreferences?: UserPreferences
  ) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setUsdaResults([]);
      return null;
    }
    
    setIsLoading(true);
    saveRecentSearch(query);
    
    try {
      const searchType = "broad";
      
      // Search in Open Food Facts
      if (searchSource === "openfoods" || searchSource === "both") {
        let offResults = await searchOpenFoodFacts(query, searchType, userPreferences || {});
        
        // If broad search returns no results, try fallback search
        if (!Array.isArray(offResults) || offResults.length === 0) {
          console.log("Broad search returned no results, trying fallback search");
          const fallbackResults = await searchWithFallback(encodeURIComponent(query.trim()));
          if (Array.isArray(fallbackResults) && fallbackResults.length > 0) {
            offResults = fallbackResults;
            toast({
              title: "Limited results found",
              description: "We found some items that might match what you're looking for.",
            });
          }
        }
        
        // Update search results
        setSearchResults(Array.isArray(offResults) ? offResults : []);
      }
      
      // Search in USDA if not rate limited
      if ((searchSource === "usda" || searchSource === "both") && usdaApiStatus !== "rate_limited") {
        try {
          const usdaSearchResults = await searchUsdaDatabase(query, userPreferences || {});
          setUsdaResults(Array.isArray(usdaSearchResults) ? usdaSearchResults : []);
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
      
      return { searchResults, usdaResults };
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: `Could not fetch food data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, usdaApiStatus, saveRecentSearch]);
  
  // Perform search when query changes with debounce
  useEffect(() => {
    // Clear previous timeout to prevent multiple searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if query is at least 2 characters
    if (searchQuery.trim().length >= 2) {
      // Set a new timeout
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchWithOptions(searchQuery);
      }, 800); // Increased debounce time to 800ms
    } else {
      // Clear results if query is too short
      setSearchResults([]);
      setUsdaResults([]);
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearchWithOptions]);

  // Clear results when search panel is closed
  useEffect(() => {
    if (!open) {
      clearSearchResults();
    }
  }, [open, clearSearchResults]);
  
  return {
    searchQuery,
    setSearchQuery,
    isLoading,
    searchResults,
    usdaResults,
    mergedResults,
    recentSearches: Array.isArray(recentSearches) ? recentSearches : [],
    handleSelectFood,
    handleSelectUsdaFood,
    handleSearchWithOptions,
    clearSearchResults
  };
}
