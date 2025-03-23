
import { FoodItem, FoodCategory } from "@/types/diet";

/**
 * @deprecated - This module has been replaced by Open Food Facts API integration
 * 
 * This file now contains stub implementations to maintain compatibility
 * during the migration to Open Food Facts API.
 */

// Stub implementation for backward compatibility
export const initializeFoodCategories = () => {
  console.warn('initializeFoodCategories is deprecated - Open Food Facts API migration in progress');
  return [];
};

// Stub implementation for backward compatibility
export const getCurrentFoodCategories = (): FoodCategory[] => {
  console.warn('getCurrentFoodCategories is deprecated - Open Food Facts API migration in progress');
  return [];
};

// Stub implementation for backward compatibility
export const addFoodItem = (): any => {
  console.warn('addFoodItem is deprecated - Open Food Facts API migration in progress');
  return {
    success: false,
    message: "Food database is being migrated to Open Food Facts API",
    dietTypes: ["all"]
  };
};

// Stub implementation for backward compatibility
export const removeFoodItem = (): any => {
  console.warn('removeFoodItem is deprecated - Open Food Facts API migration in progress');
  return {
    success: false,
    message: "Food database is being migrated to Open Food Facts API",
    dietTypes: ["all"]
  };
};

// Stub implementation for backward compatibility
export const importFoodsFromJson = (): any => {
  console.warn('importFoodsFromJson is deprecated - Open Food Facts API migration in progress');
  return {
    success: false,
    message: "Food database is being migrated to Open Food Facts API",
    addedCount: 0,
    updatedCount: 0,
    failedCount: 0,
    failedItems: [],
    dietTypes: ["all"]
  };
};

// Stub implementation for backward compatibility
export const updateFoodDatabase = (): any => {
  console.warn('updateFoodDatabase is deprecated - Open Food Facts API migration in progress');
  return {
    success: false,
    message: "Food database is being migrated to Open Food Facts API",
    dietTypes: ["all"]
  };
};
