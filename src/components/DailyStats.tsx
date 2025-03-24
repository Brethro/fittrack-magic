
import React from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { 
  calculateBMR, 
  getHeightInCm, 
  getWeightInKg, 
  calculateTDEE 
} from "@/utils/nutritionCalculator";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
      // For weight gain scenarios - use pre-calculated value
      if (userData.calculatedSurplusPercentage !== undefined && userData.calculatedSurplusPercentage !== null) {
        // For aggressive pace without timeline-driven adjustments, always show EXACTLY 20%
        if (userData.goalPace === 'aggressive' && !userData.isTimelineDriven) {
          calorieAdjustmentText = `(20.0% surplus)`;
        } else {
          // For other percentages, round to one decimal place for precision
          calorieAdjustmentText = `(${userData.calculatedSurplusPercentage.toFixed(1)}% surplus)`;
        }
      } else {
        // Fallback calculation if needed
        const surplusAmount = userData.dailyCalories - userData.tdee;
        const surplusPercentage = (surplusAmount / userData.tdee) * 100;
        calorieAdjustmentText = `(${surplusPercentage.toFixed(1)}% surplus)`;
      }
    } else if (userData.calculatedDeficitPercentage) {
      // For weight loss, use the pre-calculated percentage if available
      calorieAdjustmentText = `(${Math.round(userData.calculatedDeficitPercentage)}% deficit)`;
    }
  }

  // Calculate percentage of daily calories compared to TDEE
  const caloriePercentage = (userData.dailyCalories && userData.tdee) 
    ? Math.min(100, Math.round((userData.dailyCalories / userData.tdee) * 100))
    : 0;

  // Calculate percentage of protein compared to goal
  const proteinPercentage = (userData.macros.protein) 
    ? Math.min(100, Math.round((userData.macros.protein / 2) * 100)) // Just for visual, assuming 50% progress
    : 0;

  return (
    <Card className="glassmorphism border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-gradient-purple">Daily Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BMR Card */}
          <div className="space-y-2 dark-glass p-3 rounded-lg">
            <p className="text-sm text-white/70">BMR (Basal Metabolic Rate)</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{Math.round(bmr)}</p>
              <p className="text-sm text-white/70 mb-1">calories</p>
            </div>
            <Progress value={60} className="h-1 bg-white/10" indicatorClassName="bg-blue-400" />
          </div>
          
          {/* TDEE Card */}
          <div className="space-y-2 dark-glass p-3 rounded-lg">
            <p className="text-sm text-white/70">TDEE (Total Daily Energy Expenditure)</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{Math.round(tdee)}</p>
              <p className="text-sm text-white/70 mb-1">calories</p>
            </div>
            <Progress value={80} className="h-1 bg-white/10" indicatorClassName="bg-purple-400" />
          </div>
          
          {/* Daily Calorie Goal */}
          <div className="space-y-2 dark-glass p-3 rounded-lg">
            <p className="text-sm text-white/70">Daily Calorie Goal</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{userData.dailyCalories}</p>
              <p className="text-sm text-white/70 mb-1">calories</p>
            </div>
            <Progress 
              value={caloriePercentage} 
              className="h-1 bg-white/10" 
              indicatorClassName="bg-amber-400" 
            />
            {calorieAdjustmentText && (
              <p className="text-sm text-primary font-medium">{calorieAdjustmentText}</p>
            )}
          </div>
          
          {/* Protein Intake */}
          <div className="space-y-2 dark-glass p-3 rounded-lg">
            <p className="text-sm text-white/70">Protein Intake</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{userData.macros.protein}</p>
              <p className="text-sm text-white/70 mb-1">g</p>
            </div>
            <Progress 
              value={proteinPercentage} 
              className="h-1 bg-white/10" 
              indicatorClassName="bg-green-400" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStats;
