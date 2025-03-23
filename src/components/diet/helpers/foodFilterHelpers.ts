
import { FoodItem, DietType } from "@/types/diet";
import { itemMatchesQuery } from "@/utils/diet/foodSearchUtils";

// Filter food items based on search query and selected diet
export const getFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  // Start with all items
  let filteredItems = [...items];
  
  // Filter by diet if not "all"
  if (selectedDiet !== "all") {
    filteredItems = filteredItems.filter(item => 
      (item.diets?.includes(selectedDiet)) ||
      // If no diet data, include item when diet=all
      (!item.diets || item.diets.length === 0)
    );
  }
  
  // Filter by search query if it exists and has 2+ characters
  if (searchQuery && searchQuery.length >= 2) {
    filteredItems = filteredItems.filter(item => itemMatchesQuery(item, searchQuery));
  }
  
  return filteredItems;
};

// Cache the search results to prevent repeated searches
const searchCache = new Map<string, FoodItem[]>();

// Get or compute and cache filtered items
export const getCachedFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  const cacheKey = `${searchQuery}-${selectedDiet}`;
  
  if (!searchCache.has(cacheKey)) {
    const results = getFilteredItems(items, searchQuery, selectedDiet);
    searchCache.set(cacheKey, results);
    return results;
  }
  
  return searchCache.get(cacheKey) || [];
};

// Clear the search cache when needed
export const clearSearchCache = () => {
  searchCache.clear();
};
