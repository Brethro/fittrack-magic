import React from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { calculateBMR } from "@/utils/nutritionCalculator";

const DailyStats = () => {
  const { userData } = useUserData();

  if (!userData.age || !userData.weight || !userData.height || !userData.activityLevel || !userData.gender) {
    return <p>Missing user data. Please complete your profile.</p>;
  }

  const heightInCm = userData.useMetric
    ? userData.height as number
    : ((userData.height as any).feet * 30.48) + ((userData.height as any).inches * 2.54);

  const weightInKg = userData.useMetric
    ? userData.weight as number
    : (userData.weight as number) / 2.20462;

  const bmr = calculateBMR({
    weight: weightInKg,
    height: heightInCm,
    age: userData.age,
    gender: userData.gender,
    bodyFatPercentage: userData.bodyFatPercentage
  });

  const activityMultipliers: { [key: string]: number } = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };

  const tdee = bmr * (activityMultipliers[userData.activityLevel] || 1.2);

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
          <p className="font-medium">{userData.dailyCalories} calories</p>
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
