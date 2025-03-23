
import React from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { 
  calculateBMR, 
  getHeightInCm, 
  getWeightInKg, 
  calculateTDEE 
} from "@/utils/nutritionCalculator";

const DailyStats = () => {
  const { userData } = useUserData();

  if (!userData.age || !userData.weight || !userData.height || !userData.activityLevel || !userData.gender) {
    return <p>Missing user data. Please complete your profile.</p>;
  }

  // Use our utility functions to get height and weight in metric units
  const heightInCm = getHeightInCm(userData.height, userData.useMetric);
  const weightInKg = getWeightInKg(userData.weight as number, userData.useMetric);

  // Calculate BMR using the utility function
  const bmr = calculateBMR({
    weight: weightInKg,
    height: heightInCm,
    age: userData.age,
    gender: userData.gender,
    bodyFatPercentage: userData.bodyFatPercentage
  });

  // Calculate TDEE using the utility function
  const tdee = calculateTDEE(bmr, userData.activityLevel);
  
  // Calculate the surplus/deficit percentage if we have both tdee and dailyCalories
  let calorieAdjustmentText = '';
  if (userData.tdee && userData.dailyCalories) {
    if (userData.isWeightGain) {
      // For weight gain, show surplus percentage
      const surplusAmount = userData.dailyCalories - userData.tdee;
      
      // Ensure we don't exceed 20% for aggressive pace by applying a hard cap
      // This is to ensure consistency with the maxSurplusPercentage from GoalsPage
      let surplusPercentage = (surplusAmount / userData.tdee) * 100;
      
      // If user has selected aggressive pace, cap at 19.99% to avoid floating point issues
      if (userData.goalPace === 'aggressive' && surplusPercentage > 19.99) {
        surplusPercentage = 19.99;
      }
      
      calorieAdjustmentText = `(${surplusPercentage.toFixed(1)}% surplus)`;
    } else if (userData.calculatedDeficitPercentage) {
      // For weight loss, use the pre-calculated percentage if available
      calorieAdjustmentText = `(${userData.calculatedDeficitPercentage.toFixed(1)}% deficit)`;
    }
  }

  return (
    <div className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-medium mb-4">Daily Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">BMR (Basal Metabolic Rate)</p>
          <p className="font-medium">{Math.round(bmr)} calories</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">TDEE (Total Daily Energy Expenditure)</p>
          <p className="font-medium">{Math.round(tdee)} calories</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Daily Calorie Goal</p>
          <p className="font-medium">
            {userData.dailyCalories} calories
            {calorieAdjustmentText && (
              <span className="text-sm ml-1 text-muted-foreground">{calorieAdjustmentText}</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Protein Intake</p>
          <p className="font-medium">{userData.macros.protein}g</p>
        </div>
      </div>
    </div>
  );
};

export default DailyStats;
