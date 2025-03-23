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
    maxAdjustPercent = 20.0; // EXACTLY 20.0% for aggressive pace
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
      maxAdjustPercent = Math.min(maxAdjustPercent, 20.0); 
    } else if (bf < 10) {
      // Lower body fat - can be more aggressive with surplus
      maxAdjustPercent = Math.min(maxAdjustPercent + 5.0, 35.0);
    }
  } else {
    if (bf > 28) {
      // Higher body fat - more conservative with surplus
      maxAdjustPercent = Math.min(maxAdjustPercent, 20.0);
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
  highSurplusWarning: boolean,
  isTimelineDriven: boolean  // Flag to indicate if timeline is driving the surplus
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
  
  // Allow higher surpluses than recommended if required by timeline
  // but set a hard cap at 50% to prevent unreasonable values
  const absoluteMaxSurplus = 0.50; // 50% maximum surplus
  
  // Flag to track if we're using the timeline-driven adjustment or the pace-based adjustment
  let isTimelineDriven = false;
  let finalAdjustPercentage: number;
  
  // For aggressive pace, ALWAYS use exactly 20% 
  // UNLESS timeline absolutely requires more aggressive surplus
  if (goalPace === "aggressive") {
    // For aggressive pace, EXACTLY 20.0% (0.20) surplus
    const aggressivePaceTarget = 0.20; // Exactly 20% as decimal
    
    // Only if timeline absolutely requires higher surplus, allow it
    if (calculatedAdjustPercent > aggressivePaceTarget) {
      isTimelineDriven = true;
      finalAdjustPercentage = Math.min(absoluteMaxSurplus, calculatedAdjustPercent);
    } else {
      // Otherwise use exactly 20% for aggressive pace
      finalAdjustPercentage = aggressivePaceTarget;
    }
  } 
  // For other paces (moderate, conservative)
  else {
    // If timeline requires more calories than standard pace recommendation
    if (calculatedAdjustPercent > (recommendedSurplusPercentage / 100)) {
      isTimelineDriven = true;
      finalAdjustPercentage = Math.min(absoluteMaxSurplus, calculatedAdjustPercent);
    } else {
      // Use the pace-based recommendation since timeline doesn't require more
      finalAdjustPercentage = recommendedSurplusPercentage / 100;
    }
  }
  
  // Calculate daily calories and display percentage
  let dailyCalories: number;
  let displaySurplusPercentage: number;
  
  if (goalPace === "aggressive" && !isTimelineDriven) {
    // Calculate exact 20% surplus calories
    // Use Math.floor to ensure we NEVER exceed 20% surplus
    dailyCalories = Math.floor(tdee * 1.20);
    
    // Hard-code exactly 20.0%
    displaySurplusPercentage = 20.0;
  } else {
    dailyCalories = Math.floor(tdee * (1 + finalAdjustPercentage));
    // Calculate the actual percentage for non-aggressive pace
    displaySurplusPercentage = ((dailyCalories - tdee) / tdee) * 100;
  }
  
  // Set warning if surplus exceeds recommended amount
  let highSurplusWarning = false;
  
  // Check if the surplus is higher than recommended
  if (displaySurplusPercentage > recommendedSurplusPercentage && isTimelineDriven) {
    highSurplusWarning = true;
  }
  
  return {
    dailyCalories,
    surplusPercentage: displaySurplusPercentage,
    highSurplusWarning,
    isTimelineDriven
  };
};
