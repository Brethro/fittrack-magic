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

// Adjust servings to meet calorie and protein targets
export const adjustServingsForCalorieTarget = (
  mealFoods: any[],
  targetCalories: number,
  targetProtein: number,
  tolerance: number = 0.05 // 5% tolerance
): any[] => {
  if (mealFoods.length === 0) return [];
  
  const currentTotal = mealFoods.reduce((sum, food) => sum + food.calories, 0);
  const currentProtein = mealFoods.reduce((sum, food) => sum + food.protein, 0);
  
  const targetCaloriesMin = targetCalories * (1 - tolerance);
  const targetCaloriesMax = targetCalories * (1 + tolerance);
  
  const targetProteinMin = targetProtein * (1 - tolerance);
  const targetProteinMax = targetProtein * (1 + tolerance);
  
  // If we're already within tolerance for both calories and protein, return foods unchanged
  if (currentTotal >= targetCaloriesMin && 
      currentTotal <= targetCaloriesMax && 
      currentProtein >= targetProteinMin &&
      currentProtein <= targetProteinMax) {
    return mealFoods;
  }
  
  const adjustedFoods = [...mealFoods];
  
  // Sort foods - prioritize protein-rich foods for adjustment
  const sortedIndices = adjustedFoods
    .map((_, index) => index)
    .sort((a, b) => {
      const foodA = adjustedFoods[a];
      const foodB = adjustedFoods[b];
      
      // Prioritize high protein foods first, then carbs, then fats
      const proteinRatioA = foodA.protein / foodA.calories;
      const proteinRatioB = foodB.protein / foodB.calories;
      
      return proteinRatioB - proteinRatioA; // Higher protein ratio first
    });
  
  // Adjust servings until we reach the targets
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops
  
  while (iterations < maxIterations) {
    iterations++;
    
    const currentCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
    const currentProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
    
    // If we're within tolerance for both calories and protein, we're done
    if (currentCalories >= targetCaloriesMin && 
        currentCalories <= targetCaloriesMax && 
        currentProtein >= targetProteinMin &&
        currentProtein <= targetProteinMax) {
      break;
    }
    
    // First, prioritize fixing protein since that's more important
    if (currentProtein < targetProteinMin) {
      // Need to increase protein
      for (const index of sortedIndices) {
        const food = adjustedFoods[index];
        if (food.protein > 0) {
          const proteinNeeded = targetProtein - currentProtein;
          const proteinPerServing = food.protein / food.servings;
          const additionalServings = proteinNeeded / proteinPerServing;
          
          if (additionalServings > 0.1) {
            const newServings = food.servings + Math.min(additionalServings, 0.25);
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
            break;
          }
        }
      }
    } else if (currentProtein > targetProteinMax) {
      // Need to decrease protein
      // Sort in reverse order for decreasing (low protein foods first)
      const reverseSortedIndices = [...sortedIndices].reverse();
      
      for (const index of reverseSortedIndices) {
        const food = adjustedFoods[index];
        if (food.protein > 0 && food.servings > 0.25) {
          const excessProtein = currentProtein - targetProtein;
          const proteinPerServing = food.protein / food.servings;
          const servingsToReduce = excessProtein / proteinPerServing;
          
          if (servingsToReduce > 0.1) {
            const newServings = Math.max(0.25, food.servings - Math.min(servingsToReduce, 0.25));
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
            break;
          }
        }
      }
    } else {
      // Protein is good, now adjust calories if needed
      if (currentCalories < targetCaloriesMin) {
        // Need to increase calories, preferably from carbs/fats
        for (const index of sortedIndices.slice().reverse()) {
          const food = adjustedFoods[index];
          const caloriesNeeded = targetCalories - currentCalories;
          const caloriesPerServing = food.calories / food.servings;
          
          if (caloriesPerServing > 0) {
            const additionalServings = caloriesNeeded / caloriesPerServing;
            
            if (additionalServings > 0.1) {
              const newServings = food.servings + Math.min(additionalServings, 0.25);
              adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
              break;
            }
          }
        }
      } else if (currentCalories > targetCaloriesMax) {
        // Need to decrease calories, preferably from carbs/fats
        for (const index of sortedIndices.slice().reverse()) {
          const food = adjustedFoods[index];
          if (food.servings > 0.25) {
            const excessCalories = currentCalories - targetCalories;
            const caloriesPerServing = food.calories / food.servings;
            
            if (caloriesPerServing > 0) {
              const servingsToReduce = excessCalories / caloriesPerServing;
              
              if (servingsToReduce > 0.1) {
                const newServings = Math.max(0.25, food.servings - Math.min(servingsToReduce, 0.25));
                adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
                break;
              }
            }
          }
        }
      }
    }
  }
  
  // Final check - ensure we're not over the limits
  const finalCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
  const finalProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
  
  // If we're still over either limit, apply a proportional reduction
  if (finalCalories > targetCaloriesMax || finalProtein > targetProteinMax) {
    // Calculate reduction factors
    const calorieReductionFactor = finalCalories > targetCaloriesMax ? 
      targetCaloriesMax / finalCalories : 1;
    
    const proteinReductionFactor = finalProtein > targetProteinMax ?
      targetProteinMax / finalProtein : 1;
    
    // Use the smaller reduction factor to ensure both targets are met
    const reductionFactor = Math.min(calorieReductionFactor, proteinReductionFactor);
    
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
  
  // Start with protein sources - prioritize protein above all
  const proteins = foodItems.filter(food => (food.protein || 0) > 10);
  if (proteins.length > 0) {
    // Choose multiple protein sources for variety and to hit targets
    const proteinOptions = [...proteins];
    // Shuffle protein options for variety
    for (let i = proteinOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [proteinOptions[i], proteinOptions[j]] = [proteinOptions[j], proteinOptions[i]];
    }
    
    // Add 1-2 protein sources
    const proteinCount = Math.random() > 0.5 ? 2 : 1;
    
    for (let i = 0; i < Math.min(proteinCount, proteinOptions.length); i++) {
      const protein = proteinOptions[i];
      // Calculate servings based on protein target (divided among protein sources)
      const servings = calculateServings(
        protein, 
        targetProtein / proteinCount, 
        'protein',
        0.5,
        2.0
      );
      
      mealFoods.push(createFoodWithServings(protein, servings));
    }
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
  
  // Adjust servings to get close to calorie target and protein target with strict 5% tolerance
  mealFoods = adjustServingsForCalorieTarget(mealFoods, targetCalories, targetProtein, 0.05);
  
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
