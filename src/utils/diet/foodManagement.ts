
import { FoodItem, FoodCategory } from "@/types/diet";
import { reparseFoodDatabaseForDietTypes, getAvailableDietTypes } from "./foodDataProcessing";

// Store the current food categories for easy access
let currentFoodCategories: FoodCategory[] = [];

// Initialize the food categories
export const initializeFoodCategories = (categories: FoodCategory[]) => {
  currentFoodCategories = categories;
  // Always reparse when the food database is initialized
  reparseFoodDatabaseForDietTypes(currentFoodCategories);
  return currentFoodCategories;
};

// Get the current food categories
export const getCurrentFoodCategories = (): FoodCategory[] => {
  return currentFoodCategories;
};

// Add a new food item to the appropriate category
export const addFoodItem = (newFood: FoodItem): {
  success: boolean;
  message: string;
  dietTypes: string[];
} => {
  try {
    // Validate the food item
    if (!newFood.id || !newFood.name || !newFood.primaryCategory) {
      return {
        success: false,
        message: "Food item missing required fields (id, name, or primaryCategory)",
        dietTypes: getAvailableDietTypes()
      };
    }

    // Find the appropriate category based on the primary category
    const categoryIndex = currentFoodCategories.findIndex(
      category => category.name.toLowerCase() === newFood.primaryCategory.toLowerCase()
    );

    if (categoryIndex === -1) {
      // If the exact category doesn't exist, try to find a matching category from secondaryCategories
      if (newFood.secondaryCategories && newFood.secondaryCategories.length > 0) {
        for (const secondaryCategory of newFood.secondaryCategories) {
          const secondaryCategoryIndex = currentFoodCategories.findIndex(
            category => category.name.toLowerCase() === secondaryCategory.toLowerCase()
          );
          
          if (secondaryCategoryIndex !== -1) {
            // We found a valid category in secondaryCategories, use it
            console.log(`Category '${newFood.primaryCategory}' not found. Using secondary category '${secondaryCategory}' instead.`);
            
            // Create a copy of the food with the updated primaryCategory
            const updatedFood = {
              ...newFood,
              primaryCategory: secondaryCategory
            };
            
            // Now add the food with the updated category
            return addFoodItem(updatedFood);
          }
        }
      }
      
      // If we reach here, neither primary nor secondary categories match existing ones
      return {
        success: false,
        message: `Category '${newFood.primaryCategory}' not found and no valid secondary categories. Available categories: ${currentFoodCategories.map(c => c.name).join(', ')}`,
        dietTypes: getAvailableDietTypes()
      };
    }

    // Check if food with same ID already exists
    const existingFoodIndex = currentFoodCategories[categoryIndex].items.findIndex(
      item => item.id === newFood.id
    );

    if (existingFoodIndex !== -1) {
      // Update existing food
      currentFoodCategories[categoryIndex].items[existingFoodIndex] = newFood;
    } else {
      // Add new food
      currentFoodCategories[categoryIndex].items.push(newFood);
    }

    // Always reparse all diet types to ensure they're up-to-date
    const updatedDietTypes = reparseFoodDatabaseForDietTypes(currentFoodCategories);

    return {
      success: true,
      message: existingFoodIndex !== -1 
        ? `Updated food '${newFood.name}' and reparsed diet types` 
        : `Added food '${newFood.name}' and reparsed diet types`,
      dietTypes: updatedDietTypes
    };
  } catch (error) {
    console.error("Error adding food item:", error);
    return {
      success: false,
      message: `Error adding food: ${error instanceof Error ? error.message : 'Unknown error'}`,
      dietTypes: getAvailableDietTypes()
    };
  }
};

// Remove a food item by ID
export const removeFoodItem = (foodId: string): {
  success: boolean;
  message: string;
  dietTypes: string[];
} => {
  try {
    let foodRemoved = false;
    let foodName = "";

    // Find and remove the food item
    for (const category of currentFoodCategories) {
      const foodIndex = category.items.findIndex(item => item.id === foodId);
      if (foodIndex !== -1) {
        foodName = category.items[foodIndex].name;
        category.items.splice(foodIndex, 1);
        foodRemoved = true;
        break;
      }
    }

    if (!foodRemoved) {
      return {
        success: false,
        message: `Food with ID '${foodId}' not found`,
        dietTypes: getAvailableDietTypes()
      };
    }

    // Always reparse all diet types to ensure they're up-to-date
    const updatedDietTypes = reparseFoodDatabaseForDietTypes(currentFoodCategories);

    return {
      success: true,
      message: `Removed food '${foodName}' and reparsed diet types`,
      dietTypes: updatedDietTypes
    };
  } catch (error) {
    console.error("Error removing food item:", error);
    return {
      success: false,
      message: `Error removing food: ${error instanceof Error ? error.message : 'Unknown error'}`,
      dietTypes: getAvailableDietTypes()
    };
  }
};

// Batch import foods from JSON
export const importFoodsFromJson = (
  jsonData: string | object,
  categoryMappings: Record<string, string> = {}
): {
  success: boolean;
  message: string;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  failedItems: Array<{item: any, reason: string}>;
  dietTypes: string[];
} => {
  try {
    // Parse the JSON if it's a string
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    let foodItems: any[] = [];
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // Original format: array of food items
      foodItems = data;
    } else if (typeof data === 'object' && data !== null) {
      // New format: object with category keys containing arrays of food items
      Object.entries(data).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          // For each item in the category array, add it to our flat list
          items.forEach((item: any) => {
            // If the item doesn't already have a primaryCategory, use the category key
            if (!item.primaryCategory) {
              item.primaryCategory = category;
            }
            foodItems.push(item);
          });
        }
      });
    } else {
      return {
        success: false,
        message: "Import data must be an array of food items or an object with category keys",
        addedCount: 0,
        updatedCount: 0,
        failedCount: 0,
        failedItems: [],
        dietTypes: getAvailableDietTypes()
      };
    }
    
    // Validate we have food items to process
    if (foodItems.length === 0) {
      return {
        success: false,
        message: "No valid food items found in the import data",
        addedCount: 0,
        updatedCount: 0,
        failedCount: 0,
        failedItems: [],
        dietTypes: getAvailableDietTypes()
      };
    }
    
    let addedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    let failedItems: Array<{item: any, reason: string}> = [];
    
    // Get a list of valid category names for quick reference
    const validCategoryNames = currentFoodCategories.map(cat => cat.name.toLowerCase());
    
    // Log the valid categories for debugging
    console.log("Valid categories:", validCategoryNames);
    console.log("Category mappings:", categoryMappings);
    
    // Process each food item in the array
    for (const item of foodItems) {
      // Validate the food item has the minimum required fields
      if (!item.id || !item.name || !item.primaryCategory) {
        console.error("Invalid food item:", item);
        failedCount++;
        failedItems.push({
          item,
          reason: `Missing required fields (id: ${item.id}, name: ${item.name}, primaryCategory: ${item.primaryCategory})`
        });
        continue;
      }
      
      // Check if the primary category exists
      let primaryCategory = item.primaryCategory;
      let categoryFound = validCategoryNames.includes(primaryCategory.toLowerCase());
      
      // If primary category doesn't exist, try to use a secondary category
      if (!categoryFound && item.secondaryCategories && item.secondaryCategories.length > 0) {
        for (const secCat of item.secondaryCategories) {
          if (validCategoryNames.includes(secCat.toLowerCase())) {
            primaryCategory = secCat;
            categoryFound = true;
            console.log(`Using secondary category '${secCat}' for item '${item.name}' because primary category '${item.primaryCategory}' wasn't found`);
            break;
          }
        }
      }
      
      // Check user-provided category mappings
      if (!categoryFound) {
        const lcPrimaryCategory = primaryCategory.toLowerCase();
        
        // First check exact match in user-provided mappings
        if (categoryMappings[lcPrimaryCategory]) {
          primaryCategory = categoryMappings[lcPrimaryCategory];
          categoryFound = validCategoryNames.includes(primaryCategory.toLowerCase());
          if (categoryFound) {
            console.log(`Using user-provided mapping for '${item.primaryCategory}' to '${primaryCategory}'`);
          }
        }
      }
      
      // If we didn't find a valid category, we'll automatically map specific categories
      if (!categoryFound) {
        // Map from known non-standard categories to valid ones
        const categoryMapping: Record<string, string> = {
          'shellfish': 'Fish & Seafood',  // Updated to match actual category name
          'seafood': 'Fish & Seafood',    // Updated to match actual category name
          'mollusks': 'Fish & Seafood',   // Updated to match actual category name
          'mushrooms': 'vegetable',
          'game': 'Meats & Poultry',      // Updated to match actual category name
          'offal': 'Meats & Poultry'      // Updated to match actual category name
          // Add more mappings as needed
        };
        
        const lcPrimaryCategory = primaryCategory.toLowerCase();
        if (categoryMapping[lcPrimaryCategory]) {
          primaryCategory = categoryMapping[lcPrimaryCategory];
          categoryFound = validCategoryNames.includes(primaryCategory.toLowerCase());
          if (categoryFound) {
            console.log(`Mapped non-standard category '${item.primaryCategory}' to '${primaryCategory}'`);
          }
        }
      }
      
      // Try to match by similar name if still not found
      if (!categoryFound) {
        // For each valid category, check if it contains part of our primary category or vice versa
        for (const validCategory of currentFoodCategories) {
          const validCatName = validCategory.name.toLowerCase();
          const primaryCatName = primaryCategory.toLowerCase();
          
          if (validCatName.includes(primaryCatName) || primaryCatName.includes(validCatName)) {
            primaryCategory = validCategory.name;
            categoryFound = true;
            console.log(`Using fuzzy match from '${item.primaryCategory}' to '${primaryCategory}'`);
            break;
          }
        }
      }
      
      // If we still don't have a valid category, report the failure
      if (!categoryFound) {
        console.error(`Category '${primaryCategory}' not found for item '${item.name}'`);
        failedCount++;
        failedItems.push({
          item,
          reason: `Category '${primaryCategory}' not found. Available categories: ${currentFoodCategories.map(c => c.name).join(', ')}`
        });
        continue;
      }
      
      // Map properties to match our FoodItem structure
      const foodItem: Partial<FoodItem> = {
        id: item.id,
        name: item.name,
        primaryCategory: primaryCategory, // Use the possibly remapped category
        secondaryCategories: item.secondaryCategories,
        diets: item.diets,
        servingSize: item.servingSize,
        servingSizeGrams: item.servingSizeGrams,
        
        // Map nutrition properties with fallbacks to the right property names in our system
        protein: item.protein || 0,
        carbs: item.carbs || item.totalCarbohydrates || 0, 
        fats: item.fats || item.totalFat || 0,
        caloriesPerServing: item.caloriesPerServing || item.calories || 0,
        fiber: item.fiber || item.dietaryFiber || 0,
        sugars: item.sugars || item.totalSugars || 0,
        
        // Optional detailed nutrition info
        saturatedFat: item.saturatedFat,
        transFat: item.transFat,
        polyunsaturatedFat: item.polyunsaturatedFat,
        monounsaturatedFat: item.monounsaturatedFat,
        cholesterol: item.cholesterol,
        sodium: item.sodium,
        addedSugars: item.addedSugars,
        vitaminA: item.vitaminA,
        vitaminC: item.vitaminC,
        vitaminD: item.vitaminD,
        calcium: item.calcium,
        iron: item.iron,
        potassium: item.potassium
      };
      
      // Try to add the food item
      const result = addFoodItem(foodItem as FoodItem);
      
      if (result.success) {
        if (result.message.includes("Updated food")) {
          updatedCount++;
        } else {
          addedCount++;
        }
      } else {
        console.error("Failed to add food item:", result.message, item);
        failedCount++;
        failedItems.push({
          item,
          reason: result.message
        });
      }
    }
    
    // Always reparse all diet types after the batch import
    const updatedDietTypes = reparseFoodDatabaseForDietTypes(currentFoodCategories);
    
    // Prepare detailed error message if there were failures
    let detailedMessage = `Imported ${addedCount} new foods, updated ${updatedCount} existing foods, ${failedCount} failed`;
    
    if (failedCount > 0) {
      detailedMessage += `\n\nFailed Items (showing first 5):\n`;
      failedItems.slice(0, 5).forEach((failure, index) => {
        detailedMessage += `${index + 1}. ${failure.item.name || failure.item.id || 'Unknown'}: ${failure.reason}\n`;
      });
      
      if (failedItems.length > 5) {
        detailedMessage += `...and ${failedItems.length - 5} more failures\n`;
      }
      
      // List available categories to help diagnose category-related issues
      detailedMessage += `\nAvailable Categories: ${currentFoodCategories.map(c => c.name).join(', ')}`;
    }
    
    return {
      success: addedCount > 0 || updatedCount > 0,
      message: detailedMessage,
      addedCount,
      updatedCount,
      failedCount,
      failedItems,
      dietTypes: updatedDietTypes
    };
  } catch (error) {
    console.error("Error importing foods from JSON:", error);
    return {
      success: false,
      message: `Error importing foods: ${error instanceof Error ? error.message : 'Unknown error'}`,
      addedCount: 0,
      updatedCount: 0,
      failedCount: 0,
      failedItems: [],
      dietTypes: getAvailableDietTypes()
    };
  }
};

// New function to update the food database with a new set of categories
export const updateFoodDatabase = (
  newCategories: FoodCategory[]
): {
  success: boolean;
  message: string;
  dietTypes: string[];
} => {
  try {
    // Replace the current food categories with the new ones
    currentFoodCategories = newCategories;
    
    // Always reparse all diet types after updating the food database
    const updatedDietTypes = reparseFoodDatabaseForDietTypes(currentFoodCategories);
    
    return {
      success: true,
      message: `Updated food database with ${newCategories.length} categories and reparsed diet types`,
      dietTypes: updatedDietTypes
    };
  } catch (error) {
    console.error("Error updating food database:", error);
    return {
      success: false,
      message: `Error updating food database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      dietTypes: getAvailableDietTypes()
    };
  }
};
