
/**
 * Main nutrition calculator utility
 * Re-exports specific functions from specialized calculators
 */

// Export BMR calculation from metabolic rate calculator
export { calculateBMR } from './metabolicRateCalculator';

// Export macro calculation utilities
export { 
  calculateMacroCalories,
  calculateMacroDistribution 
} from './macroCalculator';

// Export weight gain calculators
export {
  calculateMaxSurplusPercentage,
  calculateMinSurplusCalories,
  calculateWeightGainCalories
} from './weightGainCalculator';

// Export weight loss calculators
export {
  getMaxAllowedDeficit,
  getMinDeficitPercentage,
  calculateTargetDeficitPercentage,
  calculateWeightLossCalories
} from './weightLossCalculator';

// Re-export convenience functions for unit conversion
export {
  getHeightInCm,
  getWeightInKg,
  calculateTDEE
} from './metabolicRateCalculator';
