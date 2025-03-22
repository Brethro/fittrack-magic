
import { FoodItem, FoodCategory } from "@/types/diet";
import { reparseFoodDatabaseForDietTypes, getAvailableDietTypes } from "./foodDataProcessing";

// Store the current food categories for easy access
let currentFoodCategories: FoodCategory[] = [];

// Initialize the food categories
export const initializeFoodCategories = (categories: FoodCategory[]) => {
  currentFoodCategories = categories;
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

    // Reparse all diet types to ensure they're up-to-date
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

    // Reparse all diet types to ensure they're up-to-date
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
