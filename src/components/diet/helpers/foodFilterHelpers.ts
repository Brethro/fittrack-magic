import { FoodItem, DietType } from "@/types/diet";

// Cache for filtered items to improve performance
const filterCache = new Map<string, FoodItem[]>();
const CACHE_MAX_SIZE = 50;

// Keep track of seen item IDs to prevent duplicates 
const seenItemIds = new Set<string>();

/**
 * Deduplicates food items based on their ID
 */
export const deduplicateFoodItems = (items: FoodItem[]): FoodItem[] => {
  // Clear the set before each run to avoid growing too large
  seenItemIds.clear();
  
  return items.filter(item => {
    // If we've seen this ID before, skip it
    if (seenItemIds.has(item.id)) {
      return false;
    }
    
    // Otherwise, add it to our set and keep it
    seenItemIds.add(item.id);
    return true;
  });
};

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
  
  // Start with all items and deduplicate
  let filteredItems = deduplicateFoodItems([...items]);
  
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
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    // First pass: find exact matches or starts-with matches
    const exactMatches = filteredItems.filter(item => {
      const itemName = item.name.toLowerCase();
      return itemName === lowerQuery || itemName.startsWith(lowerQuery);
    });
    
    // Second pass: find items containing the search term
    const containsMatches = filteredItems.filter(item => {
      const itemName = item.name.toLowerCase();
      return !exactMatches.includes(item) && itemName.includes(lowerQuery);
    });
    
    // Third pass: check other fields
    const otherMatches = filteredItems.filter(item => {
      // Skip if already in other matches
      if (exactMatches.includes(item) || containsMatches.includes(item)) {
        return false;
      }
      
      // Check primary category
      if (item.primaryCategory?.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Check diets
      if (item.diets && item.diets.some(diet => diet.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      
      return false;
    });
    
    // Combine all matches in order of relevance
    filteredItems = [...exactMatches, ...containsMatches, ...otherMatches];
    
    // If still no matches, do a more flexible search
    if (filteredItems.length === 0) {
      // Check if any word in the item name contains any word in the query
      const queryWords = lowerQuery.split(/\s+/);
      
      filteredItems = items.filter(item => {
        const nameWords = item.name.toLowerCase().split(/\s+/);
        return queryWords.some(qw => nameWords.some(nw => nw.includes(qw) || qw.includes(nw)));
      });
    }
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
