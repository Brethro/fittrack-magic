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
import { foodDb } from "@/lib/supabase";
import { extractNutritionInfo } from "@/utils/usdaApi";

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
  const [inputValue, setInputValue] = useState(""); // Track input value separately
  const [savingToDatabase, setSavingToDatabase] = useState(false);
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

  // Save search results to database
  useEffect(() => {
    if (mergedResults && mergedResults.length > 0) {
      saveSearchResultsToDatabase(mergedResults);
    }
  }, [mergedResults]);
  
  // Save search results to database
  const saveSearchResultsToDatabase = async (results: any[]) => {
    if (!results || results.length === 0) return;
    
    setSavingToDatabase(true);
    
    try {
      // Process in smaller batches to avoid overwhelming the database
      const batchSize = 5;
      const totalItems = results.length;
      let savedCount = 0;
      
      // Save all OpenFoodFacts results
      const offResults = results.filter(r => r.type === 'openfoodfacts').map(r => r.item);
      for (let i = 0; i < offResults.length; i += batchSize) {
        const batch = offResults.slice(i, i + batchSize);
        await Promise.all(batch.map(async (product) => {
          const sourceId = product.id || product._id || product.code || '';
          await foodDb.saveFood(product, 'openfoodfacts', sourceId);
          savedCount++;
        }));
      }
      
      // Save all USDA results
      const usdaResults = results.filter(r => r.type === 'usda').map(r => r.item);
      for (let i = 0; i < usdaResults.length; i += batchSize) {
        const batch = usdaResults.slice(i, i + batchSize);
        await Promise.all(batch.map(async (foodItem) => {
          const nutritionInfo = extractNutritionInfo(foodItem);
          const enhancedItem = {
            ...foodItem,
            nutrition: nutritionInfo.nutritionValues,
            servingSize: nutritionInfo.servingInfo.size,
            servingSizeUnit: nutritionInfo.servingInfo.unit
          };
          await foodDb.saveFood(enhancedItem, 'usda', foodItem.fdcId.toString());
          savedCount++;
        }));
      }
      
      console.log(`Saved ${savedCount} food items to database`);
    } catch (error) {
      console.error("Error saving search results to database:", error);
    } finally {
      setSavingToDatabase(false);
    }
  };
  
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
      setInputValue("");
    }
  }, [isOpen, clearSearchResults, setSearchQuery]);
  
  // Handle input changes with debounce in the component
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Only update the search query (which triggers API calls) when we have at least 2 chars
    if (value.trim().length >= 2) {
      setSearchQuery(value);
    } else if (value.trim().length === 0) {
      setSearchQuery("");
    }
  };

  // Explicitly trigger search (used by recent searches)
  const handleExplicitSearch = useCallback((query: string) => {
    // Update input field
    setInputValue(query);
    
    // Set the query which will trigger the useEffect in useSearch
    setSearchQuery(query);
    
    // Also mark that the search should be initiated
    shouldInitiateSearch.current = true;
  }, [setSearchQuery]);
  
  // Handle search source change
  const handleSourceChange = useCallback((source: SearchSource) => {
    setSearchSource(source);
    
    // Only trigger a search if there's already a query
    if (inputValue.trim().length >= 2) {
      // Use setTimeout to ensure state is updated before search
      setTimeout(() => {
        handleSearchWithOptions(inputValue, source, userPreferences);
      }, 10);
    }
  }, [inputValue, handleSearchWithOptions, userPreferences]);
  
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
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search foods..."
            className="flex-1 bg-transparent border-none outline-none text-sm h-9 px-2"
          />
          {inputValue && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                setInputValue("");
                setSearchQuery("");
              }}
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
        {inputValue.length < 2 && (
          <RecentFoods />
        )}
        
        {/* Recent searches */}
        {Array.isArray(recentSearches) && recentSearches.length > 0 && inputValue.length < 2 && !isLoading && (
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
          savingToDatabase={savingToDatabase}
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
