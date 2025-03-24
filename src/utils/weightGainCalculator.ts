
/**
 * Utility for calculating weight gain related values
 */

/**
 * Calculate maximum surplus percentage based on goal pace and body composition
 */
export const calculateMaxSurplusPercentage = (
  goalPace: 'conservative' | 'moderate' | 'aggressive' | null
): number => {
  // Return exact percentage based on pace
  switch (goalPace) {
    case "aggressive": 
      return 20.0; // 20% for aggressive pace
    case "moderate": 
      return 15.0; // 15% for moderate pace
    case "conservative": 
      return 10.0; // 10% for conservative pace
    default: 
      return 15.0; // Default to moderate
  }
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
  useMetric: boolean,
  respectTimeline: boolean = false
): {
  dailyCalories: number,
  surplusPercentage: number,
  highSurplusWarning: boolean,
  isTimelineDriven: boolean,
  daysRequiredToReachGoal?: number
} => {
  // Calculate weight change needed and caloric adjustment
  const weightDifference = Math.abs(targetWeight - startWeight);
  const caloriesPerUnit = useMetric ? 7700 : 3500; // Calories per kg or lb
  const totalCalorieAdjustment = weightDifference * caloriesPerUnit;
  
  // Get standard surplus percentage based on pace
  const standardPaceSurplus = calculateMaxSurplusPercentage(goalPace);
  
  // Calculate the standard daily surplus based on TDEE and pace
  const standardDailySurplus = tdee * (standardPaceSurplus / 100);
  
  // Calculate how many days it would take with the standard surplus
  const daysRequiredWithStandardSurplus = Math.ceil(totalCalorieAdjustment / standardDailySurplus);
  
  // Variables to determine the final values
  let finalSurplusPercentage: number;
  let isTimelineDriven = false;
  let highSurplusWarning = false;
  
  if (respectTimeline) {
    // If respecting timeline, calculate the surplus percentage needed to meet the deadline
    const requiredDailySurplus = totalCalorieAdjustment / daysUntilGoal;
    const requiredSurplusPercentage = (requiredDailySurplus / tdee) * 100;
    
    // Check if the required surplus is higher than the standard for the selected pace
    if (requiredSurplusPercentage > standardPaceSurplus) {
      // If user wants more surplus than standard pace, respect that
      isTimelineDriven = true;
      
      // Cap the maximum surplus at 35% to prevent excessive fat gain
      finalSurplusPercentage = Math.min(requiredSurplusPercentage, 35);
      
      // Warn if the surplus is too high (above 25%)
      if (finalSurplusPercentage > 25) {
        highSurplusWarning = true;
      }
    } else {
      // If user has set a MORE LENIENT timeline (longer than needed)
      // we should use the reduced surplus percentage calculated from their timeline
      // rather than sticking with the standard pace surplus
      finalSurplusPercentage = requiredSurplusPercentage;
      
      // Log the reduced surplus
      console.log(`User set a more lenient timeline than standard pace requires. Reducing surplus from ${standardPaceSurplus}% to ${finalSurplusPercentage.toFixed(1)}%`);
    }
  } else {
    // If not respecting timeline, simply use the standard surplus for the selected pace
    finalSurplusPercentage = standardPaceSurplus;
  }
  
  // Calculate the final daily calories
  const dailyCalories = Math.round(tdee * (1 + (finalSurplusPercentage / 100)));
  
  return {
    dailyCalories,
    surplusPercentage: finalSurplusPercentage,
    highSurplusWarning,
    isTimelineDriven,
    daysRequiredToReachGoal: daysRequiredWithStandardSurplus
  };
};
