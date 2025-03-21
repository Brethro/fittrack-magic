
import { FoodItem, Meal } from "@/types/diet";

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
} => {
  return foods.reduce((totals, food) => {
    return {
      totalCalories: totals.totalCalories + food.calories,
      totalProtein: totals.totalProtein + food.protein,
      totalCarbs: totals.totalCarbs + food.carbs,
      totalFats: totals.totalFats + food.fats
    };
  }, { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });
};

// Adjust servings to meet calorie targets
export const adjustServingsForCalorieTarget = (
  mealFoods: any[],
  targetCalories: number,
  tolerance: number = 0.05 // 5% tolerance
): any[] => {
  if (mealFoods.length === 0) return [];
  
  const currentTotal = mealFoods.reduce((sum, food) => sum + food.calories, 0);
  const targetMin = targetCalories * (1 - tolerance);
  const targetMax = targetCalories * (1 + tolerance);
  
  // If we're already within tolerance, return foods unchanged
  if (currentTotal >= targetMin && currentTotal <= targetMax) {
    return mealFoods;
  }
  
  const adjustedFoods = [...mealFoods];
  const needToIncrease = currentTotal < targetMin;
  
  // Sort foods by those that should be adjusted first (carbs and fats are easier to adjust than protein)
  const sortedIndices = adjustedFoods
    .map((_, index) => index)
    .sort((a, b) => {
      const foodA = adjustedFoods[a];
      const foodB = adjustedFoods[b];
      
      // Prioritize adjusting carbs, then fats, then protein
      if ((foodA.carbs / foodA.calories) > (foodB.carbs / foodB.calories)) return -1;
      if ((foodA.fats / foodA.calories) > (foodB.fats / foodB.calories)) return 0;
      return 1;
    });
  
  // Adjust servings one by one until we reach the target
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops
  
  while (iterations < maxIterations) {
    iterations++;
    let currentCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
    
    // Break if we're within tolerance
    if (currentCalories >= targetMin && currentCalories <= targetMax) {
      break;
    }
    
    for (const index of sortedIndices) {
      const food = adjustedFoods[index];
      const caloriesPerServing = food.calories / food.servings;
      
      if (needToIncrease) {
        // Calculate exactly how much more we need
        const caloriesNeeded = targetCalories - adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
        const additionalServings = caloriesNeeded / caloriesPerServing;
        
        // Only increase if it would help (not overshoot)
        if (additionalServings > 0.1) {
          const newServings = food.servings + Math.min(additionalServings, 0.25); // Increase gradually
          adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
        }
      } else {
        // Calculate exactly how much less we need
        const excessCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0) - targetCalories;
        const servingsToReduce = excessCalories / caloriesPerServing;
        
        // Only decrease if it would help (not undershoot)
        if (servingsToReduce > 0.1 && food.servings > 0.25) {
          const newServings = Math.max(0.25, food.servings - Math.min(servingsToReduce, 0.25)); // Decrease gradually
          adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
        }
      }
      
      // Check if we're now within tolerance
      const newTotal = adjustedFoods.reduce((sum, food) => sum + food.calories, 0);
      if (newTotal >= targetMin && newTotal <= targetMax) {
        break;
      }
    }
  }
  
  // Final check - if we're still over the limit, make a more aggressive adjustment
  const finalTotal = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
  if (finalTotal > targetMax) {
    // Calculate how much we need to reduce all foods by to get within target
    const reductionFactor = targetMax / finalTotal;
    
    // Apply reduction to all foods
    for (let i = 0; i < adjustedFoods.length; i++) {
      const food = adjustedFoods[i];
      const newServings = Math.max(0.25, food.servings * reductionFactor);
      adjustedFoods[i] = recalculateFoodWithServings(food, newServings);
    }
  }
  
  return adjustedFoods;
};

// Recalculate a food item with new servings
const recalculateFoodWithServings = (food: any, newServings: number): any => {
  const servingRatio = newServings / food.servings;
  
  return {
    ...food,
    servings: newServings,
    protein: parseFloat((food.protein * servingRatio).toFixed(1)),
    carbs: parseFloat((food.carbs * servingRatio).toFixed(1)),
    fats: parseFloat((food.fats * servingRatio).toFixed(1)),
    calories: Math.round(food.calories * servingRatio)
  };
};

// Create a meal with foods that meet macro targets
export const createBalancedMeal = (
  foodItems: FoodItem[],
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,  
  targetFats: number,
  mealName: string
): Meal => {
  let mealFoods: any[] = [];
  
  // Add a protein source
  const proteins = foodItems.filter(food => (food.protein || 0) > 10);
  if (proteins.length > 0) {
    const randomProtein = proteins[Math.floor(Math.random() * proteins.length)];
    const servings = calculateServings(randomProtein, targetProtein, 'protein', 0.5, 1.5);
    
    mealFoods.push(createFoodWithServings(randomProtein, servings));
  }
  
  // Add a carb source
  const carbs = foodItems.filter(food => 
    (food.carbs || 0) > 15 && 
    !mealFoods.some(mf => mf.id === food.id)
  );
  if (carbs.length > 0) {
    const randomCarb = carbs[Math.floor(Math.random() * carbs.length)];
    const servings = calculateServings(randomCarb, targetCarbs, 'carbs', 0.5, 1.5);
    
    mealFoods.push(createFoodWithServings(randomCarb, servings));
  }
  
  // Add vegetables
  const veggies = foodItems.filter(food => 
    food.id.includes("broccoli") || 
    food.id.includes("spinach") || 
    food.id.includes("kale") || 
    food.id.includes("bell_peppers") || 
    food.id.includes("cucumber") || 
    food.id.includes("carrots") || 
    food.id.includes("zucchini") || 
    food.id.includes("tomatoes") &&
    !mealFoods.some(mf => mf.id === food.id)
  );
  if (veggies.length > 0) {
    const randomVeggie = veggies[Math.floor(Math.random() * veggies.length)];
    const servings = Math.random() > 0.5 ? 1.5 : 1;
    
    mealFoods.push(createFoodWithServings(randomVeggie, servings));
  }
  
  // Add healthy fat if needed
  const currentMacros = calculateMealTotals(mealFoods);
  if (currentMacros.totalFats < targetFats * 0.7) {
    const fats = foodItems.filter(food => 
      (food.fats || 0) > 5 && 
      !mealFoods.some(mf => mf.id === food.id)
    );
    if (fats.length > 0) {
      const randomFat = fats[Math.floor(Math.random() * fats.length)];
      const servings = calculateServings(randomFat, targetFats - currentMacros.totalFats, 'fats', 0.25, 1);
      
      mealFoods.push(createFoodWithServings(randomFat, servings));
    }
  }
  
  // Adjust servings to get close to calorie target - apply strict tolerance
  mealFoods = adjustServingsForCalorieTarget(mealFoods, targetCalories, 0.05);
  
  // Calculate final meal totals
  const totals = calculateMealTotals(mealFoods);
  
  return {
    id: `meal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: mealName,
    foods: mealFoods,
    totalProtein: parseFloat(totals.totalProtein.toFixed(1)),
    totalCarbs: parseFloat(totals.totalCarbs.toFixed(1)),
    totalFats: parseFloat(totals.totalFats.toFixed(1)),
    totalCalories: Math.round(totals.totalCalories)
  };
};

// Create a food item with the specified servings
const createFoodWithServings = (food: FoodItem, servings: number): any => {
  return {
    id: food.id,
    name: food.name,
    servings,
    servingSizeGrams: food.servingSizeGrams,
    servingSize: food.servingSize,
    protein: parseFloat((food.protein * servings).toFixed(1)),
    carbs: parseFloat((food.carbs * servings).toFixed(1)),
    fats: parseFloat((food.fats * servings).toFixed(1)),
    calories: Math.round((food.caloriesPerServing * servings))
  };
};
