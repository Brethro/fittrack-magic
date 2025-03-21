
import Fuse from 'fuse.js';
import { FoodItem, FoodCategory } from '@/types/diet';

// Cache for Fuse instances to avoid recreating them
const fuseInstanceCache: Record<string, Fuse<FoodItem>> = {};

/**
 * Creates or retrieves a cached Fuse.js instance for fuzzy matching
 */
const getFuseInstance = (items: FoodItem[], cacheKey: string): Fuse<FoodItem> => {
  if (fuseInstanceCache[cacheKey]) {
    return fuseInstanceCache[cacheKey];
  }
  
  // Configure Fuse with appropriate options
  const fuseOptions = {
    keys: ['name', 'primaryCategory', 'secondaryCategories'],
    threshold: 0.4, // Lower threshold means more strict matching
    distance: 100,  // Maximum distance for Levenshtein distance
    ignoreLocation: true,
    shouldSort: true
  };
  
  const fuse = new Fuse(items, fuseOptions);
  fuseInstanceCache[cacheKey] = fuse;
  return fuse;
};

/**
 * Performs fuzzy search across all food items to find matches
 */
export const fuzzyFindFood = (
  query: string, 
  foodCategories: FoodCategory[]
): FoodItem[] => {
  // Flatten all food items for searching
  const allItems = foodCategories.flatMap(category => category.items);
  
  // Get or create Fuse instance
  const fuse = getFuseInstance(allItems, 'allItems');
  
  // Perform search
  const results = fuse.search(query);
  
  // Return just the items
  return results.map(result => result.item);
};

/**
 * Performs category-specific fuzzy search
 */
export const fuzzyFindInCategory = (
  query: string,
  categoryName: string,
  foodCategories: FoodCategory[]
): FoodItem[] => {
  // Find the specific category
  const category = foodCategories.find(cat => cat.name === categoryName);
  if (!category || !category.items.length) return [];
  
  // Get or create Fuse instance for this category
  const cacheKey = `category_${categoryName}`;
  const fuse = getFuseInstance(category.items, cacheKey);
  
  // Perform search
  const results = fuse.search(query);
  
  // Return just the items
  return results.map(result => result.item);
};

/**
 * Identifies potential categorization errors by checking if an item might belong to 
 * a different category based on its name
 */
export const identifyPotentialMiscategorizations = (
  foodCategories: FoodCategory[]
): { item: FoodItem, suggestedCategory: string, confidence: number }[] => {
  const potentialIssues: { item: FoodItem, suggestedCategory: string, confidence: number }[] = [];
  const categoryKeywords: Record<string, string[]> = {
    "Meats & Poultry": ["meat", "chicken", "beef", "pork", "turkey", "lamb", "duck"],
    "Fish & Seafood": ["fish", "salmon", "tuna", "shrimp", "crab", "lobster", "seafood"],
    "Eggs & Dairy": ["egg", "milk", "cheese", "yogurt", "cream", "butter", "dairy"],
    // ... add keywords for all categories
  };
  
  // Check each item against keywords from other categories
  foodCategories.forEach(category => {
    category.items.forEach(item => {
      Object.entries(categoryKeywords).forEach(([catName, keywords]) => {
        // Skip the item's own category
        if (catName === category.name) return;
        
        // Check if item name contains keywords from another category
        const matchingKeywords = keywords.filter(kw => 
          item.name.toLowerCase().includes(kw.toLowerCase())
        );
        
        if (matchingKeywords.length > 0) {
          const confidence = matchingKeywords.length / keywords.length;
          if (confidence > 0.3) { // Only suggest if reasonable confidence
            potentialIssues.push({
              item,
              suggestedCategory: catName,
              confidence
            });
          }
        }
      });
    });
  });
  
  return potentialIssues;
};

// Clear the instance cache (useful for testing or when data changes)
export const clearFuzzyMatchCache = () => {
  Object.keys(fuseInstanceCache).forEach(key => {
    delete fuseInstanceCache[key];
  });
};
