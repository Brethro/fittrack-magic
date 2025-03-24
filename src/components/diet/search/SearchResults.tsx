
import { CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Loader } from "lucide-react";
import { UsdaFoodItem } from "@/utils/usdaApi";
import { UnifiedFoodResults } from "@/components/diet/FoodSearchResults";

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
      <CommandEmpty>
        No results found. Try different search terms.
      </CommandEmpty>
    );
  }
  
  // Show nothing when there's no search
  if (searchQuery.length < 2 && mergedResults.length === 0) {
    return null;
  }
  
  // Show results
  return (
    <CommandGroup heading="Search Results">
      <div className="p-2">
        <UnifiedFoodResults 
          mergedResults={mergedResults}
          onSelectFood={onSelectFood}
          onSelectUsdaFood={onSelectUsdaFood}
        />
      </div>
    </CommandGroup>
  );
}
