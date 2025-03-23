
/**
 * Utility for calculating weight gain related values
 */

/**
 * Calculate maximum surplus percentage based on goal pace and body composition
 */
export const calculateMaxSurplusPercentage = (
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null,
  bodyFatPercentage: number | null,
  gender: 'male' | 'female' | null
): number => {
  // Set base maximum percentage based on pace
  let maxAdjustPercent: number;
  
  if (goalPace === "aggressive") {
    maxAdjustPercent = 19.99; // Exactly 19.99% for aggressive pace
  } else if (goalPace === "moderate") {
    maxAdjustPercent = 15.0; // 15% for moderate pace
  } else {
    maxAdjustPercent = 10.0; // 10% for conservative pace
  }
  
  // Adjust based on body fat percentage and gender for weight gain
  const bf = bodyFatPercentage || 15; // Default if not available
  const isMale = gender !== 'female';
  
  if (isMale) {
    if (bf > 20) {
      // Higher body fat - more conservative with surplus
      maxAdjustPercent = Math.min(maxAdjustPercent, 19.99); 
    } else if (bf < 10) {
      // Lower body fat - can be more aggressive with surplus
      maxAdjustPercent = Math.min(maxAdjustPercent + 5.0, 35.0);
    }
  } else {
    if (bf > 28) {
      // Higher body fat - more conservative with surplus
      maxAdjustPercent = Math.min(maxAdjustPercent, 19.99);
    } else if (bf < 18) {
      // Lower body fat - can be more aggressive with surplus
      maxAdjustPercent = Math.min(maxAdjustPercent + 5.0, 35.0);
    }
  }
  
  return maxAdjustPercent;
};

/**
 * Calculate minimum surplus in calories based on goal pace
 */
export const calculateMinSurplusCalories = (
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null
): number => {
  switch (goalPace) {
    case "aggressive": 
      return 500;
    case "moderate": 
      return 300;
    case "conservative": 
      return 150;
    default: 
      return 200; // default to a modest surplus
  }
};

/**
 * Calculate daily calories for weight gain based on TDEE and other factors
 */
export const calculateWeightGainCalories = (
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
  surplusPercentage: number,
  highSurplusWarning: boolean
} => {
  // Calculate weight change needed and caloric adjustment
  const weightDifference = Math.abs(targetWeight - startWeight);
  const caloriesPerUnit = useMetric ? 7700 : 3500; // Calories per kg or lb
  const totalCalorieAdjustment = weightDifference * caloriesPerUnit;
  const dailyCalorieAdjustment = totalCalorieAdjustment / daysUntilGoal;
  
  // Get minimum practical surplus values based on pace
  const minDailySurplus = calculateMinSurplusCalories(goalPace);
  
  // Get maximum allowed surplus percentage
  const maxSurplusPercentage = calculateMaxSurplusPercentage(goalPace, bodyFatPercentage, gender);
  
  // Calculate adjustment percentage based on required daily adjustment
  let calculatedAdjustPercent = dailyCalorieAdjustment / tdee;
  
  // For weight gain, apply minimum practical surplus
  const calculatedSurplus = tdee * calculatedAdjustPercent;
  
  // If calculated surplus is less than minimum, adjust the percentage
  if (calculatedSurplus < minDailySurplus) {
    calculatedAdjustPercent = minDailySurplus / tdee;
  }
  
  // Handle edge case where goal is extremely close to current weight
  if (weightDifference < 0.5) { // less than 0.5 pounds/kg difference
    // Even for tiny goals, ensure some minimal progress
    const modestSurplus = tdee * 0.05; // 5% surplus
    const dailySurplusFloor = Math.min(minDailySurplus, modestSurplus);
    
    calculatedAdjustPercent = dailySurplusFloor / tdee;
  }
  
  // Hard cap the calculated adjustment to the maximum percentage
  const maxAdjustDecimal = maxSurplusPercentage / 100;
  const finalAdjustPercentage = Math.max(0.05, Math.min(maxAdjustDecimal, calculatedAdjustPercent));
  
  // Calculate daily calories with the percentage-based adjustment
  let dailyCalories = Math.floor(tdee * (1 + finalAdjustPercentage));
  
  // For display purposes, calculate the actual surplus percentage
  let displaySurplusPercentage = ((dailyCalories - tdee) / tdee) * 100;
  
  // Special handling for aggressive pace
  let highSurplusWarning = false;
  
  // For aggressive pace, always use 19.99% and adjust calories to match
  if (goalPace === "aggressive") {
    // Ensure we use exactly 19.99% for consistency
    dailyCalories = Math.floor(tdee * 1.1999);
    displaySurplusPercentage = 19.99;
  }
  
  // Check if the surplus is unusually high
  if (displaySurplusPercentage > 20.0 && goalPace !== "aggressive") {
    highSurplusWarning = true;
  }
  
  return {
    dailyCalories,
    surplusPercentage: displaySurplusPercentage,
    highSurplusWarning
  };
};
