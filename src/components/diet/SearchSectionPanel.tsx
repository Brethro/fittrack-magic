
import { useState, useEffect } from "react";
import { useApiConnection } from "@/hooks/useApiConnection";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import FoodSearchForm, { UserPreferences } from "@/components/diet/FoodSearchForm";
import FoodSearchResults, { FoodSearchResultsSkeleton, UnifiedFoodResults } from "@/components/diet/FoodSearchResults";
import RecentFoods from "@/components/diet/RecentFoods";
import { Button } from "@/components/ui/button";
import { SearchSource, useSearch } from "@/hooks/useSearch";

interface SearchSectionPanelProps {
  usdaApiStatus: string;
}

const SearchSectionPanel = ({ usdaApiStatus }: SearchSectionPanelProps) => {
  const { toast } = useToast();
  const [showRawData, setShowRawData] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUsdaResponse, setLastUsdaResponse] = useState<any>(null);
  
  // Initialize search hook with empty values since we'll handle search manually
  const { 
    isLoading, 
    mergedResults,
    setSearchQuery,
    handleSearchWithOptions,
    handleSelectFood,
    handleSelectUsdaFood
  } = useSearch({ 
    open: true, // Always consider this component "open"
    toast, 
    usdaApiStatus 
  });
  
  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminAuth = localStorage.getItem("fittrack_admin_auth");
      setIsAdmin(adminAuth === "true");
    };
    
    checkAdminStatus();
    
    // Listen for storage events to update admin status if changed in another tab
    window.addEventListener("storage", checkAdminStatus);
    
    return () => {
      window.removeEventListener("storage", checkAdminStatus);
    };
  }, []);
  
  // Handle search from form submission
  const handleSearch = async (
    searchQuery: string, 
    searchSource: SearchSource,
    userPreferences?: UserPreferences
  ) => {
    setSearchQuery(""); // Reset the search query in the hook
    const results = await handleSearchWithOptions(searchQuery, searchSource, userPreferences);
    
    // Store USDA response for admin view if available
    if (results?.usdaResults?.length > 0) {
      const firstItem = results.usdaResults[0];
      setLastUsdaResponse({
        fdcId: firstItem.fdcId,
        description: firstItem.description,
        dataType: firstItem.dataType,
        brandName: firstItem.brandName,
        ingredients: firstItem.ingredients,
        foodCategory: firstItem.foodCategory,
        servingSize: firstItem.servingSize,
        servingSizeUnit: firstItem.servingSizeUnit,
        householdServingFullText: firstItem.householdServingFullText,
        // Extract first few nutrients for display
        nutrients: firstItem.foodNutrients?.slice(0, 5).map(n => ({
          name: n.nutrientName,
          value: n.value,
          unit: n.unitName
        }))
      });
    }
  };
  
  return (
    <div className="glass-panel p-4 rounded-lg">
      {/* Search Form */}
      <FoodSearchForm 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        disableUsdaOption={false}
      />
      
      {/* Show USDA rate limiting warning */}
      {usdaApiStatus === "rate_limited" && (
        <div className="mt-2 p-2 text-xs text-amber-800 bg-amber-50 rounded-md border border-amber-200">
          <p>USDA API rate limit exceeded. Only Open Food Facts results will be shown. 
          The rate limit typically resets after a few minutes.</p>
        </div>
      )}
      
      {/* Debug USDA API Response Data - Only visible to admin users */}
      {lastUsdaResponse && isAdmin && (
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
      
      {/* Search Results - Now using unified results display */}
      {isLoading ? (
        <FoodSearchResultsSkeleton />
      ) : (
        (mergedResults.length > 0) && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 mt-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Search Results</h2>
              
              {/* Results count summary */}
              <Badge variant="outline" className="bg-background">
                {mergedResults.length} found
              </Badge>
            </div>
            
            {/* Use the unified results display */}
            <UnifiedFoodResults 
              mergedResults={mergedResults}
              onSelectFood={handleSelectFood}
              onSelectUsdaFood={handleSelectUsdaFood}
            />
          </motion.section>
        )
      )}
    </div>
  );
};

export default SearchSectionPanel;
