
import { UsdaFoodItem } from "@/utils/usdaApi";
import { CommandEmpty } from "@/components/ui/command";
import { Search } from "lucide-react";
import { FoodSearchResultsSkeleton, UnifiedFoodResults } from "@/components/diet/FoodSearchResults";

interface SearchResultsProps {
  isLoading: boolean;
  searchQuery: string;
  mergedResults: Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}>;
  onSelectFood: (food: any) => void;
  onSelectUsdaFood: (food: UsdaFoodItem) => void;
}

export function SearchResults({ 
  isLoading, 
  searchQuery, 
  mergedResults, 
  onSelectFood, 
  onSelectUsdaFood 
}: SearchResultsProps) {
  return (
    <>
      <CommandEmpty>
        {isLoading ? (
          <div className="p-4">
            <FoodSearchResultsSkeleton />
          </div>
        ) : (
          <div className="py-6 text-center">
            <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
          </div>
        )}
      </CommandEmpty>
      
      {/* Search Results */}
      {isLoading ? (
        <div className="p-4">
          <FoodSearchResultsSkeleton />
        </div>
      ) : mergedResults.length > 0 ? (
        <div className="p-2">
          <UnifiedFoodResults 
            mergedResults={mergedResults}
            onSelectFood={onSelectFood}
            onSelectUsdaFood={onSelectUsdaFood}
          />
        </div>
      ) : null}
    </>
  );
}
