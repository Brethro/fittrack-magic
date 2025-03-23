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
  isTimelineDriven: boolean,  // Flag to indicate if timeline is driving the surplus
  daysRequiredToReachGoal?: number // Added to return the actual days needed
} => {
  // Calculate weight change needed and caloric adjustment
  const weightDifference = Math.abs(targetWeight - startWeight);
  const caloriesPerUnit = useMetric ? 7700 : 3500; // Calories per kg or lb
  const totalCalorieAdjustment = weightDifference * caloriesPerUnit;
  
  // Get minimum practical surplus values based on pace
  const minDailySurplus = calculateMinSurplusCalories(goalPace);
  
  // Get maximum allowed surplus percentage for pace-guided calculations
  const recommendedSurplusPercentage = calculateMaxSurplusPercentage(goalPace, bodyFatPercentage, gender);
  
  // Flag to track if we're using the timeline-driven adjustment or the pace-based adjustment
  let isTimelineDriven = false;
  let finalAdjustPercentage: number;
  let daysRequiredToReachGoal: number | undefined = undefined;
  
  // FIXED: For aggressive pace, ALWAYS use exactly 20% regardless of timeline requirements
  if (goalPace === "aggressive") {
    // For aggressive pace, EXACTLY 20.0% (0.20) surplus, NEVER override with timeline
    finalAdjustPercentage = 0.20; // Exactly 20% as decimal
    isTimelineDriven = false; // Never timeline-driven for aggressive pace
    
    // Calculate the actual days required with a fixed 20% surplus
    const dailySurplusCalories = tdee * 0.20;
    daysRequiredToReachGoal = Math.ceil(totalCalorieAdjustment / dailySurplusCalories);
  } 
  // For other paces (moderate, conservative)
  else {
    // Calculate adjustment percentage based on required daily adjustment for the given timeline
    const dailyCalorieAdjustment = totalCalorieAdjustment / daysUntilGoal;
    let calculatedAdjustPercent = dailyCalorieAdjustment / tdee;
    
    // If timeline requires more calories than standard pace recommendation
    if (calculatedAdjustPercent > (recommendedSurplusPercentage / 100)) {
      isTimelineDriven = true;
      finalAdjustPercentage = Math.min(0.50, calculatedAdjustPercent); // 50% maximum surplus
    } else {
      // Use the pace-based recommendation since timeline doesn't require more
      finalAdjustPercentage = recommendedSurplusPercentage / 100;
    }
  }
  
  // Calculate daily calories and display percentage
  let dailyCalories: number;
  let displaySurplusPercentage: number;
  
  if (goalPace === "aggressive") {
    // FIXED: For aggressive pace, ALWAYS use exactly 20% regardless of timeline
    // Use exact 20% surplus calories, with no rounding that could cause deviation
    dailyCalories = Math.round(tdee * 1.20);
    
    // Hard-code exactly 20.0% for display
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
    isTimelineDriven,
    daysRequiredToReachGoal
  };
};
