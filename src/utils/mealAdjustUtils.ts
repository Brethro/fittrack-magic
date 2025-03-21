import { recalculateFoodWithServings } from './macroUtils';

// Adjust servings to meet calorie and protein targets
export const adjustServingsForCalorieTarget = (
  mealFoods: any[],
  targetCalories: number,
  targetProtein: number,
  tolerance: number = 0.05 // 5% tolerance
): any[] => {
  if (mealFoods.length === 0) return [];
  
  // IMPORTANT: If target calories are very low (like when regenerating a single meal)
  // we need to make sure we don't create meals that are too small
  const minMealCalories = 200; // Minimum calories for any meal to be satisfying
  const adjustedTargetCalories = Math.max(targetCalories, minMealCalories);
  
  const currentTotal = mealFoods.reduce((sum, food) => sum + food.calories, 0);
  const currentProtein = mealFoods.reduce((sum, food) => sum + food.protein, 0);
  
  const targetCaloriesMin = adjustedTargetCalories * (1 - tolerance);
  const targetCaloriesMax = adjustedTargetCalories * (1 + tolerance);
  
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
  const maxIterations = 15; // Increased from 10 to allow more adjustment attempts
  
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
    
    // TIGHTENED ADJUSTMENTS FOR BETTER PRECISION
    
    // PRIORITY 1: Fix over-target calories (This should be our first priority now)
    if (currentCalories > targetCaloriesMax) {
      // Need to decrease calories, prioritize reducing high-calorie, low-protein foods
      const calorieReduceSortedIndices = [...sortedIndices]
        .sort((a, b) => {
          const foodA = adjustedFoods[a];
          const foodB = adjustedFoods[b];
          // Sort by calorie-to-protein ratio (descending)
          const ratioA = foodA.protein > 0 ? foodA.calories / foodA.protein : Infinity;
          const ratioB = foodB.protein > 0 ? foodB.calories / foodB.protein : Infinity;
          return ratioB - ratioA; // Reduce high calorie, low protein foods first
        });
      
      let adjusted = false;
      for (const index of calorieReduceSortedIndices) {
        const food = adjustedFoods[index];
        if (food.servings > 0.25) {
          const excessCalories = currentCalories - adjustedTargetCalories;
          const caloriesPerServing = food.calories / food.servings;
          
          if (caloriesPerServing > 0) {
            // More precise calculation for servings reduction
            const servingsToReduce = Math.min(
              food.servings - 0.25, // Don't go below 0.25 servings
              excessCalories / caloriesPerServing // Exactly what we need to reduce
            );
            
            if (servingsToReduce > 0.1) { // Only make meaningful adjustments
              const newServings = food.servings - servingsToReduce;
              adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
              adjusted = true;
              break;
            }
          }
        }
      }
      
      // If we couldn't reduce enough with one food, try multiple foods
      if (!adjusted && currentCalories > targetCaloriesMax * 1.1) { // If we're more than 10% over
        let totalReduction = 0;
        for (const index of calorieReduceSortedIndices.slice(0, 3)) { // Try up to 3 foods
          const food = adjustedFoods[index];
          if (food.servings > 0.5) { // Only reduce if there's enough to reduce
            const newServings = Math.max(0.25, food.servings * 0.75); // Reduce by 25%
            const reduction = food.calories - (food.calories * (newServings / food.servings));
            
            if (reduction > 10) { // Only make meaningful reductions
              adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
              totalReduction += reduction;
              
              // If we've reduced enough, stop
              if (currentCalories - totalReduction <= targetCaloriesMax) {
                break;
              }
            }
          }
        }
      }
    }
    
    // PRIORITY 2: Handle under-target protein
    else if (currentProtein < targetProteinMin) {
      // Need to increase protein - focus on high-protein foods
      let adjusted = false;
      
      for (const index of sortedIndices) {
        const food = adjustedFoods[index];
        if (food.protein > 0) {
          const proteinNeeded = targetProtein - currentProtein;
          const proteinPerServing = food.protein / food.servings;
          
          if (proteinPerServing > 0) {
            // More precise servings calculation
            const additionalServings = Math.min(
              proteinNeeded / proteinPerServing,
              0.5 // Max 0.5 servings increase at a time for better control
            );
            
            if (additionalServings > 0.1) {
              const newServings = food.servings + additionalServings;
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
              // Smaller increments for more precise control
              const increment = Math.min(0.5, remainingProteinNeeded / proteinPerServing);
              
              if (increment > 0.1) { // Only make meaningful adjustments
                const newServings = food.servings + increment;
                adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
                remainingProteinNeeded -= (increment * proteinPerServing);
                foodsAdjusted++;
              }
            }
          }
        }
      }
    }
    // PRIORITY 3: Fix under-target calories (only if protein is sufficient)
    else if (currentCalories < targetCaloriesMin) {
      // Need to increase calories
      let adjusted = false;
      
      // Prioritize higher carb/fat foods if protein is already adequate
      const calorieSortedIndices = [...sortedIndices].reverse(); // Reverse to get low-protein foods first
      
      for (const index of calorieSortedIndices) {
        const food = adjustedFoods[index];
        const caloriesNeeded = targetCaloriesMin - currentCalories;
        const caloriesPerServing = food.calories / food.servings;
        
        if (caloriesPerServing > 0) {
          // Precise servings calculation
          const additionalServings = Math.min(
            caloriesNeeded / caloriesPerServing,
            0.5 // Max 0.5 servings increase at a time
          );
          
          if (additionalServings > 0.1) {
            const newServings = food.servings + additionalServings;
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
            adjusted = true;
            break;
          }
        }
      }
      
      // If we couldn't adjust with carb/fat foods, try protein foods (only if needed)
      if (!adjusted && currentProtein < targetProtein) {
        for (const index of sortedIndices) {
          const food = adjustedFoods[index];
          if (food.protein > 0) {
            const additionalServings = 0.25; // Small standard increase
            const newServings = food.servings + additionalServings;
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
            break;
          }
        }
      }
    }
    // PRIORITY 4: Fix protein over target (now more important because of diet compliance)
    else if (currentProtein > targetProteinMax) {
      // Need to decrease protein
      // Focus on foods with high protein but not great protein-to-calorie ratio
      const proteinReduceSortedIndices = [...sortedIndices]
        .filter(index => adjustedFoods[index].protein > 0)
        .sort((a, b) => {
          const foodA = adjustedFoods[a];
          const foodB = adjustedFoods[b];
          // Sort by protein efficiency (protein per calorie)
          return (foodA.protein / foodA.calories) - (foodB.protein / foodB.calories);
        });
      
      for (const index of proteinReduceSortedIndices) {
        const food = adjustedFoods[index];
        if (food.servings > 0.25) {
          const excessProtein = currentProtein - targetProtein;
          const proteinPerServing = food.protein / food.servings;
          
          if (proteinPerServing > 0) {
            // Calculate servings to reduce based on excess protein
            const servingsToReduce = Math.min(
              food.servings - 0.25, // Don't go below 0.25 servings
              excessProtein / proteinPerServing
            );
            
            if (servingsToReduce > 0.1) {
              const newServings = food.servings - servingsToReduce;
              adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
              break;
            }
          }
        }
      }
    }
  }
  
  // FINAL VERIFICATION: Ensure we're within targets or at least trending in the right direction
  const finalCalories = adjustedFoods.reduce((sum, f) => sum + f.calories, 0);
  const finalProtein = adjustedFoods.reduce((sum, f) => sum + f.protein, 0);
  
  // If we've exceeded max iterations and are still significantly out of range, apply a scaling approach
  if (iterations >= maxIterations) {
    // If we're way over calories, scale everything down proportionally
    if (finalCalories > targetCaloriesMax * 1.1) { // More than 10% over
      const scaleFactor = targetCaloriesMax / finalCalories;
      
      // Only scale if it would make a significant difference
      if (scaleFactor < 0.9) {
        for (let i = 0; i < adjustedFoods.length; i++) {
          const food = adjustedFoods[i];
          const newServings = Math.max(0.25, food.servings * scaleFactor);
          adjustedFoods[i] = recalculateFoodWithServings(food, newServings);
        }
      }
    }
    // If we're way under protein, find the best protein source and increase it
    else if (finalProtein < targetProteinMin * 0.9) { // More than 10% under
      const bestProteinSource = adjustedFoods
        .map((food, index) => ({ food, index, ratio: food.protein / food.calories }))
        .filter(item => item.ratio > 0)
        .sort((a, b) => b.ratio - a.ratio)[0];
      
      if (bestProteinSource) {
        const { food, index } = bestProteinSource;
        const proteinNeeded = targetProteinMin - finalProtein;
        const proteinPerServing = food.protein / food.servings;
        
        if (proteinPerServing > 0) {
          const additionalServings = Math.min(1.0, proteinNeeded / proteinPerServing);
          if (additionalServings > 0.1) {
            const newServings = food.servings + additionalServings;
            adjustedFoods[index] = recalculateFoodWithServings(food, newServings);
          }
        }
      }
    }
  }
  
  return adjustedFoods;
};
