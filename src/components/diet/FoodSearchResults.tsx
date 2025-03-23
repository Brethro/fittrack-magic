
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import FoodItem from "./FoodItem";
import UsdaFoodItem from "./UsdaFoodItem";
import { UsdaFoodItem as UsdaFoodItemType } from "@/utils/usdaApi";

interface FoodSearchResultsProps {
  results: any[];
  usdaResults?: UsdaFoodItemType[];
  onSelectFood?: (food: any) => void;
  onSelectUsdaFood?: (food: UsdaFoodItemType) => void;
}

const FoodSearchResults = ({ 
  results, 
  usdaResults = [], 
  onSelectFood, 
  onSelectUsdaFood 
}: FoodSearchResultsProps) => {
  const hasOpenFoodResults = results.length > 0;
  const hasUsdaResults = usdaResults.length > 0;
  
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold">Search Results</h2>
      
      {/* Results count summary */}
      {(hasOpenFoodResults || hasUsdaResults) && (
        <div className="text-sm mb-2">
          Found {results.length + usdaResults.length} results 
          {hasOpenFoodResults && hasUsdaResults && (
            <span> ({results.length} from Open Food Facts, {usdaResults.length} from USDA)</span>
          )}
        </div>
      )}
      
      {/* Open Food Facts results */}
      {hasOpenFoodResults && (
        <div className="space-y-3">
          {results.map((product, index) => (
            <motion.div
              key={`off-${product.id || index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <FoodItem product={product} onSelect={onSelectFood} />
            </motion.div>
          ))}
        </div>
      )}
      
      {/* USDA results */}
      {hasUsdaResults && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mt-4 mb-2">
            <h3 className="text-md font-medium text-emerald-600">USDA Database Results</h3>
          </div>
          
          {usdaResults.map((foodItem, index) => (
            <motion.div
              key={`usda-${foodItem.fdcId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <UsdaFoodItem foodItem={foodItem} onSelect={onSelectUsdaFood} />
            </motion.div>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {!hasOpenFoodResults && !hasUsdaResults && (
        <p className="text-center text-muted-foreground py-4">
          No results found. Try different search terms or check your spelling.
        </p>
      )}
    </motion.section>
  );
};

export function FoodSearchResultsSkeleton() {
  return (
    <div className="space-y-4">
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
