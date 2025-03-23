
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
  
  // Get maximum allowed surplus percentage for pace-guided calculations
  const recommendedSurplusPercentage = calculateMaxSurplusPercentage(goalPace, bodyFatPercentage, gender);
  
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
  
  // NEW: Allow higher surpluses than recommended if required by timeline
  // but set a hard cap at 50% to prevent unreasonable values
  const absoluteMaxSurplus = 0.50; // 50% maximum surplus
  let finalAdjustPercentage = Math.max(0.05, Math.min(absoluteMaxSurplus, calculatedAdjustPercent));
  
  // Special case for aggressive pace - use recommended 19.99% if no higher value is needed
  if (goalPace === "aggressive" && calculatedAdjustPercent <= (recommendedSurplusPercentage / 100)) {
    finalAdjustPercentage = recommendedSurplusPercentage / 100;
  }
  
  // Calculate daily calories with the percentage-based adjustment
  let dailyCalories = Math.floor(tdee * (1 + finalAdjustPercentage));
  
  // For display purposes, calculate the actual surplus percentage
  let displaySurplusPercentage = ((dailyCalories - tdee) / tdee) * 100;
  
  // Set warning if surplus exceeds recommended amount
  let highSurplusWarning = false;
  
  // For aggressive pace, if we're using exactly 19.99%, show as 20%
  if (Math.abs(displaySurplusPercentage - 19.99) < 0.1) {
    displaySurplusPercentage = 20.0;
  }
  
  // Check if the surplus is higher than recommended
  if (displaySurplusPercentage > recommendedSurplusPercentage) {
    highSurplusWarning = true;
  }
  
  return {
    dailyCalories,
    surplusPercentage: displaySurplusPercentage,
    highSurplusWarning
  };
};
