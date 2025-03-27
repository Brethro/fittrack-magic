
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
import { foodDb } from "@/lib/supabase";
import { extractNutritionInfo } from "@/utils/usdaApi";

interface SearchSectionPanelProps {
  usdaApiStatus: string;
}

const SearchSectionPanel = ({ usdaApiStatus }: SearchSectionPanelProps) => {
  const { toast } = useToast();
  const [showRawData, setShowRawData] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUsdaResponse, setLastUsdaResponse] = useState<any>(null);
  const [savingToDatabase, setSavingToDatabase] = useState(false);
  
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
      
      if (savedCount > 0 && isAdmin) {
        toast({
          title: "Database updated",
          description: `Saved ${savedCount} of ${totalItems} food items to the database.`,
        });
      }
    } catch (error) {
      console.error("Error saving search results to database:", error);
      if (isAdmin) {
        toast({
          title: "Database error",
          description: `Could not save all items to database: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      }
    } finally {
      setSavingToDatabase(false);
    }
  };
  
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
    
    // Automatically save search results to database
    if (mergedResults && mergedResults.length > 0) {
      saveSearchResultsToDatabase(mergedResults);
    }
  };

  // Also save results when they change
  useEffect(() => {
    if (mergedResults && mergedResults.length > 0) {
      saveSearchResultsToDatabase(mergedResults);
    }
  }, [mergedResults]);
  
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
      
      {/* Show database saving indicator for admin users */}
      {savingToDatabase && isAdmin && (
        <div className="mt-2 p-2 text-xs text-blue-800 bg-blue-50 rounded-md border border-blue-200 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Saving search results to database...</p>
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
