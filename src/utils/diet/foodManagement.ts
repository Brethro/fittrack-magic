
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
      // If category doesn't exist, we could create it, but that's probably an error
      return {
        success: false,
        message: `Category '${newFood.primaryCategory}' not found`,
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
  jsonData: string | object
): {
  success: boolean;
  message: string;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  dietTypes: string[];
} => {
  try {
    // Parse the JSON if it's a string
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    let foodItems: Partial<FoodItem>[] = [];
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // Original format: array of food items
      foodItems = data;
    } else if (typeof data === 'object' && data !== null) {
      // New format: object with category keys containing arrays of food items
      Object.entries(data).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          // For each item in the category array, add it to our flat list
          items.forEach(item => {
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
        dietTypes: getAvailableDietTypes()
      };
    }
    
    let addedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    
    // Process each food item in the array
    for (const item of foodItems) {
      // Validate the food item has the minimum required fields
      if (!item.id || !item.name || !item.primaryCategory) {
        console.error("Invalid food item:", item);
        failedCount++;
        continue;
      }
      
      // Map properties to match our FoodItem structure
      const foodItem: Partial<FoodItem> = {
        ...item,
        // Map known property name differences
        protein: item.protein,
        carbs: item.totalCarbohydrates, 
        fats: item.totalFat,
        caloriesPerServing: item.calories,
        fiber: item.dietaryFiber,
        sugars: item.totalSugars,
        servingSize: item.servingSize,
        servingSizeGrams: item.servingSizeGrams,
        // Make sure secondary categories is an array if present
        secondaryCategories: item.secondaryCategories && Array.isArray(item.secondaryCategories) 
          ? item.secondaryCategories 
          : undefined
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
      }
    }
    
    // Always reparse all diet types after the batch import
    const updatedDietTypes = reparseFoodDatabaseForDietTypes(currentFoodCategories);
    
    return {
      success: addedCount > 0 || updatedCount > 0,
      message: `Imported ${addedCount} new foods, updated ${updatedCount} existing foods, ${failedCount} failed`,
      addedCount,
      updatedCount,
      failedCount,
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
