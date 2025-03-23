
import { FoodCategory, FoodItem } from "@/types/diet";
import { fuzzyFindFood } from "@/utils/diet/fuzzyMatchUtils";

// Function to search food items using fuzzy matching
export const searchFoodItems = (query: string, foodCategories: FoodCategory[]): FoodItem[] => {
  if (!query || query.length < 2) {
    return [];
  }
  
  // Use the fuzzy matching utility with a more prominently displayed result
  const results = fuzzyFindFood(query, foodCategories);
  
  // Sort results by relevance (exact name matches first)
  return results.sort((a, b) => {
    // Exact matches at the top
    const aExact = a.name.toLowerCase() === query.toLowerCase();
    const bExact = b.name.toLowerCase() === query.toLowerCase();
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Starts with at second position
    const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
    const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Default sorting by name
    return a.name.localeCompare(b.name);
  });
};

// New function to search with highlighting
export const searchAndHighlightFoods = (
  query: string, 
  foodCategories: FoodCategory[]
): { items: FoodItem[], query: string } => {
  const items = searchFoodItems(query, foodCategories);
  return { items, query };
};
