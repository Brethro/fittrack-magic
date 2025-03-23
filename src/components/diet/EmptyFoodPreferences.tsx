
import React from 'react';

interface EmptyFoodPreferencesProps {
  includeFreeMeal: boolean;
  setIncludeFreeMeal: (include: boolean) => void;
  generateMealPlan: () => void;
  dailyCalories: number;
}

export function EmptyFoodPreferences({ 
  includeFreeMeal,
  setIncludeFreeMeal,
  generateMealPlan,
  dailyCalories 
}: EmptyFoodPreferencesProps) {
  return null;
}
