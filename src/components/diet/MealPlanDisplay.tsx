
import React from 'react';
import { Meal } from "@/types/diet";

interface MealPlanDisplayProps {
  mealPlan: Meal[];
  generateMealPlan: () => void;
  regenerateMeal: (mealId: string) => void;
  setActiveTab: (tab: string) => void;
  calorieTarget: number;
  userMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function MealPlanDisplay({ 
  mealPlan, 
  generateMealPlan, 
  regenerateMeal,
  setActiveTab,
  calorieTarget,
  userMacros
}: MealPlanDisplayProps) {
  return null;
}
