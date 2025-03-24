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
  useMetric: boolean,
  respectTimeline: boolean = false // NEW parameter to respect user-set timeline
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
  
  // Get minimum practical surplus values based on pace
  const minDailySurplus = calculateMinSurplusCalories(goalPace);
  
  // Get maximum allowed surplus percentage for pace-guided calculations
  const recommendedSurplusPercentage = calculateMaxSurplusPercentage(goalPace, bodyFatPercentage, gender);
  
  // Flag to track if we're using the timeline-driven adjustment or the pace-based adjustment
  let isTimelineDriven = false;
  let finalAdjustPercentage: number;
  let daysRequiredToReachGoal: number | undefined = undefined;
  
  // For aggressive pace with fixed 20% surplus
  if (goalPace === "aggressive" && !respectTimeline) {
    // Fixed 20% (0.20) surplus for aggressive pace
    finalAdjustPercentage = 0.20;
    isTimelineDriven = false;
    
    // Calculate the actual days required with a fixed 20% surplus
    const dailySurplusCalories = tdee * 0.20;
    daysRequiredToReachGoal = Math.ceil(totalCalorieAdjustment / dailySurplusCalories);
  } 
  // For aggressive pace WITH timeline respect (when user manually sets a date)
  else if (goalPace === "aggressive" && respectTimeline) {
    // Calculate the surplus needed to meet the timeline
    const dailyCalorieAdjustment = totalCalorieAdjustment / daysUntilGoal;
    let calculatedAdjustPercent = dailyCalorieAdjustment / tdee;
    
    // For aggressive pace with timeline respect, we still try to keep close to 20%
    // but will adjust if user timeline requires it
    if (calculatedAdjustPercent > 0.20) {
      // Timeline requires more than 20% surplus
      isTimelineDriven = true;
      finalAdjustPercentage = Math.min(0.50, calculatedAdjustPercent); // Cap at 50% maximum
    } else {
      // Timeline doesn't require more than 20%, so use 20%
      finalAdjustPercentage = 0.20;
      isTimelineDriven = false;
    }
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
  
  if (goalPace === "aggressive" && !respectTimeline) {
    // For aggressive pace without timeline respect, use exactly 20% surplus
    dailyCalories = Math.round(tdee * 1.20);
    displaySurplusPercentage = 20.0;
  } else {
    dailyCalories = Math.round(tdee * (1 + finalAdjustPercentage));
    // Calculate the actual percentage
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
