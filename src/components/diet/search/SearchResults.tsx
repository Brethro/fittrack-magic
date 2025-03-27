
import { Loader } from "lucide-react";
import { UsdaFoodItem } from "@/utils/usdaApi";
import { UnifiedFoodResults } from "@/components/diet/FoodSearchResults";

interface SearchResultsProps {
  isLoading: boolean;
  searchQuery: string;
  mergedResults: Array<{type: 'openfoodfacts' | 'usda', item: any, score: number}>;
  onSelectFood: (food: any) => void;
  onSelectUsdaFood: (food: UsdaFoodItem) => void;
  savingToDatabase?: boolean;
}

export function SearchResults({ 
  isLoading, 
  searchQuery,
  mergedResults,
  onSelectFood,
  onSelectUsdaFood,
  savingToDatabase
}: SearchResultsProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Show empty state when there's a search but no results
  if (searchQuery.length >= 2 && !isLoading && mergedResults.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">No results found.</p>
        <p className="text-sm text-muted-foreground">Try different search terms.</p>
      </div>
    );
  }
  
  // Show nothing when there's no search
  if (searchQuery.length < 2 && mergedResults.length === 0) {
    return null;
  }
  
  // Show results
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-3">Results</h3>
      <div className="space-y-4">
        <UnifiedFoodResults 
          mergedResults={mergedResults}
          onSelectFood={onSelectFood}
          onSelectUsdaFood={onSelectUsdaFood}
        />
      </div>
      {/* Database save indicator with improved visibility */}
      {mergedResults.length > 0 && (
        <div className="mt-3 text-xs text-center">
          {savingToDatabase ? (
            <div className="flex items-center justify-center space-x-1 text-blue-500">
              <Loader className="h-3 w-3 animate-spin" />
              <span>Saving search results to our database...</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              All search results are automatically saved to our database
            </div>
          )}
        </div>
      )}
    </div>
  );
}
