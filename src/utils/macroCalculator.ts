
/**
 * Utilities for calculating and working with macronutrients
 */

/**
 * Calculates the caloric contribution of each macronutrient
 * based on their gram values.
 * - Protein: 4 calories per gram
 * - Carbohydrates: 4 calories per gram
 * - Fat: 9 calories per gram
 */
export const calculateMacroCalories = (macros: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): {
  protein: number;
  carbs: number;
  fat: number;
  total: number;
} => {
  // Calculate calories from each macro
  const proteinCalories = macros.protein * 4;
  const carbCalories = macros.carbs * 4;
  const fatCalories = macros.fat * 9;
  
  // Calculate total calories from macros
  const totalFromMacros = proteinCalories + carbCalories + fatCalories;
  
  // Use the higher value between provided calories and calculated total
  // This ensures we don't show a misleading total if the macros don't exactly match
  const total = Math.max(macros.calories, totalFromMacros);
  
  return {
    protein: proteinCalories,
    carbs: carbCalories,
    fat: fatCalories,
    total
  };
};

/**
 * Calculate recommended macronutrient distribution based on
 * calorie target, body composition, and weight goal
 */
export const calculateMacroDistribution = (
  dailyCalories: number,
  leanBodyMass: number, // in kg
  bodyFatPercentage: number | null,
  isWeightGain: boolean,
  gender: 'male' | 'female' | null,
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null
): {
  protein: number;
  carbs: number;
  fats: number;
} => {
  const bf = bodyFatPercentage || (gender === 'female' ? 25 : 18);
  const isMale = gender !== 'female';
  
  // Calculate protein based on lean body mass - use 2.2g/kg for aggressive bulking
  let proteinPerKgLBM: number;
  
  if (isWeightGain) {
    // Base protein for muscle building
    proteinPerKgLBM = 2.2;
    
    // Adjust based on body fat levels
    if (isMale) {
      if (bf > 20) {
        proteinPerKgLBM = 2.2; // Base level for higher body fat
      } else if (bf > 12) {
        proteinPerKgLBM = 2.3; // Slightly higher for moderate body fat
      } else {
        proteinPerKgLBM = 2.4; // Higher for low body fat
      }
    } else {
      if (bf > 28) {
        proteinPerKgLBM = 2.2; // Base level for higher body fat
      } else if (bf > 20) {
        proteinPerKgLBM = 2.3; // Slightly higher for moderate body fat
      } else {
        proteinPerKgLBM = 2.4; // Higher for low body fat
      }
    }
    
    // IMPROVED: Increased protein for aggressive bulks to optimize muscle protein synthesis
    if (goalPace === "aggressive") {
      proteinPerKgLBM += 0.4; // Increased from 0.2 to 0.4 (totaling 2.6-2.8g/kg)
    } else if (goalPace === "moderate") {
      proteinPerKgLBM += 0.1;
    }
  } else {
    // For weight loss (slightly increased for muscle preservation)
    if (isMale) {
      if (bf > 25) {
        proteinPerKgLBM = 2.0; // Increased from 1.8
      } else if (bf > 15) {
        proteinPerKgLBM = 2.4; // Increased from 2.2
      } else {
        proteinPerKgLBM = 2.6; // Increased from 2.4
      }
    } else {
      if (bf > 32) {
        proteinPerKgLBM = 2.0; // Increased from 1.8
      } else if (bf > 23) {
        proteinPerKgLBM = 2.4; // Increased from 2.2
      } else {
        proteinPerKgLBM = 2.6; // Increased from 2.4
      }
    }
  }
  
  // Calculate protein in grams
  const proteinGrams = Math.round(leanBodyMass * proteinPerKgLBM);
  const proteinCalories = proteinGrams * 4;
  
  // Fat calculation - set to exactly 25% of daily calories
  const fatPercentage = 0.25; // Exactly 25% of calories from fat
  const fatCalories = Math.round(dailyCalories * fatPercentage);
  const fatGrams = Math.round(fatCalories / 9);
  
  // Carbs calculation (remaining calories)
  const carbCalories = dailyCalories - proteinCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4);
  
  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams
  };
};
