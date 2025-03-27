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
import { foodDb } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Define the search source type explicitly to avoid type errors
export type SearchSource = "both" | "openfoods" | "usda" | "database";

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
  const [mergedResults, setMergedResults] = useState<Array<{type: 'openfoodfacts' | 'usda' | 'database', item: any, score: number}>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [databaseResults, setDatabaseResults] = useState<any[]>([]);
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchQuery = useRef<string>("");
  const searchInProgress = useRef<boolean>(false);
  const lastSearchTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
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
  
  // Update merged results whenever search results, USDA results, or database results change
  useEffect(() => {
    // Ensure all arrays are defined before merging
    const offResultsArray = Array.isArray(searchResults) ? searchResults : [];
    const usdaResultsArray = Array.isArray(usdaResults) ? usdaResults : [];
    const dbResultsArray = Array.isArray(databaseResults) ? databaseResults : [];
    
    if (offResultsArray.length > 0 || usdaResultsArray.length > 0 || dbResultsArray.length > 0) {
      const merged = mergeAndSortResults(offResultsArray, usdaResultsArray, dbResultsArray);
      setMergedResults(merged);
    } else {
      setMergedResults([]);
    }
  }, [searchResults, usdaResults, databaseResults]);
  
  // Function to merge and sort results by score
  const mergeAndSortResults = (
    offResults: any[], 
    usdaItems: UsdaFoodItem[], 
    dbItems: any[]
  ) => {
    const merged: Array<{type: 'openfoodfacts' | 'usda' | 'database', item: any, score: number}> = [];
    
    // Add database results (give them a higher base score to prioritize)
    if (Array.isArray(dbItems)) {
      dbItems.forEach(item => {
        // Calculate a score based on exact match or position
        let score = 85; // Higher base score to prioritize database results
        
        // If name contains the exact search query, boost score
        if (item.name && item.name.toLowerCase().includes(lastSearchQuery.current.toLowerCase())) {
          score += 10;
        }
        
        merged.push({
          type: 'database',
          item: {
            ...item,
            product_name: item.name,
            brands: item.brand,
            nutrition: item.food_nutrients,
            _searchScore: score
          },
          score
        });
      });
    }
    
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
    setDatabaseResults([]);
    setMergedResults([]);
  }, []);
  
  // Method to cancel any ongoing search requests
  const cancelOngoingSearches = useCallback(() => {
    // Cancel any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Cancel any ongoing fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset search state
    searchInProgress.current = false;
  }, []);
  
  // Search database first - FIX HERE
  const searchDatabase = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) return [];
    
    setIsSearchingDatabase(true);
    console.log("Searching database for:", query);
    
    try {
      // Search for the term in the foods table using text search
      const foods = await foodDb.searchFoods(query, 20);
      
      console.log(`Found ${foods.length} items in database for "${query}"`);
      return foods;
    } catch (error) {
      console.error("Error searching database:", error);
      return [];
    } finally {
      setIsSearchingDatabase(false);
    }
  }, []);
  
  // Method to handle search with specific options
  const handleSearchWithOptions = useCallback(async (
    query: string,
    searchSource: SearchSource = "both",
    userPreferences?: UserPreferences
  ) => {
    // If query is too short, don't proceed
    if (!query || query.trim().length < 2) {
      clearSearchResults();
      return null;
    }
    
    const trimmedQuery = query.trim();
    const now = Date.now();
    
    // Prevent duplicate searches and implement rate limiting
    if (
      (trimmedQuery === lastSearchQuery.current && searchInProgress.current) || 
      (now - lastSearchTime.current < 3000) // 3 second cooldown between searches
    ) {
      console.log("Search prevented:", { 
        isDuplicate: trimmedQuery === lastSearchQuery.current, 
        inProgress: searchInProgress.current,
        timeSinceLastSearch: now - lastSearchTime.current
      });
      return null;
    }
    
    // Cancel any ongoing searches
    cancelOngoingSearches();
    
    // Create a new abort controller for this search
    abortControllerRef.current = new AbortController();
    
    lastSearchQuery.current = trimmedQuery;
    searchInProgress.current = true;
    lastSearchTime.current = now;
    setIsLoading(true);
    saveRecentSearch(query);
    
    console.log(`Executing search for "${trimmedQuery}" using source: ${searchSource}`);
    
    try {
      // Always search database first, regardless of search source
      let dbResults = await searchDatabase(trimmedQuery);
      
      // Update database results
      setDatabaseResults(dbResults);
      
      // If we only want database results, or we found enough in the database, return early
      if (searchSource === "database" || (dbResults.length >= 10 && searchSource !== "both")) {
        setSearchResults([]);
        setUsdaResults([]);
        setIsLoading(false);
        searchInProgress.current = false;
        return { databaseResults: dbResults, searchResults: [], usdaResults: [] };
      }
      
      const searchType = "broad";
      
      // Search in Open Food Facts if needed
      if (searchSource === "openfoods" || searchSource === "both") {
        try {
          let offResults = await searchOpenFoodFacts(query, searchType, userPreferences || {});
          
          // Check if the search was aborted
          if (abortControllerRef.current?.signal.aborted) {
            console.log("Search aborted for Open Food Facts");
            return null;
          }
          
          // If broad search returns no results, try fallback search
          if (!Array.isArray(offResults) || offResults.length === 0) {
            console.log("Broad search returned no results, trying fallback search");
            const fallbackResults = await searchWithFallback(encodeURIComponent(trimmedQuery));
            
            // Check if the search was aborted
            if (abortControllerRef.current?.signal.aborted) {
              console.log("Fallback search aborted");
              return null;
            }
            
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
        } catch (error) {
          console.error("Search error:", error);
          // Continue with USDA search even if Open Food Facts fails
        }
      } else {
        // Clear Open Food Facts results if not searching there
        setSearchResults([]);
      }
      
      // Search in USDA if not rate limited
      if ((searchSource === "usda" || searchSource === "both") && usdaApiStatus !== "rate_limited") {
        try {
          const usdaSearchResults = await searchUsdaDatabase(query, userPreferences || {});
          
          // Check if the search was aborted
          if (abortControllerRef.current?.signal.aborted) {
            console.log("Search aborted for USDA");
            return null;
          }
          
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
              description: "You've reached the USDA API rate limit. Only showing database and Open Food Facts results.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "USDA search failed",
              description: `Could not fetch USDA food data: ${error instanceof Error ? error.message : "Unknown error"}`,
              variant: "destructive",
            });
          }
          
          // Clear USDA results if search fails
          setUsdaResults([]);
        }
      } else if (searchSource !== "usda") {
        // Clear USDA results if not searching there
        setUsdaResults([]);
      }
      
      return { databaseResults: dbResults, searchResults, usdaResults };
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
      searchInProgress.current = false;
    }
  }, [toast, usdaApiStatus, saveRecentSearch, clearSearchResults, cancelOngoingSearches, searchDatabase]);
  
  // Perform search when query changes with debounce
  useEffect(() => {
    // Only run this effect if search component is open
    if (!open) return;
    
    // Cancel any previous searches
    cancelOngoingSearches();
    
    // Only search if query is at least 2 characters
    if (searchQuery.trim().length >= 2) {
      // Set a new timeout with a further reduced debounce period
      searchTimeoutRef.current = setTimeout(() => {
        // Don't search if query is the same as the last one or search is already in progress
        if (searchQuery.trim() !== lastSearchQuery.current || !searchInProgress.current) {
          console.log(`Debounced search for: "${searchQuery.trim()}"`);
          handleSearchWithOptions(searchQuery);
        }
      }, 400); // Even shorter delay for database search (was 940ms)
    } else {
      // Clear results if query is too short
      clearSearchResults();
    }
    
    // Cleanup function to clear timeout
    return () => {
      cancelOngoingSearches();
    };
  }, [searchQuery, handleSearchWithOptions, open, clearSearchResults, cancelOngoingSearches]);

  // Clear results when search panel is closed
  useEffect(() => {
    if (!open) {
      clearSearchResults();
      lastSearchQuery.current = "";
      searchInProgress.current = false;
      
      // Cancel any ongoing searches
      cancelOngoingSearches();
    }
  }, [open, clearSearchResults, cancelOngoingSearches]);
  
  return {
    searchQuery,
    setSearchQuery,
    isLoading,
    isSearchingDatabase,
    searchResults,
    usdaResults,
    databaseResults,
    mergedResults,
    recentSearches: Array.isArray(recentSearches) ? recentSearches : [],
    handleSelectFood,
    handleSelectUsdaFood,
    handleSearchWithOptions,
    clearSearchResults
  };
}
