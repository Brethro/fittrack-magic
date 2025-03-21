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
    
    // NEW PRIORITY: Handle under-target protein first (THIS IS THE MAIN ISSUE)
    if (currentProtein < targetProteinMin) {
      // Need to increase protein - focus on high-protein foods
      let adjusted = false;
      
      for (const index of sortedIndices) {
        const food = adjustedFoods[index];
        if (food.protein > 0) {
          const proteinNeeded = targetProtein - currentProtein;
          const proteinPerServing = food.protein / food.servings;
          
          if (proteinPerServing > 0) {
            // Calculate more precisely how much we need to add
            const additionalServings = proteinNeeded / proteinPerServing;
            
            if (additionalServings > 0.1) {
              // More aggressive adjustment for protein: up to 0.75 servings increment
              const newServings = food.servings + Math.min(additionalServings, 0.75);
              adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
              adjusted = true;
              break;
            }
          }
        }
      }
      
      // If we couldn't adjust any single food enough, adjust multiple protein foods
      if (!adjusted) {
        // Apply smaller increments to multiple protein sources
        let remainingProteinNeeded = targetProtein - currentProtein;
        let foodsAdjusted = 0;
        
        for (const index of sortedIndices) {
          if (foodsAdjusted >= 2) break; // Limit to adjusting 2 foods at most
          
          const food = adjustedFoods[index];
          if (food.protein > 5) { // Only adjust significant protein sources
            const proteinPerServing = food.protein / food.servings;
            
            if (proteinPerServing > 0) {
              // Increase by at least 0.5 serving, or more if needed for protein
              const increment = Math.max(0.5, Math.min(0.75, remainingProteinNeeded / proteinPerServing));
              const newServings = food.servings + increment;
              
              adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
              remainingProteinNeeded -= (increment * proteinPerServing);
              foodsAdjusted++;
            }
          }
        }
      }
    }
    // PRIORITY 2: Fix under-target calories
    else if (currentCalories < targetCaloriesMin) {
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
    // PRIORITY 3: Fix protein over target (less important)
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
    // PRIORITY 4: Fix over-target calories (this tends to be less of a problem)
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
  
  // Final check - ensure we're not UNDER the minimum calories or protein
  const finalCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
  const finalProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
  
  // First priority: Handle protein deficit
  if (finalProtein < targetProteinMin) {
    // Identify foods with high protein content
    const highProteinFoods = adjustedFoods
      .map((food, index) => ({ food, index, ratio: food.protein / food.calories }))
      .sort((a, b) => b.ratio - a.ratio); // Sort by protein ratio
    
    // First try to add more protein without affecting calories too much
    if (highProteinFoods.length > 0 && highProteinFoods[0].ratio > 0.1) {
      const { food, index } = highProteinFoods[0];
      const proteinNeeded = targetProteinMin - finalProtein;
      const proteinPerServing = food.protein / food.servings;
      
      // Add significant additional protein (up to 1.0 serving)
      const additionalServings = Math.min(1.0, proteinNeeded / proteinPerServing);
      if (additionalServings > 0.2) {
        const newServings = food.servings + additionalServings;
        adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
      }
    }
  }
  
  // Second priority: Handle calorie deficit (if protein is either fixed or still needs more anyway)
  if (finalCalories < targetCaloriesMin) {
    const increaseRatio = targetCaloriesMin / finalCalories;
    
    // Apply increase to all foods, prioritizing protein sources if protein is still low
    const updatedProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
    
    if (updatedProtein < targetProteinMin) {
      // Still need protein, so prioritize protein sources
      const proteinSources = adjustedFoods
        .map((food, index) => ({ food, index }))
        .filter(item => item.food.protein > 5) // Only significant protein sources
        .sort((a, b) => (b.food.protein / b.food.calories) - (a.food.protein / a.food.calories));
      
      if (proteinSources.length > 0) {
        // Increase all protein sources proportionally
        for (const { food, index } of proteinSources) {
          const newServings = Math.min(food.servings * increaseRatio, food.servings + 1.0);
          adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
        }
      } else {
        // No protein sources, so increase everything
        for (let i = 0; i < adjustedFoods.length; i++) {
          const food = adjustedFoods[i];
          const newServings = Math.min(food.servings * increaseRatio, food.servings + 0.5);
          adjustedFoods[i] = recalculateFoodWithServings(food, newServings);
        }
      }
    } else {
      // Protein is fine, just need more calories
      for (let i = 0; i < adjustedFoods.length; i++) {
        const food = adjustedFoods[i];
        // Increase servings proportionally, but with a cap to avoid excessive increases
        const newServings = Math.min(food.servings * increaseRatio, food.servings + 0.5);
        adjustedFoods[i] = recalculateFoodWithServings(food, newServings);
      }
    }
  }
  // If over both calorie and protein targets, reduce proportionally
  else if (finalCalories > targetCaloriesMax && finalProtein > targetProteinMax) {
    // Calculate reduction factors
    const calorieReductionFactor = targetCaloriesMax / finalCalories;
    const proteinReductionFactor = targetProteinMax / finalProtein;
    
    // Use the smaller reduction factor to ensure both targets are met
    const reductionFactor = Math.min(calorieReductionFactor, proteinReductionFactor);
    
    // Apply reduction to all foods
    for (let i = 0; i < adjustedFoods.length; i++) {
      const food = adjustedFoods[i];
      const newServings = Math.max(0.25, food.servings * reductionFactor);
      adjustedFoods[i] = recalculateFoodWithServings(food, newServings);
    }
  }
  
  // Ultra-final verification - absolutely ensure we're not below protein target
  const verifiedProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
  if (verifiedProtein < targetProteinMin) {
    // Find the food with the highest protein-to-calorie ratio
    const bestProteinSource = adjustedFoods
      .map((food, index) => ({ food, index, ratio: food.protein / food.calories }))
      .filter(item => item.ratio > 0) // Only positive protein ratios
      .sort((a, b) => b.ratio - a.ratio)[0]; // Best protein source
    
    if (bestProteinSource) {
      const { food, index } = bestProteinSource;
      const proteinNeeded = targetProteinMin - verifiedProtein;
      const proteinPerServing = food.protein / food.servings;
      
      // Add significant additional protein (up to 1.25 serving for critical fix)
      const additionalServings = Math.min(1.25, proteinNeeded / proteinPerServing);
      if (additionalServings > 0.1) {
        const newServings = food.servings + additionalServings;
        adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
      }
    }
  }
  
  return adjustedFoods;
};
