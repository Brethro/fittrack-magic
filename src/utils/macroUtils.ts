
import { FoodItem } from "@/types/diet";

// Calculate how many servings of a food to include in a meal
export const calculateServings = (
  food: FoodItem,
  targetMacro: number,
  macroType: 'protein' | 'carbs' | 'fats',
  minServings: number = 0.5,
  maxServings: number = 3
): number => {
  const macroPerServing = food[macroType] || 0;
  if (macroPerServing <= 0) return minServings;
  
  const targetServings = targetMacro / macroPerServing;
  return Math.max(minServings, Math.min(maxServings, targetServings));
};

// Calculate the total calories and macros for a meal
export const calculateMealTotals = (foods: any[]): { 
  totalCalories: number; 
  totalProtein: number; 
  totalCarbs: number; 
  totalFats: number; 
  totalFiber?: number;
  totalSugars?: number;
  netCarbs?: number;
} => {
  const result = foods.reduce((totals, food) => {
    return {
      totalCalories: totals.totalCalories + food.calories,
      totalProtein: totals.totalProtein + food.protein,
      totalCarbs: totals.totalCarbs + food.carbs,
      totalFats: totals.totalFats + food.fats,
      totalFiber: totals.totalFiber + (food.fiber || 0),
      totalSugars: totals.totalSugars + (food.sugars || 0)
    };
  }, { 
    totalCalories: 0, 
    totalProtein: 0, 
    totalCarbs: 0, 
    totalFats: 0,
    totalFiber: 0,
    totalSugars: 0
  });
  
  // Calculate net carbs
  result.netCarbs = Math.max(0, result.totalCarbs - result.totalFiber);
  
  return result;
};

// Recalculate a food item with new servings
export const recalculateFoodWithServings = (food: any, newServings: number): any => {
  const servingRatio = newServings / food.servings;
  
  return {
    ...food,
    servings: newServings,
    protein: parseFloat((food.protein * servingRatio).toFixed(1)),
    carbs: parseFloat((food.carbs * servingRatio).toFixed(1)),
    fats: parseFloat((food.fats * servingRatio).toFixed(1)),
    calories: Math.round(food.calories * servingRatio),
    fiber: food.fiber ? parseFloat((food.fiber * servingRatio).toFixed(1)) : undefined,
    sugars: food.sugars ? parseFloat((food.sugars * servingRatio).toFixed(1)) : undefined
  };
};
