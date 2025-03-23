
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
      // For weight gain, show the calculated surplus percentage
      const surplusAmount = userData.dailyCalories - userData.tdee;
      let surplusPercentage = (surplusAmount / userData.tdee) * 100;
      
      // For aggressive pace, if the percentage is around 19.99-20.01%, display 20%
      if (userData.goalPace === 'aggressive' && surplusPercentage >= 19.99 && surplusPercentage <= 20.01) {
        calorieAdjustmentText = `(20% surplus)`;
      } else {
        // For other percentages, round to nearest integer
        calorieAdjustmentText = `(${Math.round(surplusPercentage)}% surplus)`;
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
    <Card className="backdrop-blur-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-gradient-purple">Daily Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BMR Card */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">BMR (Basal Metabolic Rate)</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{Math.round(bmr)}</p>
              <p className="text-sm text-muted-foreground mb-1">calories</p>
            </div>
            <Progress value={60} className="h-1 bg-muted/30" indicatorClassName="bg-blue-400" />
          </div>
          
          {/* TDEE Card */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">TDEE (Total Daily Energy Expenditure)</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{Math.round(tdee)}</p>
              <p className="text-sm text-muted-foreground mb-1">calories</p>
            </div>
            <Progress value={80} className="h-1 bg-muted/30" indicatorClassName="bg-purple-400" />
          </div>
          
          {/* Daily Calorie Goal */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Daily Calorie Goal</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{userData.dailyCalories}</p>
              <p className="text-sm text-muted-foreground mb-1">calories</p>
            </div>
            <Progress 
              value={caloriePercentage} 
              className="h-1 bg-muted/30" 
              indicatorClassName="bg-amber-400" 
            />
            {calorieAdjustmentText && (
              <p className="text-sm text-primary font-medium">{calorieAdjustmentText}</p>
            )}
          </div>
          
          {/* Protein Intake */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Protein Intake</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold">{userData.macros.protein}</p>
              <p className="text-sm text-muted-foreground mb-1">g</p>
            </div>
            <Progress 
              value={proteinPercentage} 
              className="h-1 bg-muted/30" 
              indicatorClassName="bg-green-400" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStats;
