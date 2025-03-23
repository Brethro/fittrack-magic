
import { Meal, MealPlan } from "@/types/diet";

// Function to calculate total calories from macronutrients
export const calculateCaloriesFromMacros = (protein: number, carbs: number, fats: number): number => {
  return (protein * 4) + (carbs * 4) + (fats * 9);
};

// Function to calculate macros from calories and percentages
export const calculateMacrosFromCalories = (
  totalCalories: number, 
  proteinPercentage: number, 
  carbsPercentage: number, 
  fatsPercentage: number
): { protein: number; carbs: number; fats: number } => {
  
  // Ensure percentages add up to 100%
  const totalPercentage = proteinPercentage + carbsPercentage + fatsPercentage;
  const normalizer = totalPercentage / 100;
  
  // Normalize percentages
  const normalizedProteinPercentage = proteinPercentage / normalizer;
  const normalizedCarbsPercentage = carbsPercentage / normalizer;
  const normalizedFatsPercentage = fatsPercentage / normalizer;
  
  // Calculate macros
  const caloriesFromProtein = totalCalories * (normalizedProteinPercentage / 100);
  const caloriesFromCarbs = totalCalories * (normalizedCarbsPercentage / 100);
  const caloriesFromFats = totalCalories * (normalizedFatsPercentage / 100);
  
  // Convert calories to grams
  const proteinGrams = Math.round(caloriesFromProtein / 4);
  const carbsGrams = Math.round(caloriesFromCarbs / 4);
  const fatsGrams = Math.round(caloriesFromFats / 9);
  
  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams
  };
};

// Function to adjust macros based on a target calorie adjustment
export const adjustMacrosForCalories = (
  currentProtein: number,
  currentCarbs: number,
  currentFats: number,
  targetCalories: number
): { protein: number; carbs: number; fats: number } => {
  const currentCalories = calculateCaloriesFromMacros(currentProtein, currentCarbs, currentFats);
  const ratio = targetCalories / currentCalories;
  
  return {
    protein: Math.round(currentProtein * ratio),
    carbs: Math.round(currentCarbs * ratio),
    fats: Math.round(currentFats * ratio)
  };
};

// Calculate nutritional totals for a meal
export const calculateMealTotals = (meal: Meal): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugars: number;
  totalSaturatedFat: number;
  totalTransFat: number;
  totalCholesterol: number;
  totalSodium: number;
  totalCalcium: number;
  totalIron: number;
  totalPotassium: number;
} => {
  return meal.foods.reduce((totals, food) => {
    return {
      totalCalories: totals.totalCalories + (food.caloriesPerServing || 0),
      totalProtein: totals.totalProtein + (food.protein || 0),
      totalCarbs: totals.totalCarbs + (food.carbs || 0),
      totalFats: totals.totalFats + (food.fats || 0),
      totalFiber: totals.totalFiber + (food.fiber || 0),
      totalSugars: totals.totalSugars + (food.sugars || 0),
      totalSaturatedFat: totals.totalSaturatedFat + (food.saturatedFat || 0),
      totalTransFat: totals.totalTransFat + (food.transFat || 0),
      totalCholesterol: totals.totalCholesterol + (food.cholesterol || 0),
      totalSodium: totals.totalSodium + (food.sodium || 0),
      totalCalcium: totals.totalCalcium + (food.calcium || 0),
      totalIron: totals.totalIron + (food.iron || 0),
      totalPotassium: totals.totalPotassium + (food.potassium || 0)
    };
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    totalSugars: 0,
    totalSaturatedFat: 0,
    totalTransFat: 0,
    totalCholesterol: 0,
    totalSodium: 0,
    totalCalcium: 0,
    totalIron: 0,
    totalPotassium: 0
  });
};

// Calculate nutritional totals for a meal plan
export const calculateMealPlanTotals = (mealPlan: MealPlan): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugars: number;
  totalSaturatedFat: number;
  totalTransFat: number;
  totalCholesterol: number;
  totalSodium: number;
  totalCalcium: number;
  totalIron: number;
  totalPotassium: number;
  netCarbs: number;
} => {
  const totals = mealPlan.meals.reduce((acc, meal) => {
    const mealTotals = calculateMealTotals(meal);
    return {
      totalCalories: acc.totalCalories + mealTotals.totalCalories,
      totalProtein: acc.totalProtein + mealTotals.totalProtein,
      totalCarbs: acc.totalCarbs + mealTotals.totalCarbs,
      totalFats: acc.totalFats + mealTotals.totalFats,
      totalFiber: acc.totalFiber + mealTotals.totalFiber,
      totalSugars: acc.totalSugars + mealTotals.totalSugars,
      totalSaturatedFat: acc.totalSaturatedFat + mealTotals.totalSaturatedFat,
      totalTransFat: acc.totalTransFat + mealTotals.totalTransFat,
      totalCholesterol: acc.totalCholesterol + mealTotals.totalCholesterol,
      totalSodium: acc.totalSodium + mealTotals.totalSodium,
      totalCalcium: acc.totalCalcium + mealTotals.totalCalcium,
      totalIron: acc.totalIron + mealTotals.totalIron,
      totalPotassium: acc.totalPotassium + mealTotals.totalPotassium
    };
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    totalSugars: 0,
    totalSaturatedFat: 0,
    totalTransFat: 0,
    totalCholesterol: 0,
    totalSodium: 0,
    totalCalcium: 0,
    totalIron: 0,
    totalPotassium: 0
  });

  // Calculate net carbs
  const netCarbs = totals.totalCarbs - totals.totalFiber;
  
  return {
    ...totals,
    netCarbs
  };
};
