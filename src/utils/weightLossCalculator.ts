
/**
 * Utility for calculating weight loss related values
 */

/**
 * Determine the maximum safe deficit percentage based on body composition
 */
export const getMaxAllowedDeficit = (
  bodyFatPercentage: number | null,
  gender: 'male' | 'female' | null
): number => {
  const bf = bodyFatPercentage || 20;
  const isMale = gender !== 'female';
  
  // Determine the base maximum deficit based on body fat
  if (isMale) {
    if (bf < 10) {
      return 20.0; // Limit to 20% deficit for very low body fat
    } else if (bf < 12) {
      return 22.0; // Limit to 22% deficit for low body fat
    } else if (bf < 15) {
      return 25.0; // Standard 25% for moderate body fat
    } else {
      return 30.0; // Allow 30% deficit for higher body fat
    }
  } else {
    if (bf < 16) {
      return 20.0; // Limit to 20% deficit for very low body fat (women)
    } else if (bf < 20) {
      return 22.0; // Limit to 22% deficit for low body fat
    } else if (bf < 25) {
      return 25.0; // Standard 25% for moderate body fat
    } else {
      return 30.0; // Allow 30% deficit for higher body fat
    }
  }
};

/**
 * Get the minimum deficit percentage based on goal pace
 */
export const getMinDeficitPercentage = (
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null
): number => {
  if (goalPace === "aggressive") {
    return 20.0; // At least 20% for aggressive
  } else if (goalPace === "moderate") {
    return 15.0; // At least 15% for moderate
  } else {
    return 10.0; // At least 10% for conservative
  }
};

/**
 * Calculate the target deficit percentage based on goal pace and body composition
 */
export const calculateTargetDeficitPercentage = (
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null,
  bodyFatPercentage: number | null,
  gender: 'male' | 'female' | null
): number => {
  // Get base max deficit based on body fat
  const baseMaxDeficit = getMaxAllowedDeficit(bodyFatPercentage, gender);
  let targetDeficit = baseMaxDeficit;
  
  // Adjust based on goal pace
  if (goalPace === "aggressive") {
    // For aggressive, we add 5% to the base max - up to absolute cap of 35%
    const aggressiveBonus = 5.0;
    targetDeficit = Math.min(baseMaxDeficit + aggressiveBonus, 35.0);
  } else if (goalPace === "conservative") {
    // For conservative, we reduce by 5-10% depending on the base
    const conservativeReduction = baseMaxDeficit >= 25.0 ? 10.0 : 5.0;
    targetDeficit = Math.max(15.0, baseMaxDeficit - conservativeReduction);
  }
  
  return targetDeficit;
};

/**
 * Calculate daily calories for weight loss based on TDEE and other factors
 */
export const calculateWeightLossCalories = (
  tdee: number,
  targetWeight: number,
  startWeight: number,
  daysUntilGoal: number,
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null,
  bodyFatPercentage: number | null,
  gender: 'male' | 'female' | null,
  useMetric: boolean
): {
  dailyCalories: number,
  deficitPercentage: number
} => {
  // Calculate weight change needed and caloric adjustment
  const weightDifference = Math.abs(targetWeight - startWeight);
  const caloriesPerUnit = useMetric ? 7700 : 3500; // Calories per kg or lb
  const totalCalorieAdjustment = weightDifference * caloriesPerUnit;
  const dailyCalorieAdjustment = totalCalorieAdjustment / daysUntilGoal;
  
  // Get maximum allowed deficit percentage
  const maxDeficitPercentage = calculateTargetDeficitPercentage(goalPace, bodyFatPercentage, gender);
  
  // Get minimum deficit percentage
  const minDeficitPercentage = getMinDeficitPercentage(goalPace);
  
  // Calculate adjustment percentage based on required daily adjustment
  let calculatedAdjustPercent = (dailyCalorieAdjustment / tdee) * 100;
  
  // Hard cap the calculated adjustment to the appropriate range
  calculatedAdjustPercent = Math.max(minDeficitPercentage, Math.min(maxDeficitPercentage, calculatedAdjustPercent));
  
  // Calculate daily calories with the percentage-based adjustment
  let dailyCalories = Math.round(tdee * (1 - (calculatedAdjustPercent / 100)));
  
  // Enforce a minimum calorie floor (never go below 1200 calories regardless of deficit)
  dailyCalories = Math.max(1200, dailyCalories);
  
  // Calculate the actual deficit percentage after applying the floor
  const actualDeficitPercentage = ((tdee - dailyCalories) / tdee) * 100;
  
  return {
    dailyCalories,
    deficitPercentage: actualDeficitPercentage
  };
};
