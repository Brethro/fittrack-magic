import { FoodCategory, FoodItem } from "@/types/diet";

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
