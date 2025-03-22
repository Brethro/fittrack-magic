
import { FoodCategory, FoodItem, FoodPrimaryCategory } from "@/types/diet";
import { migrateExistingFoodData, batchMigrateExistingFoodData, validateFoodData, tagFoodWithDiets } from "@/utils/diet/dietDataMigration";
import { logCategorizationEvent, logErrorEvent } from "@/utils/diet/testingMonitoring";
import { fuzzyFindFood, clearFuzzyMatchCache, identifyPotentialMiscategorizations } from "@/utils/diet/fuzzyMatchUtils";

// Map technical category names to human-readable display names
export const categoryDisplayNames: Record<FoodPrimaryCategory, string> = {
  meat: "Meats",
  redMeat: "Red Meats",
  poultry: "Poultry",
  fish: "Fish",
  seafood: "Seafood",
  dairy: "Dairy Products",
  egg: "Eggs",
  grain: "Grains",
  legume: "Legumes",
  vegetable: "Vegetables",
  fruit: "Fruits",
  nut: "Nuts",
  seed: "Seeds",
  oil: "Oils",
  sweetener: "Sweeteners",
  herb: "Herbs",
  spice: "Spices",
  processedFood: "Processed Foods",
  other: "Other Foods"
};

// Process each food item with the migration helper to add primaryCategory and validate
export const processRawFoodData = (categories: { name: string, items: Omit<FoodItem, 'primaryCategory'>[] }[]): FoodCategory[] => {
  console.log("Processing raw food data...");
  
  // Filter out categories with empty items arrays to avoid processing empty data
  const nonEmptyCategories = categories.filter(category => category.items && category.items.length > 0);
  console.log(`Found ${nonEmptyCategories.length} non-empty food categories.`);
  
  // Return only non-empty categories with proper structure
  if (nonEmptyCategories.length === 0) {
    console.log("No food items found in any category. Returning empty array.");
    return [];
  }
  
  const processedCategories = nonEmptyCategories.map(category => {
    console.log(`Processing category: ${category.name} with ${category.items.length} items`);
    
    const migratedItems = category.items.map(item => {
      // First ensure we have proper categorization
      const migratedItem = migrateExistingFoodData(item as FoodItem);
      
      // Validate the migrated item
      const validation = validateFoodData(migratedItem);
      if (!validation.isValid) {
        console.warn(`Validation issues with food "${migratedItem.name}" in category "${category.name}":`, validation.issues);
        logErrorEvent('categorization', `Validation issues with food "${migratedItem.name}"`, validation.issues);
      }
      
      // Log successful categorization for monitoring
      logCategorizationEvent(migratedItem, migratedItem.primaryCategory || category.name, validation.isValid ? 1.0 : 0.6);
      
      // Add diet compatibility tags
      return tagFoodWithDiets(migratedItem);
    });
    
    return {
      name: category.name,
      items: migratedItems,
      // Add the display name for the category if it matches a primary category
      displayName: Object.entries(categoryDisplayNames).find(([key]) => 
        key.toLowerCase() === category.name.toLowerCase()
      )?.[1] || category.name
    };
  });
  
  // Clear fuzzy matching cache to ensure fresh data
  clearFuzzyMatchCache();
  
  // Check for potential miscategorizations
  const potentialIssues = identifyPotentialMiscategorizations(processedCategories);
  if (potentialIssues.length > 0) {
    console.log("Potential food categorization issues detected:", potentialIssues);
  }
  
  // Count total number of food items across all categories
  const totalFoodItems = processedCategories.reduce(
    (total, category) => total + category.items.length, 0
  );
  console.log(`Food data processing complete. Total items: ${totalFoodItems}`);
  
  return processedCategories;
};

// Process and validate all food data in batch
export const batchProcessFoodData = (categories: { name: string, items: Omit<FoodItem, 'primaryCategory'>[] }[]): FoodCategory[] => {
  const startTime = performance.now();
  
  // Filter out empty categories
  const nonEmptyCategories = categories.filter(category => category.items && category.items.length > 0);
  
  // First migrate all items to have proper categorization
  const migratedCategories = nonEmptyCategories.map(category => ({
    name: category.name,
    items: batchMigrateExistingFoodData(category.items as Partial<FoodItem>[])
  }));
  
  // Then tag all items with diet compatibility
  const processedCategories = migratedCategories.map(category => ({
    name: category.name,
    items: category.items.map(item => {
      // Log each categorization for monitoring
      logCategorizationEvent(item, item.primaryCategory || category.name);
      return tagFoodWithDiets(item);
    })
  }));
  
  // Clear fuzzy matching cache to ensure fresh data
  clearFuzzyMatchCache();
  
  const endTime = performance.now();
  console.log(`Batch food data processing completed in ${(endTime - startTime).toFixed(2)}ms`);
  
  return processedCategories;
};

// New function to search food items using fuzzy matching
export const searchFoodItems = (query: string, foodCategories: FoodCategory[]): FoodItem[] => {
  if (!query || query.length < 2) {
    return [];
  }
  
  // Use the fuzzy matching utility
  return fuzzyFindFood(query, foodCategories);
};

// Export monitoring and feedback utilities for external use
export { 
  logCategorizationEvent, 
  logErrorEvent, 
  fuzzyFindFood,
  identifyPotentialMiscategorizations
};
