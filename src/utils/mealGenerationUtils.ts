
import { FoodItem, Meal } from "@/types/diet";
import { calculateServings, calculateMealTotals } from './macroUtils';
import { adjustServingsForCalorieTarget } from './mealAdjustUtils';

// Create a food item with the specified servings
export const createFoodWithServings = (food: FoodItem, servings: number): any => {
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
    
    // Add 1-2 protein sources (now more likely to add 2 for better distribution)
    const proteinCount = Math.random() > 0.3 ? 2 : 1; // 70% chance of 2 protein sources
    
    for (let i = 0; i < Math.min(proteinCount, proteinOptions.length); i++) {
      const protein = proteinOptions[i];
      // Calculate servings based on protein target (divided among protein sources)
      const servings = calculateServings(
        protein, 
        targetProtein / proteinCount, 
        'protein',
        0.75, // Increased minimum servings for protein sources
        2.5    // Increased maximum servings for protein sources
      );
      
      mealFoods.push(createFoodWithServings(protein, servings));
    }
  }
  
  // Add a carb source (higher chance for more carbs)
  const carbs = foodItems.filter(food => 
    (food.carbs || 0) > 15 && 
    !mealFoods.some(mf => mf.id === food.id)
  );
  if (carbs.length > 0) {
    const randomCarb = carbs[Math.floor(Math.random() * carbs.length)];
    const servings = calculateServings(randomCarb, targetCarbs, 'carbs', 0.75, 2.0);
    
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
    // Increased minimum servings for veggies
    const servings = Math.random() > 0.5 ? 1.5 : 1.25;
    
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
      const servings = calculateServings(randomFat, targetFats - currentMacros.totalFats, 'fats', 0.5, 1.5);
      
      mealFoods.push(createFoodWithServings(randomFat, servings));
    }
  }
  
  // Check initial calories and if they're too low, consider adding another food
  let initialTotal = calculateMealTotals(mealFoods);
  const isCaloriesTooLow = initialTotal.totalCalories < targetCalories * 0.85;
  
  // If calories are too low, add an additional food source
  if (isCaloriesTooLow) {
    // Prioritize adding foods that would contribute to our calorie goal
    const additionalFoods = foodItems.filter(food => 
      food.caloriesPerServing > 50 && // Decent calorie contribution
      !mealFoods.some(mf => mf.id === food.id)
    );
    
    if (additionalFoods.length > 0) {
      const randomFood = additionalFoods[Math.floor(Math.random() * additionalFoods.length)];
      const servings = 1.0; // Standard serving to boost calories
      
      mealFoods.push(createFoodWithServings(randomFood, servings));
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
