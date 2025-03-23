
/**
 * @deprecated - This entire file is scheduled for removal in the Open Food Facts API migration
 * 
 * All utility functions have been moved to their respective focused files.
 * New code should import directly from the specific utility modules.
 * 
 * MIGRATION PLAN:
 * 1. Phase out imports from this file
 * 2. Replace with Open Food Facts API integration
 * 3. Remove this file when all imports have been migrated
 */

// Re-export all utility functions from their respective files
export * from './macroUtils';
export * from './mealAdjustUtils';
export * from './mealGenerationUtils';
export * from './dietCompatibilityUtils';
export * from './diet/foodDataProcessing';
export * from './diet/foodManagement';
export * from './diet/fuzzyMatchUtils';
export * from './diet/testingMonitoring';
export * from './diet/userFeedbackUtils';
