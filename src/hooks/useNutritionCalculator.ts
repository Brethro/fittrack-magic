import { useCallback } from "react";
import { differenceInCalendarDays, addDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/contexts/UserDataContext";
import { 
  calculateBMR, 
  calculateTDEE,
  getHeightInCm,
  getWeightInKg,
} from "@/utils/nutritionCalculator";
import { 
  calculateWeightGainCalories 
} from "@/utils/weightGainCalculator";
import { 
  calculateWeightLossCalories 
} from "@/utils/weightLossCalculator";
import { 
  calculateMacroDistribution 
} from "@/utils/macroCalculator";

export const useNutritionCalculator = (
  userData: UserData,
  updateUserData: (data: Partial<UserData>) => void
) => {
  const recalculateNutrition = useCallback(() => {
    console.log("Recalculating nutrition with data:", userData);
    
    if (!userData.age || !userData.weight || !userData.height || !userData.activityLevel) {
      console.log("Not enough data to recalculate");
      return; // Not enough data to recalculate
    }

    // Get necessary data for calculations
    const heightInCm = getHeightInCm(userData.height, userData.useMetric);
    const weightInKg = getWeightInKg(userData.weight as number, userData.useMetric);
    
    // Calculate BMR using our utility
    const bmr = calculateBMR({
      weight: weightInKg,
      height: heightInCm,
      age: userData.age,
      gender: userData.gender,
      bodyFatPercentage: userData.bodyFatPercentage
    });
    
    console.log("Calculated BMR:", bmr);
    
    // Calculate TDEE using our utility
    const tdee = calculateTDEE(bmr, userData.activityLevel);
    console.log("Calculated TDEE:", tdee);
    
    // If we don't have goals, just update TDEE and return
    if (!userData.goalType || !userData.goalValue || !userData.goalDate) {
      updateUserData({ tdee });
      console.log("Updated TDEE only (no goals present)");
      return;
    }
    
    // Calculate time until goal date
    const today = new Date();
    const goalDate = new Date(userData.goalDate);
    const daysUntilGoal = Math.max(differenceInCalendarDays(goalDate, today), 1); // At least 1 day
    
    console.log("Days until goal:", daysUntilGoal);
    
    // Determine if this is a weight gain or weight loss goal
    // For weight goal: compare goal weight directly
    // For body fat goal: calculate target weight and compare
    const startWeight = userData.weight as number;
    let targetWeight: number;
    
    if (userData.goalType === "weight") {
      targetWeight = userData.goalValue as number;
    } else {
      // For body fat goals, calculate the target weight
      const currentBodyFat = userData.bodyFatPercentage as number;
      const goalBodyFat = userData.goalValue as number;
      
      // Calculate lean body mass (remains constant)
      const leanBodyMass = startWeight * (1 - (currentBodyFat / 100));
      
      // Calculate target weight based on goal body fat percentage
      targetWeight = leanBodyMass / (1 - (goalBodyFat / 100));
    }
    
    // Determine if this is weight gain or weight loss
    const isWeightGain = targetWeight > startWeight;
    console.log(`Goal detected: ${isWeightGain ? 'Weight Gain' : 'Weight Loss'}`);
    
    let dailyCalories: number;
    let calculatedAdjustPercent: number = 0;
    let highSurplusWarning = false;
    let isTimelineDriven = false;
    let updatedGoalDate = userData.goalDate;
    
    // Check if we should respect the user-set timeline 
    // If userData has a userSetGoalDate flag or the goalCustomDate property exists
    const respectUserTimeline = userData.userSetGoalDate || userData.goalCustomDate;
    
    if (isWeightGain) {
      // Use our refactored weight gain calculator
      const result = calculateWeightGainCalories(
        tdee,
        targetWeight,
        startWeight,
        daysUntilGoal,
        userData.goalPace,
        userData.bodyFatPercentage,
        userData.gender,
        userData.useMetric,
        respectUserTimeline // Pass the flag to respect user timeline
      );
      
      dailyCalories = result.dailyCalories;
      highSurplusWarning = result.highSurplusWarning;
      calculatedAdjustPercent = result.surplusPercentage;
      isTimelineDriven = result.isTimelineDriven;
      
      // Only update the goal date if we're NOT respecting user timeline
      // and we have a calculated days required value
      if (!respectUserTimeline && userData.goalPace === "aggressive" && result.daysRequiredToReachGoal) {
        updatedGoalDate = addDays(new Date(), result.daysRequiredToReachGoal);
        console.log(`Adjusted goal date to: ${updatedGoalDate} based on fixed 20% surplus`);
      } else {
        // If we're respecting user timeline, keep the original date
        updatedGoalDate = userData.goalDate;
        console.log(`Keeping user-set goal date: ${updatedGoalDate}`);
      }
      
      console.log("Weight gain calculation result:", result);
    } else {
      // Use our refactored weight loss calculator
      const result = calculateWeightLossCalories(
        tdee,
        targetWeight,
        startWeight,
        daysUntilGoal,
        userData.goalPace,
        userData.bodyFatPercentage,
        userData.gender,
        userData.useMetric
      );
      
      dailyCalories = result.dailyCalories;
      calculatedAdjustPercent = result.deficitPercentage;
      
      console.log("Weight loss calculation result:", result);
    }
    
    // Calculate macros
    const bodyFatPercentage = userData.bodyFatPercentage || (userData.gender === 'female' ? 25 : 18);
    const leanBodyMass = weightInKg * (1 - (bodyFatPercentage / 100));
    
    const macros = calculateMacroDistribution(
      dailyCalories,
      leanBodyMass,
      userData.bodyFatPercentage,
      isWeightGain,
      userData.gender,
      userData.goalPace
    );
    
    console.log("Updated nutrition values:", {
      tdee,
      dailyCalories,
      isWeightGain,
      highSurplusWarning,
      isTimelineDriven,
      macros,
      calculatedAdjustPercent,
      updatedGoalDate
    });
    
    // Update the calculated values
    updateUserData({
      tdee,
      dailyCalories,
      isWeightGain,
      highSurplusWarning,
      isTimelineDriven,
      macros,
      goalDate: updatedGoalDate,
      // Store the actual calculated percentage for display purposes
      calculatedDeficitPercentage: isWeightGain ? null : calculatedAdjustPercent,
      calculatedSurplusPercentage: isWeightGain ? calculatedAdjustPercent : null
    });
    
  }, [userData, updateUserData]);

  return { recalculateNutrition };
};
