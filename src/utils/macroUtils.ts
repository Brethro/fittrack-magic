
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
  totalSaturatedFat?: number;
  totalTransFat?: number;
  totalCholesterol?: number;
  totalSodium?: number;
  totalVitaminA?: number;
  totalVitaminC?: number;
  totalVitaminD?: number;
  totalCalcium?: number;
  totalIron?: number;
  totalPotassium?: number;
} => {
  const result = foods.reduce((totals, food) => {
    return {
      totalCalories: totals.totalCalories + food.calories,
      totalProtein: totals.totalProtein + food.protein,
      totalCarbs: totals.totalCarbs + food.carbs,
      totalFats: totals.totalFats + food.fats,
      totalFiber: totals.totalFiber + (food.fiber || 0),
      totalSugars: totals.totalSugars + (food.sugars || 0),
      totalSaturatedFat: totals.totalSaturatedFat + (food.saturatedFat || 0),
      totalTransFat: totals.totalTransFat + (food.transFat || 0),
      totalCholesterol: totals.totalCholesterol + (food.cholesterol || 0),
      totalSodium: totals.totalSodium + (food.sodium || 0),
      totalVitaminA: totals.totalVitaminA + (food.vitaminA || 0),
      totalVitaminC: totals.totalVitaminC + (food.vitaminC || 0),
      totalVitaminD: totals.totalVitaminD + (food.vitaminD || 0),
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
    totalVitaminA: 0,
    totalVitaminC: 0,
    totalVitaminD: 0,
    totalCalcium: 0,
    totalIron: 0,
    totalPotassium: 0
  });
  
  // Calculate net carbs
  result.netCarbs = Math.max(0, result.totalCarbs - result.totalFiber);
  
  return result;
};

// Recalculate a food item with new servings
export const recalculateFoodWithServings = (food: any, newServings: number): any => {
  const servingRatio = newServings / food.servings;
  
  const recalculated = {
    ...food,
    servings: newServings,
    protein: parseFloat((food.protein * servingRatio).toFixed(1)),
    carbs: parseFloat((food.carbs * servingRatio).toFixed(1)),
    fats: parseFloat((food.fats * servingRatio).toFixed(1)),
    calories: Math.round(food.calories * servingRatio),
    fiber: food.fiber ? parseFloat((food.fiber * servingRatio).toFixed(1)) : undefined,
    sugars: food.sugars ? parseFloat((food.sugars * servingRatio).toFixed(1)) : undefined
  };
  
  // Add detailed nutritional properties if they exist in the original food
  if (food.saturatedFat) recalculated.saturatedFat = parseFloat((food.saturatedFat * servingRatio).toFixed(1));
  if (food.transFat) recalculated.transFat = parseFloat((food.transFat * servingRatio).toFixed(1));
  if (food.cholesterol) recalculated.cholesterol = Math.round(food.cholesterol * servingRatio);
  if (food.sodium) recalculated.sodium = Math.round(food.sodium * servingRatio);
  if (food.addedSugars) recalculated.addedSugars = parseFloat((food.addedSugars * servingRatio).toFixed(1));
  if (food.vitaminA) recalculated.vitaminA = parseFloat((food.vitaminA * servingRatio).toFixed(1));
  if (food.vitaminC) recalculated.vitaminC = parseFloat((food.vitaminC * servingRatio).toFixed(1));
  if (food.vitaminD) recalculated.vitaminD = parseFloat((food.vitaminD * servingRatio).toFixed(1));
  if (food.calcium) recalculated.calcium = Math.round(food.calcium * servingRatio);
  if (food.iron) recalculated.iron = parseFloat((food.iron * servingRatio).toFixed(1));
  if (food.potassium) recalculated.potassium = Math.round(food.potassium * servingRatio);
  
  return recalculated;
};
