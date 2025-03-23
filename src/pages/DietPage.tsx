
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useApiConnection } from "@/hooks/useApiConnection";
import FoodSearchForm from "@/components/diet/FoodSearchForm";
import ApiStatusIndicators from "@/components/diet/ApiStatusIndicators";
import FoodSearchResults, { FoodSearchResultsSkeleton } from "@/components/diet/FoodSearchResults";
import { UsdaFoodItem } from "@/utils/usdaApi";
import { 
  searchOpenFoodFacts, 
  searchUsdaDatabase, 
  searchWithFallback 
} from "@/services/foodSearchService";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLog from "@/components/diet/FoodLog";

const DietPage = () => {
  const { toast } = useToast();
  const { apiStatus, usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { foodEntries } = useFoodLog();

  // Clear search results when a new food entry is added
  useEffect(() => {
    // This will trigger whenever foodEntries changes (i.e., when food is added)
    setSearchResults([]);
    setUsdaResults([]);
  }, [foodEntries]);

  // Check USDA API connection when selected
  useEffect(() => {
    checkUsdaApiConnection();
  }, [checkUsdaApiConnection]);

  const handleSearch = async (
    searchQuery: string, 
    searchType: "exact" | "broad", 
    searchSource: "both" | "openfoods" | "usda"
  ) => {
    setIsLoading(true);
    setSearchResults([]);
    setUsdaResults([]);
    
    try {
      // Search in Open Food Facts if selected
      if (searchSource === "openfoods" || searchSource === "both") {
        const offResults = await searchOpenFoodFacts(searchQuery, searchType);
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
          const usdaSearchResults = await searchUsdaDatabase(searchQuery);
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
              variant: "warning",
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

  return (
    <div className="container px-4 py-6 mx-auto h-screen overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full pb-20 flex flex-col"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-gradient-purple">
          Diet Planner
        </h1>

        <div className="flex flex-col space-y-4 max-w-4xl mx-auto w-full flex-1">
          {/* API Status Indicators */}
          <ApiStatusIndicators 
            apiStatus={apiStatus} 
            usdaApiStatus={usdaApiStatus} 
          />

          {/* Food Search Section */}
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
            
            {/* Search Results */}
            {isLoading ? (
              <FoodSearchResultsSkeleton />
            ) : (
              (searchResults.length > 0 || usdaResults.length > 0) && (
                <FoodSearchResults results={searchResults} usdaResults={usdaResults} />
              )
            )}
          </div>
          
          {/* Food Log Section */}
          <div className="flex-1 max-h-[600px] min-h-[500px]">
            <FoodLog />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DietPage;
