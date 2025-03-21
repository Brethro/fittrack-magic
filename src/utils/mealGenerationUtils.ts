
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
  
  // Verify we have enough food items to work with
  if (foodItems.length < 5) {
    // Create a placeholder meal if not enough foods
    return {
      id: `meal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: mealName,
      foods: [{
        id: "placeholder",
        name: "Not enough food options selected",
        servings: 1,
        servingSizeGrams: 0,
        servingSize: "Please select more foods",
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0
      }],
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalCalories: 0
    };
  }
  
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
    
    // IMPROVED: Add 1-2 protein sources based on target protein amount
    const proteinCount = targetProtein > 30 ? 2 : 1;
    
    for (let i = 0; i < Math.min(proteinCount, proteinOptions.length); i++) {
      const protein = proteinOptions[i];
      // Calculate servings based on protein target (divided among protein sources)
      const servings = calculateServings(
        protein, 
        targetProtein / (Math.min(proteinCount, proteinOptions.length)), 
        'protein',
        0.75, // Reduced from 1.0 to avoid consistently going over
        2.5   // Reduced from 3.0 to avoid consistently going over
      );
      
      mealFoods.push(createFoodWithServings(protein, servings));
    }
  }
  
  // Add a carb source - scale based on target calories
  const carbs = foodItems.filter(food => 
    (food.carbs || 0) > 15 && 
    !mealFoods.some(mf => mf.id === food.id)
  );
  if (carbs.length > 0) {
    const randomCarb = carbs[Math.floor(Math.random() * carbs.length)];
    // Scale carb servings based on meal size
    const carbServingScale = targetCalories < 400 ? 0.6 : 
                             targetCalories < 600 ? 0.8 : 1.0;
    const servings = calculateServings(randomCarb, targetCarbs * carbServingScale, 'carbs', 0.5, 1.5);
    
    mealFoods.push(createFoodWithServings(randomCarb, servings));
  }
  
  // Add vegetables - high volume, low calorie
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
    // Reduce veggie servings for smaller meals
    const servings = targetCalories < 450 ? 1.0 : 1.5;
    
    mealFoods.push(createFoodWithServings(randomVeggie, servings));
  }
  
  // Add healthy fat if needed - scale based on target
  const currentMacros = calculateMealTotals(mealFoods);
  if (currentMacros.totalFats < targetFats * 0.6) {
    const fats = foodItems.filter(food => 
      (food.fats || 0) > 5 && 
      !mealFoods.some(mf => mf.id === food.id)
    );
    if (fats.length > 0) {
      const randomFat = fats[Math.floor(Math.random() * fats.length)];
      // Scale fat servings based on meal size
      const fatServingScale = targetCalories < 400 ? 0.5 : 
                             targetCalories < 600 ? 0.75 : 1.0;
      const servings = calculateServings(randomFat, (targetFats - currentMacros.totalFats) * fatServingScale, 'fats', 0.25, 1.0);
      
      mealFoods.push(createFoodWithServings(randomFat, servings));
    }
  }
  
  // Check initial calorie and protein status
  let initialTotal = calculateMealTotals(mealFoods);
  const isCaloriesTooLow = initialTotal.totalCalories < targetCalories * 0.8;
  const isProteinTooLow = initialTotal.totalProtein < targetProtein * 0.8;
  
  // If protein is too low, add another protein source
  if (isProteinTooLow) {
    const remainingProteins = proteins.filter(food => 
      !mealFoods.some(mf => mf.id === food.id)
    );
    
    if (remainingProteins.length > 0) {
      const additionalProtein = remainingProteins[Math.floor(Math.random() * remainingProteins.length)];
      const proteinNeeded = targetProtein - initialTotal.totalProtein;
      // Add just enough to meet target
      const servings = calculateServings(additionalProtein, proteinNeeded, 'protein', 0.5, 1.0);
      
      mealFoods.push(createFoodWithServings(additionalProtein, servings));
    }
  }
  // If calories are too low but protein is ok, add an additional food source
  else if (isCaloriesTooLow) {
    // Prioritize adding foods that would contribute to our calorie goal
    const additionalFoods = foodItems.filter(food => 
      food.caloriesPerServing > 50 && // Decent calorie contribution
      !mealFoods.some(mf => mf.id === food.id)
    );
    
    if (additionalFoods.length > 0) {
      const randomFood = additionalFoods[Math.floor(Math.random() * additionalFoods.length)];
      // Scale servings based on how much we're under
      const caloriesNeeded = targetCalories - initialTotal.totalCalories;
      const caloriesPerServing = randomFood.caloriesPerServing || 0;
      const servings = caloriesPerServing > 0 ? 
                        Math.min(caloriesNeeded / caloriesPerServing, 1.0) : 0.75;
      
      mealFoods.push(createFoodWithServings(randomFood, servings));
    }
  }
  
  // Adjust servings to get close to calorie target and protein target
  // Using stricter tolerance of 4% instead of 5%
  mealFoods = adjustServingsForCalorieTarget(mealFoods, targetCalories, targetProtein, 0.04);
  
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
