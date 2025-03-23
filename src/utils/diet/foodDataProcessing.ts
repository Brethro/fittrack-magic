
/**
 * @deprecated - This file is scheduled for replacement with Open Food Facts API integration
 * 
 * This file now re-exports functionality from smaller, more focused modules
 * to maintain backward compatibility with existing imports.
 */

// Re-export from the new diet type management module
export {
  availableDietTypes,
  addDietType,
  collectDietTypes,
  getAvailableDietTypes,
  reparseFoodDatabaseForDietTypes
} from './dietTypeManagement';

// Re-export from the category display names module
export { categoryDisplayNames } from './categoryDisplayNames';

// Re-export from the food processing utilities module
export {
  processRawFoodData,
  batchProcessFoodData
} from './foodProcessingUtils';

// Re-export from the food search utilities module
export { searchFoodItems } from './foodSearchUtils';

// Re-export monitoring and feedback utilities for external use
export { 
  logCategorizationEvent, 
  logErrorEvent 
} from '@/utils/diet/testingMonitoring';

export { 
  fuzzyFindFood,
  identifyPotentialMiscategorizations
} from '@/utils/diet/fuzzyMatchUtils';
