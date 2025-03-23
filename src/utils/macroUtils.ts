
// Calculate servings for a specific food to hit macro targets
export const calculateServings = (
  food: any,
  targetProtein: number,
  targetCalories: number
): number => {
  // Simple calculation based on protein content as priority
  if (food.protein && food.protein > 0) {
    return Math.max(0.5, Math.min(3, targetProtein / food.protein));
  }
  
  // If no protein, base on calories
  if (food.caloriesPerServing && food.caloriesPerServing > 0) {
    return Math.max(0.5, Math.min(2, targetCalories / food.caloriesPerServing / 4));
  }
  
  return 1; // Default to 1 serving if no data available
};

// Recalculate food with adjusted servings
export const recalculateFoodWithServings = (food: any, servings: number): any => {
  const result = { ...food, servings };
  
  // Adjust all numeric nutritional values based on servings
  const nutritionKeys = [
    'caloriesPerServing', 'protein', 'carbs', 'fats', 'fiber', 
    'sugars', 'saturatedFat', 'transFat', 'cholesterol', 
    'sodium', 'calcium', 'iron', 'potassium', 'zinc',
    'vitaminA', 'vitaminC', 'vitaminD'
  ];
  
  nutritionKeys.forEach(key => {
    if (typeof food[key] === 'number') {
      result[key] = food[key] * servings;
    }
  });
  
  // Add netCarbs calculation
  result.netCarbs = Math.max(0, (result.carbs || 0) - (result.fiber || 0));
  
  return result;
};

// Calculate meal totals, adding the netCarbs property
export const calculateMealTotals = (foods: any[]): any => {
  const totals = {
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
    totalPotassium: 0,
    netCarbs: 0
  };
  
  foods.forEach(food => {
    // Use caloriesPerServing * servings or just calories if available
    if (food.caloriesPerServing && food.servings) {
      totals.totalCalories += food.caloriesPerServing * food.servings;
    } else if (food.calories) {
      totals.totalCalories += food.calories;
    }
    
    // Sum other nutrients
    if (food.protein) totals.totalProtein += food.protein;
    if (food.carbs) totals.totalCarbs += food.carbs;
    if (food.fats) totals.totalFats += food.fats;
    if (food.fiber) totals.totalFiber += food.fiber;
    if (food.sugars) totals.totalSugars += food.sugars;
    if (food.saturatedFat) totals.totalSaturatedFat += food.saturatedFat;
    if (food.transFat) totals.totalTransFat += food.transFat;
    if (food.cholesterol) totals.totalCholesterol += food.cholesterol;
    if (food.sodium) totals.totalSodium += food.sodium;
    if (food.calcium) totals.totalCalcium += food.calcium;
    if (food.iron) totals.totalIron += food.iron;
    if (food.potassium) totals.totalPotassium += food.potassium;
    
    // Calculate netCarbs as carbs - fiber
    const foodNetCarbs = Math.max(0, (food.carbs || 0) - (food.fiber || 0));
    totals.netCarbs += foodNetCarbs;
  });
  
  return totals;
};
