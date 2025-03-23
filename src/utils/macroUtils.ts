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
