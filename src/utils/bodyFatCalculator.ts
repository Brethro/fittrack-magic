
/**
 * Utility functions for body fat calculations
 */

/**
 * Calculates the body fat percentage based on current weight and estimated fat-free mass
 * This is a simplified calculation assuming fat-free mass remains constant
 * 
 * @param currentWeight Current weight in kg or lbs
 * @param currentBodyFat Current body fat percentage
 * @param newWeight New weight in same units as currentWeight
 * @returns Estimated body fat percentage at the new weight
 */
export const calculateBodyFatPercentage = (
  currentWeight: number,
  currentBodyFat: number,
  newWeight: number
): number => {
  // Calculate fat-free mass (which remains constant during weight changes)
  const fatFreeMass = currentWeight * (1 - currentBodyFat / 100);
  
  // Calculate new body fat percentage at new weight
  const newBodyFat = 100 * (1 - (fatFreeMass / newWeight));
  
  // Ensure we don't return a negative value
  return Math.max(newBodyFat, 0);
};

/**
 * Calculates the weight needed to reach a target body fat percentage
 * This assumes fat-free mass remains constant
 * 
 * @param currentWeight Current weight in kg or lbs
 * @param currentBodyFat Current body fat percentage
 * @param targetBodyFat Target body fat percentage
 * @returns Weight needed to reach target body fat
 */
export const calculateWeightForTargetBodyFat = (
  currentWeight: number,
  currentBodyFat: number,
  targetBodyFat: number
): number => {
  // Calculate fat-free mass
  const fatFreeMass = currentWeight * (1 - currentBodyFat / 100);
  
  // Calculate weight needed for target body fat
  return fatFreeMass / (1 - targetBodyFat / 100);
};
