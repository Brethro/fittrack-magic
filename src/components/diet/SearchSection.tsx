
import { useState } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useToast } from "@/hooks/use-toast";
import FoodSearchForm, { UserPreferences } from "@/components/diet/FoodSearchForm";
import FoodSearchResults, { FoodSearchResultsSkeleton } from "@/components/diet/FoodSearchResults";
import RecentFoods from "@/components/diet/RecentFoods";
import { UsdaFoodItem } from "@/utils/usdaApi";
import { 
  searchOpenFoodFacts, 
  searchUsdaDatabase, 
  searchWithFallback,
  trackFoodSelection
} from "@/services/foodSearchService";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  usdaApiStatus: "idle" | "checking" | "connected" | "error" | "rate_limited";
}

const SearchSection = ({ usdaApiStatus }: SearchSectionProps) => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUsdaResponse, setLastUsdaResponse] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);
  
  // Track selected food to improve future search results
  const handleFoodSelection = (foodName: string) => {
    trackFoodSelection(foodName);
  };

  const handleSearch = async (
    searchQuery: string, 
    searchType: "exact" | "broad", 
    searchSource: "both" | "openfoods" | "usda",
    userPreferences?: UserPreferences
  ) => {
    setIsLoading(true);
    setSearchResults([]);
    setUsdaResults([]);
    setLastUsdaResponse(null);
    
    try {
      // Search in Open Food Facts if selected
      if (searchSource === "openfoods" || searchSource === "both") {
        const offResults = await searchOpenFoodFacts(searchQuery, searchType, userPreferences);
        setSearchResults(offResults);
        
        if (offResults.length === 0 && searchType === "exact" && searchSource === "openfoods") {
          toast({
            title: "No exact matches found",
            description: "Trying broader search criteria...",
          });
          // Try with broader search
          const fallbackResults = await searchWithFallback(encodeURIComponent(searchQuery.trim()));
          if (fallbackResults.length > 0) {
            setSearchResults(fallbackResults);
            toast({
              title: "Limited results found",
              description: "We found some items that might match what you're looking for.",
            });
          } else {
            toast({
              title: "No results found",
              description: "Try different search terms or check your spelling.",
              variant: "destructive",
            });
          }
        }
      }
      
      // Search in USDA if selected and not rate limited
      if ((searchSource === "usda" || searchSource === "both") && usdaApiStatus !== "rate_limited") {
        try {
          const usdaSearchResults = await searchUsdaDatabase(searchQuery, userPreferences);
          
          // Store the raw response for debugging
          if (usdaSearchResults.length > 0) {
            // Get the first result for display
            const firstItem = usdaSearchResults[0];
            setLastUsdaResponse({
              fdcId: firstItem.fdcId,
              description: firstItem.description,
              dataType: firstItem.dataType,
              brandName: firstItem.brandName,
              ingredients: firstItem.ingredients,
              foodCategory: firstItem.foodCategory,
              servingSize: firstItem.servingSize,
              servingSizeUnit: firstItem.servingSizeUnit,
              // Extract first few nutrients for display
              nutrients: firstItem.foodNutrients?.slice(0, 5).map(n => ({
                name: n.nutrientName,
                value: n.value,
                unit: n.unitName
              }))
            });
          }
          
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
      } else if (searchSource === "usda" && usdaApiStatus === "rate_limited") {
        toast({
          title: "USDA API rate limited",
          description: "Please try again later when the API rate limit resets.",
          variant: "destructive",
        });
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

  // Handler for selecting food from search results
  const handleSelectFood = (food: any) => {
    if (food && food.product_name) {
      handleFoodSelection(food.product_name);
    }
  };
  
  // Handler for selecting USDA food
  const handleSelectUsdaFood = (food: UsdaFoodItem) => {
    if (food && food.description) {
      handleFoodSelection(food.description);
    }
  };
  
  return (
    <div className="glass-panel p-4 rounded-lg">
      {/* Search Form */}
      <FoodSearchForm 
        onSearch={handleSearch} 
        isLoading={isLoading} 
      />
      
      {/* Show warning about rate limiting */}
      {usdaApiStatus === "rate_limited" && (
        <div className="mt-2 p-2 text-xs text-amber-800 bg-amber-50 rounded-md border border-amber-200">
          <p>USDA API rate limit exceeded. Only Open Food Facts results will be shown. 
          The rate limit typically resets after a few minutes.</p>
        </div>
      )}
      
      {/* Debug USDA API Response Data */}
      {lastUsdaResponse && (
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-emerald-600">USDA API Response Data</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRawData(!showRawData)}
              className="text-xs h-7 px-2"
            >
              {showRawData ? "Hide Details" : "Show Details"}
            </Button>
          </div>
          
          {showRawData && (
            <div className="mt-2 p-3 bg-slate-800 text-slate-100 rounded-md overflow-auto max-h-[300px] text-xs">
              <pre>{JSON.stringify(lastUsdaResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      
      {/* Recent Foods - improved layout */}
      <RecentFoods />
      
      {/* Search Results */}
      {isLoading ? (
        <FoodSearchResultsSkeleton />
      ) : (
        (searchResults.length > 0 || usdaResults.length > 0) && (
          <FoodSearchResults 
            results={searchResults} 
            usdaResults={usdaResults}
            onSelectFood={handleSelectFood}
            onSelectUsdaFood={handleSelectUsdaFood}
          />
        )
      )}
    </div>
  );
};

export default SearchSection;
