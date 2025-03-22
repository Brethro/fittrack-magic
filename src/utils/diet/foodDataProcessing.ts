
import { FoodCategory, FoodItem, FoodPrimaryCategory, DietType } from "@/types/diet";
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

// Store unique diet types found across all food items - always start with "all"
export const availableDietTypes = new Set<string>(["all"]);

// Add a new diet type to our available diets
export const addDietType = (dietType: string): void => {
  if (!dietType || typeof dietType !== 'string') return;
  
  // Normalize diet type (lowercase, trim whitespace)
  const normalizedDiet = dietType.toLowerCase().trim();
  
  // Don't add empty strings or very short diet names (likely typos)
  if (normalizedDiet.length < 2) return;
  
  // Add to available diets
  availableDietTypes.add(normalizedDiet);
  console.log(`Added diet type: ${normalizedDiet} to available diets`);
  console.log("Current available diets:", Array.from(availableDietTypes));
};

// Helper function to extract and collect all diet types from food items
export const collectDietTypes = (categories: FoodCategory[]): Set<string> => {
  const dietTypes = new Set<string>(["all"]);
  
  categories.forEach(category => {
    category.items.forEach(item => {
      if (item.diets && Array.isArray(item.diets)) {
        item.diets.forEach(diet => {
          dietTypes.add(diet);
          // Also add to the global available diets
          addDietType(diet);
        });
      }
    });
  });
  
  console.log("Collected diet types from food data:", Array.from(dietTypes));
  return dietTypes;
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
      
      // Check for diet information and add to available diets
      if (migratedItem.diets && Array.isArray(migratedItem.diets)) {
        migratedItem.diets.forEach(diet => addDietType(diet));
      }
      
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
  
  // Log the available diet types after processing
  console.log("Available diet types after food processing:", Array.from(availableDietTypes));
  
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
      // Check for diet information and add to available diets
      if (item.diets && Array.isArray(item.diets)) {
        item.diets.forEach(diet => addDietType(diet));
      }
      
      // Log each categorization for monitoring
      logCategorizationEvent(item, item.primaryCategory || category.name);
      return tagFoodWithDiets(item);
    })
  }));
  
  // Clear fuzzy matching cache to ensure fresh data
  clearFuzzyMatchCache();
  
  const endTime = performance.now();
  console.log(`Batch food data processing completed in ${(endTime - startTime).toFixed(2)}ms`);
  console.log("Available diet types after batch processing:", Array.from(availableDietTypes));
  
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

// Get all unique diet types found in food data as a string array
export const getAvailableDietTypes = (): string[] => {
  return Array.from(availableDietTypes);
};

// Improved function to scan all food data and collect diet types
export const reparseFoodDatabaseForDietTypes = (foodCategories: FoodCategory[]): string[] => {
  console.log("Reparsing food database for diet types...");
  
  // Clear existing diet types except 'all'
  availableDietTypes.clear();
  availableDietTypes.add("all");
  
  // Track how many new diet types we find
  let dietTypeCount = 0;
  
  // Loop through each category
  foodCategories.forEach(category => {
    // Loop through each food item
    category.items.forEach(item => {
      // Check if the item has diet information
      if (item.diets && Array.isArray(item.diets)) {
        // Process each diet type found on this food item
        item.diets.forEach(diet => {
          // Only count as "new" if we haven't seen it before
          const isNewDiet = !availableDietTypes.has(diet);
          
          // Add to our global set of diet types
          addDietType(diet);
          
          // Increment count for reporting
          if (isNewDiet) dietTypeCount++;
        });
      }
    });
  });
  
  console.log(`Reparse complete. Found ${dietTypeCount} new unique diet types.`);
  return getAvailableDietTypes();
};

// Export monitoring and feedback utilities for external use
export { 
  logCategorizationEvent, 
  logErrorEvent, 
  fuzzyFindFood,
  identifyPotentialMiscategorizations
};
