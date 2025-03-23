
import { FoodItem, DietType } from "@/types/diet";
import { itemMatchesQuery } from "@/utils/diet/foodSearchUtils";

// Cache for filtered items to improve performance
const filterCache = new Map<string, FoodItem[]>();
const CACHE_MAX_SIZE = 50;

// Filter food items based on search query and selected diet
export const getFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  // Generate a cache key
  const cacheKey = `${searchQuery}-${selectedDiet}-${items.length}`;
  
  // Check cache first
  if (filterCache.has(cacheKey)) {
    return filterCache.get(cacheKey) || [];
  }
  
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
  
  // Cache the results
  if (filterCache.size >= CACHE_MAX_SIZE) {
    // Remove the oldest entry if cache is full
    const firstKey = filterCache.keys().next().value;
    filterCache.delete(firstKey);
  }
  filterCache.set(cacheKey, filteredItems);
  
  return filteredItems;
};

// Get or compute and cache filtered items
export const getCachedFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  return getFilteredItems(items, searchQuery, selectedDiet);
};

// Clear the search cache when needed
export const clearSearchCache = () => {
  filterCache.clear();
};
