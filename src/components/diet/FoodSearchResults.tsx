
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import FoodItem from "./FoodItem";
import UsdaFoodItem from "./UsdaFoodItem";
import { UsdaFoodItem as UsdaFoodItemType } from "@/utils/usdaApi";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FoodSearchResultsProps {
  results: any[];
  usdaResults?: UsdaFoodItemType[];
  onSelectFood?: (food: any) => void;
  onSelectUsdaFood?: (food: UsdaFoodItemType) => void;
  unifiedMode?: boolean; // New prop to control unified display
}

const FoodSearchResults = ({ 
  results, 
  usdaResults = [], 
  onSelectFood, 
  onSelectUsdaFood,
  unifiedMode = false // Default to false for backward compatibility
}: FoodSearchResultsProps) => {
  const hasOpenFoodResults = results.length > 0;
  const hasUsdaResults = usdaResults.length > 0;
  const totalResults = results.length + usdaResults.length;
  
  // Debug display for search scores in development mode only
  const showDebugScores = process.env.NODE_ENV === 'development';
  
  if (!hasOpenFoodResults && !hasUsdaResults) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-3 mt-4"
      >
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            No results found. Try different search terms or check your spelling.
          </p>
        </div>
      </motion.section>
    );
  }
  
  return (
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
          {totalResults} found
        </Badge>
      </div>
      
      {/* Unified display mode - shows all results together sorted by score */}
      {unifiedMode && (
        <div className="space-y-2">
          {/* Render both types of results in the same list */}
          {[...Array(results.length + usdaResults.length)].map((_, index) => {
            // This is just a placeholder - the actual items will be passed 
            // as pre-sorted merged array from the parent component
            const itemInfo = index < results.length 
              ? { type: 'openfoodfacts', item: results[index], index }
              : { type: 'usda', item: usdaResults[index - results.length], index };
              
            return null; // This will never be used as we'll pass pre-sorted items
          })}
        </div>
      )}
      
      {/* Regular separated display mode */}
      {!unifiedMode && (
        <div className="space-y-2">
          {/* Open Food Facts results */}
          {hasOpenFoodResults && (
            <div className="space-y-2">
              {/* Show source header if we have results from both sources */}
              {hasUsdaResults && (
                <div className="flex items-center gap-2 mt-3 mb-1">
                  <h3 className="text-base font-medium">Open Food Facts Results</h3>
                  <Badge variant="outline" className="text-xs">
                    {results.length} items
                  </Badge>
                </div>
              )}
              
              {results.map((product, index) => (
                <motion.div
                  key={`off-${product.id || index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <FoodItem 
                    product={product} 
                    onSelect={(food) => {
                      if (onSelectFood) onSelectFood(food);
                    }} 
                  />
                  {/* Debug score display */}
                  {showDebugScores && product._searchScore !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1 pl-2">
                      Score: {Math.round(product._searchScore)}
                      {product._nutritionalCompleteness && 
                        ` | Nutrition data: ${product._nutritionalCompleteness}`}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          {/* USDA results - conditionally rendered */}
          {hasUsdaResults && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mt-3 mb-1">
                <h3 className="text-base font-medium text-emerald-500">USDA Database Results</h3>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                  {usdaResults.length} items
                </Badge>
              </div>
              
              {usdaResults.map((foodItem, index) => (
                <motion.div
                  key={`usda-${foodItem.fdcId}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <UsdaFoodItem 
                    foodItem={foodItem} 
                    onSelect={(food) => {
                      if (onSelectUsdaFood) onSelectUsdaFood(food);
                    }}
                  />
                  {/* Debug score display */}
                  {showDebugScores && (foodItem as any)._searchScore !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1 pl-2">
                      Score: {Math.round((foodItem as any)._searchScore)}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
};

// Unified display component that renders both OFF and USDA items together
export function UnifiedFoodResults({
  mergedResults,
  onSelectFood,
  onSelectUsdaFood
}: {
  mergedResults: Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}>
  onSelectFood?: (food: any) => void;
  onSelectUsdaFood?: (food: UsdaFoodItemType) => void;
}) {
  // Debug display for search scores in development mode only
  const showDebugScores = process.env.NODE_ENV === 'development';
  
  return (
    <div className="space-y-2">
      {mergedResults.map((result, index) => (
        <motion.div
          key={`merged-${result.type}-${result.type === 'usda' ? result.item.fdcId : (result.item.id || index)}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="relative"
        >
          {/* Render appropriate component based on result type */}
          {result.type === 'openfoodfacts' ? (
            <div className="relative">
              {/* Source badge in top-right corner */}
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="outline" className="text-xs">
                  OFF
                </Badge>
              </div>
              <FoodItem 
                product={result.item} 
                onSelect={(food) => {
                  if (onSelectFood) onSelectFood(food);
                }} 
              />
              {/* Debug score display */}
              {showDebugScores && result.score !== undefined && (
                <div className="text-xs text-muted-foreground mt-1 pl-2">
                  Score: {Math.round(result.score)}
                  {result.item._nutritionalCompleteness && 
                    ` | Nutrition data: ${result.item._nutritionalCompleteness}`}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Source badge in top-right corner */}
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                  USDA
                </Badge>
              </div>
              <UsdaFoodItem 
                foodItem={result.item}
                showSourceBadge={false} // Hide redundant source badge
                onSelect={(food) => {
                  if (onSelectUsdaFood) onSelectUsdaFood(food);
                }}
              />
              {/* Debug score display */}
              {showDebugScores && result.score !== undefined && (
                <div className="text-xs text-muted-foreground mt-1 pl-2">
                  Score: {Math.round(result.score)} | USDA
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function FoodSearchResultsSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-lg font-semibold">Search Results</h2>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-panel p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4 mt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoodSearchResults;
