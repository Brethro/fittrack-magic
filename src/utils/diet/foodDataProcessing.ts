
import { FoodCategory } from "@/types/diet";

/**
 * @deprecated - This module has been replaced by Open Food Facts API integration
 * 
 * This file now contains stub implementations to maintain compatibility
 * during the migration to Open Food Facts API.
 */

// Stub export for backward compatibility
export const categoryDisplayNames = {};

// Stub implementation for backward compatibility
export const processRawFoodData = (categories: FoodCategory[]): FoodCategory[] => {
  console.warn('processRawFoodData is deprecated - Open Food Facts API migration in progress');
  return [];
};

// Stub implementation for backward compatibility
export const batchProcessFoodData = () => {
  console.warn('batchProcessFoodData is deprecated - Open Food Facts API migration in progress');
  return [];
};

// Stub implementation for backward compatibility
export const searchFoodItems = () => {
  console.warn('searchFoodItems is deprecated - Open Food Facts API migration in progress');
  return [];
};

// Stub implementation for backward compatibility
export const availableDietTypes = ["all"];

// Stub implementation for backward compatibility
export const addDietType = () => {};

// Stub implementation for backward compatibility
export const collectDietTypes = () => ["all"];

// Stub implementation for backward compatibility
export const getAvailableDietTypes = () => ["all"];

// Stub implementation for backward compatibility
export const reparseFoodDatabaseForDietTypes = () => ["all"];

// Stub implementation for backward compatibility
export const logCategorizationEvent = () => {};

// Stub implementation for backward compatibility
export const logErrorEvent = () => {};

// Stub implementation for backward compatibility
export const fuzzyFindFood = () => [];

// Stub implementation for backward compatibility
export const identifyPotentialMiscategorizations = () => [];
