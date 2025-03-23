
import { FoodCategory, FoodItem } from "@/types/diet";
import { categoryDisplayNames } from "./categoryDisplayNames";

interface HighlightedFoodItem extends FoodItem {
  highlighted?: boolean;
}

interface SearchResults {
  items: HighlightedFoodItem[];
  categories: string[];
}

/**
 * Searches for foods matching the query across all food categories
 * and returns items with a highlighted flag
 */
export const searchAndHighlightFoods = (
  query: string,
  categories: FoodCategory[]
): SearchResults => {
  if (!query || query.length < 2) {
    return { items: [], categories: [] };
  }
  
  const matchedCategories = new Set<string>();
  const matchedItems: HighlightedFoodItem[] = [];
  
  // Normalize query for case-insensitive matching
  const normalizedQuery = query.toLowerCase().trim();
  
  // Search through all categories and their items
  categories.forEach(category => {
    // Search through items in this category
    category.items.forEach(item => {
      if (itemMatchesQuery(item, normalizedQuery)) {
        // Clone the item and add highlighted flag
        const highlightedItem: HighlightedFoodItem = {
          ...item,
          highlighted: true
        };
        
        matchedItems.push(highlightedItem);
        matchedCategories.add(category.name);
        
        // Also add the primary category if it exists
        if (item.primaryCategory) {
          matchedCategories.add(item.primaryCategory);
        }
      }
    });
  });
  
  return {
    items: matchedItems,
    categories: Array.from(matchedCategories)
  };
};

/**
 * Determines if a food item matches a search query by checking various fields
 */
export const itemMatchesQuery = (item: FoodItem, query: string): boolean => {
  if (!query || query.length < 2) return false;
  if (!item) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const lowerQuery = query.toLowerCase().trim();
  const name = item.name ? item.name.toLowerCase() : '';
  const primaryCategory = item.primaryCategory ? item.primaryCategory.toLowerCase() : '';
  const diets = item.diets ? item.diets.map(d => d.toLowerCase()) : [];
  
  // Exact name match (highest priority)
  if (name === lowerQuery) {
    return true;
  }
  
  // Name starts with query
  if (name.startsWith(lowerQuery)) {
    return true;
  }
  
  // Name contains query
  if (name.includes(lowerQuery)) {
    return true;
  }
  
  // Check if any word in the name contains any word in the query
  const queryWords = lowerQuery.split(/\s+/);
  const nameWords = name.split(/\s+/);
  
  if (queryWords.some(qw => nameWords.some(nw => nw.includes(qw) || qw.includes(nw)))) {
    return true;
  }
  
  // Check if primary category matches
  if (primaryCategory.includes(lowerQuery)) {
    return true;
  }
  
  // Check if diets match
  if (diets.some(diet => diet.includes(lowerQuery))) {
    return true;
  }
  
  // If we get here, no match was found
  return false;
};

/**
 * Get cached filtered items or filter them fresh if not cached
 */
export const getCachedFilteredItems = (
  items: FoodItem[],
  query: string,
  dietType: string
): FoodItem[] => {
  // Filter by search query
  const matchingItems = query.length >= 2
    ? items.filter(item => itemMatchesQuery(item, query.toLowerCase()))
    : items;
  
  // Additional filter by diet type if not 'all'
  return dietType === 'all' 
    ? matchingItems 
    : matchingItems.filter(item => 
        item.diets?.includes(dietType) || false
      );
};
