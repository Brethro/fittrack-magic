
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
  
  // Calculate protein based on lean body mass and goal
  let proteinPerKgLBM: number;
  
  if (isWeightGain) {
    // For weight gain (muscle building)
    if (isMale) {
      if (bf > 20) {
        proteinPerKgLBM = 2.2;
      } else if (bf > 12) {
        proteinPerKgLBM = 2.4;
      } else {
        proteinPerKgLBM = 2.6;
      }
    } else {
      if (bf > 28) {
        proteinPerKgLBM = 2.2;
      } else if (bf > 20) {
        proteinPerKgLBM = 2.4;
      } else {
        proteinPerKgLBM = 2.6;
      }
    }
    
    // For aggressive bulks, provide even more protein
    if (goalPace === "aggressive") {
      proteinPerKgLBM += 0.2;
    }
  } else {
    // For weight loss
    if (isMale) {
      if (bf > 25) {
        proteinPerKgLBM = 1.8;
      } else if (bf > 15) {
        proteinPerKgLBM = 2.2;
      } else {
        proteinPerKgLBM = 2.4;
      }
    } else {
      if (bf > 32) {
        proteinPerKgLBM = 1.8;
      } else if (bf > 23) {
        proteinPerKgLBM = 2.2;
      } else {
        proteinPerKgLBM = 2.4;
      }
    }
  }
  
  // Calculate protein in grams
  const proteinGrams = Math.round(leanBodyMass * proteinPerKgLBM);
  const proteinCalories = proteinGrams * 4;
  
  // Fat calculation (different for weight gain vs loss)
  let fatPercentage: number;
  if (isWeightGain) {
    fatPercentage = 0.30; // Higher fat for weight gain (hormonal support)
  } else {
    fatPercentage = 0.25; // Lower fat for weight loss
  }
  
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
