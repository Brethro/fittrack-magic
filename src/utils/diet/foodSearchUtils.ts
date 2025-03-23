
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

// Function to search with highlighting
export const searchAndHighlightFoods = (
  query: string, 
  foodCategories: FoodCategory[]
): { items: FoodItem[], query: string } => {
  const items = searchFoodItems(query, foodCategories);
  
  // Mark items that match the search query for highlighting
  const markedItems = items.map(item => ({
    ...item,
    isHighlighted: true,
    showSearchIcon: true
  }));
  
  return { items: markedItems, query };
};

// Helper function to determine if a food item matches the search query
export const itemMatchesQuery = (item: FoodItem, query: string): boolean => {
  if (!query || query.length < 2) return false;
  
  const lowerQuery = query.toLowerCase();
  const lowerName = item.name.toLowerCase();
  
  // Check multiple properties for a match
  return (
    lowerName.includes(lowerQuery) || 
    item.primaryCategory?.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery) ||
    item.diets?.some(diet => diet.toLowerCase().includes(lowerQuery)) ||
    false
  );
};
