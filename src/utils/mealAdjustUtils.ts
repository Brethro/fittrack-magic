
import { recalculateFoodWithServings } from './macroUtils';

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
  
  // Sort foods - prioritize protein-rich foods for adjustment first, then carb/fat foods
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
    
    // PRIORITY 1: Fix under-target calories (this is the main issue we're addressing)
    if (currentCalories < targetCaloriesMin) {
      // Need to increase calories
      // First try with carb/fat foods (reverse the order)
      let adjusted = false;
      const reverseSortedForCals = [...sortedIndices].reverse();
      
      for (const index of reverseSortedForCals) {
        const food = adjustedFoods[index];
        const caloriesNeeded = targetCalories - currentCalories;
        const caloriesPerServing = food.calories / food.servings;
        
        if (caloriesPerServing > 0) {
          // Use a larger step size to ensure we don't end up under-target
          // Calculate exactly how much we need to add to reach minimum target
          const additionalServings = caloriesNeeded / caloriesPerServing;
          
          if (additionalServings > 0.1) {
            // Use a more aggressive adjustment to avoid ending up under target
            const adjustmentAmount = Math.min(additionalServings, 0.5); // Larger step: 0.5 instead of 0.25
            const newServings = food.servings + adjustmentAmount;
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
            adjusted = true;
            break;
          }
        }
      }
      
      // If we couldn't adjust with carb/fat foods, try protein foods
      if (!adjusted) {
        for (const index of sortedIndices) {
          const food = adjustedFoods[index];
          if (food.protein > 0) {
            const caloriesNeeded = targetCalories - currentCalories;
            const caloriesPerServing = food.calories / food.servings;
            
            if (caloriesPerServing > 0) {
              const additionalServings = caloriesNeeded / caloriesPerServing;
              
              if (additionalServings > 0.1) {
                const newServings = food.servings + Math.min(additionalServings, 0.5);
                adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
                break;
              }
            }
          }
        }
      }
    }
    // PRIORITY 2: Fix protein issues
    else if (currentProtein < targetProteinMin) {
      // Need to increase protein
      for (const index of sortedIndices) {
        const food = adjustedFoods[index];
        if (food.protein > 0) {
          const proteinNeeded = targetProtein - currentProtein;
          const proteinPerServing = food.protein / food.servings;
          const additionalServings = proteinNeeded / proteinPerServing;
          
          if (additionalServings > 0.1) {
            const newServings = food.servings + Math.min(additionalServings, 0.5);
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
            break;
          }
        }
      }
    }
    else if (currentProtein > targetProteinMax) {
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
    }
    // PRIORITY 3: Fix over-target calories (this tends to be less of a problem)
    else if (currentCalories > targetCaloriesMax) {
      // Need to decrease calories, preferably from carbs/fats
      const reverseSortedIndices = [...sortedIndices].reverse();
      
      for (const index of reverseSortedIndices) {
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
  
  // Final check - ensure we're not UNDER the minimum calories
  const finalCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
  const finalProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
  
  // If we're still under the calorie minimum, apply a proportional increase
  if (finalCalories < targetCaloriesMin) {
    const increaseRatio = targetCaloriesMin / finalCalories;
    
    // Apply increase to all foods
    for (let i = 0; i < adjustedFoods.length; i++) {
      const food = adjustedFoods[i];
      // Increase servings proportionally, but with a cap to avoid excessive increases
      const newServings = Math.min(food.servings * increaseRatio, food.servings + 0.5);
      adjustedFoods[i] = recalculateFoodWithServings(food, newServings);
    }
  }
  // If we're over the calorie maximum or protein maximum, apply a proportional reduction
  else if (finalCalories > targetCaloriesMax || finalProtein > targetProteinMax) {
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
  
  // Final verification - make absolutely sure we're above the minimum calories
  const verifiedCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
  if (verifiedCalories < targetCaloriesMin) {
    // As a last resort, find the food with the highest calories and increase it
    const foodsSortedByCalories = [...adjustedFoods]
      .map((food, index) => ({ food, index }))
      .sort((a, b) => (b.food.calories / b.food.servings) - (a.food.calories / a.food.servings));
    
    if (foodsSortedByCalories.length > 0) {
      const { food, index } = foodsSortedByCalories[0];
      const caloriesNeeded = targetCaloriesMin - verifiedCalories;
      const caloriesPerServing = food.calories / food.servings;
      const additionalServings = Math.min(1.0, caloriesNeeded / caloriesPerServing);
      
      if (additionalServings > 0.1) {
        const newServings = food.servings + additionalServings;
        adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
      }
    }
  }
  
  return adjustedFoods;
};
