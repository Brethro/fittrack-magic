
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

// COMPLETELY REWRITTEN: Improved function to scan all food data and collect diet types
export const reparseFoodDatabaseForDietTypes = (
  // Accept either processed food categories or raw food data
  foodCategories: FoodCategory[] | { name: string, items: Partial<FoodItem>[] }[]
): string[] => {
  console.log("===== STARTING COMPLETE FOOD DATABASE REPARSE =====");
  
  // Reset the available diet types - only keep "all"
  availableDietTypes.clear();
  availableDietTypes.add("all");
  
  let totalFoodItems = 0;
  let totalDietTypesFound = 0;
  let uniqueDietTypes = new Set<string>();
  
  // First: Import all food data modules to ensure we have the complete set
  // We'll need to handle these imports dynamically since they could change
  console.log("Loading all food category data modules...");
  
  try {
    // Process the provided foodCategories parameter which could be either
    // processed FoodCategory[] or raw food data
    
    console.log(`Processing ${foodCategories.length} food categories`);
    
    // Process every single food category
    foodCategories.forEach(category => {
      if (!category.items || !Array.isArray(category.items)) {
        console.log(`Skipping category ${category.name}: no items array found`);
        return;
      }
      
      console.log(`Scanning category: ${category.name} (${category.items.length} items)`);
      totalFoodItems += category.items.length;
      
      // Check each item in this category
      category.items.forEach(item => {
        // Skip if item doesn't have required fields
        if (!item || !item.name) {
          return;
        }
        
        // If the item has diet info, process each diet type
        if (item.diets && Array.isArray(item.diets)) {
          item.diets.forEach(diet => {
            // Normalize the diet type
            const normalizedDiet = diet.toLowerCase().trim();
            
            if (normalizedDiet.length >= 2) {
              // Only count it as new if we haven't seen it before
              if (!uniqueDietTypes.has(normalizedDiet)) {
                uniqueDietTypes.add(normalizedDiet);
                console.log(`Found new diet type: ${normalizedDiet} in ${item.name}`);
                totalDietTypesFound++;
              }
              
              // Add it to our global set
              availableDietTypes.add(normalizedDiet);
            }
          });
        }
      });
    });
    
    // Log detailed results
    console.log(`===== REPARSE RESULTS =====`);
    console.log(`Total food items processed: ${totalFoodItems}`);
    console.log(`Total unique diet types found: ${totalDietTypesFound}`);
    console.log(`Available diet types: ${Array.from(availableDietTypes).join(', ')}`);
    
    return getAvailableDietTypes();
  } catch (error) {
    console.error("Error during food database reparse:", error);
    return getAvailableDietTypes();
  }
};

// Export monitoring and feedback utilities for external use
export { 
  logCategorizationEvent, 
  logErrorEvent, 
  fuzzyFindFood,
  identifyPotentialMiscategorizations
};
