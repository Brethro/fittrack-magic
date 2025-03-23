
import { useState, useEffect } from "react";
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

const DietPage = () => {
  const { toast } = useToast();
  const { apiStatus, usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [usdaResults, setUsdaResults] = useState<UsdaFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check USDA API connection when selected
  useEffect(() => {
    checkUsdaApiConnection();
  }, []);

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
        
        if (offResults.length === 0 && searchType === "exact" && searchSource !== "usda") {
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
      
      // Search in USDA if selected
      if (searchSource === "usda" || searchSource === "both") {
        try {
          const usdaSearchResults = await searchUsdaDatabase(searchQuery);
          setUsdaResults(usdaSearchResults);
        } catch (error) {
          console.error("USDA search error:", error);
          toast({
            title: "USDA search failed",
            description: `Could not fetch USDA food data: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          });
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

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-gradient-purple">
          Diet Planner
        </h1>

        {/* API Status Indicators */}
        <ApiStatusIndicators 
          apiStatus={apiStatus} 
          usdaApiStatus={usdaApiStatus} 
        />

        {/* Search Form */}
        <FoodSearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
        />

        {/* Search Results */}
        {isLoading ? (
          <FoodSearchResultsSkeleton />
        ) : (
          (searchResults.length > 0 || usdaResults.length > 0) && (
            <FoodSearchResults results={searchResults} usdaResults={usdaResults} />
          )
        )}
      </motion.div>
    </div>
  );
};

export default DietPage;
