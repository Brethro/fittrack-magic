
import { FoodItem, DietType, FoodCategory } from "@/types/diet";

// Get filtered items by search query and diet type
export const getFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  if (!items || !Array.isArray(items)) return [];
  
  // Apply diet filter if not 'all'
  const dietFiltered = (selectedDiet === 'all') 
    ? items 
    : items.filter(item => 
        item.diets && Array.isArray(item.diets) && item.diets.includes(selectedDiet)
      );
  
  // Apply search filter if query exists
  if (!searchQuery || searchQuery.trim() === '') {
    return dietFiltered;
  }
  
  const queryLower = searchQuery.toLowerCase();
  return dietFiltered.filter(item => 
    item.name.toLowerCase().includes(queryLower) ||
    item.primaryCategory.toLowerCase().includes(queryLower)
  );
};

// Get filtered categories with their filtered items
export const getFilteredCategories = (
  categories: FoodCategory[],
  searchQuery: string,
  selectedDiet: DietType
): FoodCategory[] => {
  if (!categories || !Array.isArray(categories)) return [];
  
  return categories.map(category => {
    const filteredItems = getFilteredItems(category.items, searchQuery, selectedDiet);
    return {
      ...category,
      items: filteredItems
    };
  }).filter(category => category.items.length > 0);
};

// Cached version for performance
export const getCachedFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  // Simple implementation without caching for now
  return getFilteredItems(items, searchQuery, selectedDiet);
};
