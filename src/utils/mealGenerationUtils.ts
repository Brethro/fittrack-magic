
import { calculateServings, recalculateFoodWithServings } from "./macroUtils";
import { FoodItem, Meal, MealPlan } from "@/types/diet";

// Generate a complete meal plan based on user preferences
export const generateMealPlan = (
  selectedFoods: FoodItem[],
  totalCalories: number,
  macros: { protein: number; carbs: number; fats: number },
  mealCount: number = 3,
  includeFreeMeal: boolean = false
): MealPlan => {
  // Create default meal plan structure
  const meals: Meal[] = [];
  
  for (let i = 0; i < mealCount; i++) {
    meals.push({
      id: `meal-${i + 1}`,
      name: getMealNameByIndex(i),
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0
    });
  }
  
  // Distribute foods across meals
  distributeAcrossMeals(meals, selectedFoods, totalCalories, macros);
  
  // Calculate meal macro totals
  const mealPlan: MealPlan = {
    meals,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0
  };
  
  calculateMealPlanTotals(mealPlan);
  
  return mealPlan;
};

// Get meal name by index
const getMealNameByIndex = (index: number): string => {
  const mealNames = ["Breakfast", "Lunch", "Dinner", "Snack", "Second Snack"];
  return mealNames[index] || `Meal ${index + 1}`;
};

// Distribute foods across meals
const distributeAcrossMeals = (
  meals: Meal[],
  availableFoods: FoodItem[],
  totalCalories: number,
  macros: { protein: number; carbs: number; fats: number }
): void => {
  if (!availableFoods.length || !meals.length) return;
  
  // Simple distribution logic - just assign foods to meals
  const caloriesPerMeal = totalCalories / meals.length;
  const proteinPerMeal = macros.protein / meals.length;
  
  const shuffledFoods = [...availableFoods].sort(() => Math.random() - 0.5);
  
  meals.forEach((meal, index) => {
    let currentCalories = 0;
    let currentProtein = 0;
    
    // Starting food index for this meal
    const startIndex = (index * shuffledFoods.length) / meals.length;
    const endIndex = ((index + 1) * shuffledFoods.length) / meals.length;
    
    // Assign foods to this meal
    for (let i = Math.floor(startIndex); i < Math.floor(endIndex); i++) {
      if (i >= shuffledFoods.length) break;
      
      const food = shuffledFoods[i];
      const servings = calculateServings(food, proteinPerMeal / 3, caloriesPerMeal / 3);
      
      const foodWithServings = recalculateFoodWithServings(food, servings);
      meal.foods.push(foodWithServings);
      
      currentCalories += foodWithServings.caloriesPerServing || 0;
      currentProtein += foodWithServings.protein || 0;
      
      if (currentCalories >= caloriesPerMeal * 0.8) break;
    }
    
    // Update meal totals
    calculateMealTotals(meal);
  });
};

// Calculate meal totals
export const calculateMealTotals = (meal: Meal): void => {
  meal.totalCalories = meal.foods.reduce((sum, food) => sum + (food.caloriesPerServing || 0), 0);
  meal.totalProtein = meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
  meal.totalCarbs = meal.foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  meal.totalFats = meal.foods.reduce((sum, food) => sum + (food.fats || 0), 0);
};

// Calculate meal plan totals
export const calculateMealPlanTotals = (mealPlan: MealPlan): void => {
  mealPlan.totalCalories = mealPlan.meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  mealPlan.totalProtein = mealPlan.meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  mealPlan.totalCarbs = mealPlan.meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  mealPlan.totalFats = mealPlan.meals.reduce((sum, meal) => sum + meal.totalFats, 0);
};

// Re-generate a specific meal
export const regenerateMeal = (
  mealPlan: MealPlan,
  mealId: string,
  selectedFoods: FoodItem[]
): MealPlan => {
  const mealIndex = mealPlan.meals.findIndex(meal => meal.id === mealId);
  if (mealIndex === -1) return mealPlan;
  
  // Calculate target calories for this meal
  const targetCalories = mealPlan.totalCalories / mealPlan.meals.length;
  const targetProtein = mealPlan.totalProtein / mealPlan.meals.length;
  
  // Create a new meal
  const newMeal: Meal = {
    id: mealId,
    name: mealPlan.meals[mealIndex].name,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0
  };
  
  // Fill with new foods
  const shuffledFoods = [...selectedFoods].sort(() => Math.random() - 0.5);
  let currentCalories = 0;
  
  for (let i = 0; i < Math.min(5, shuffledFoods.length); i++) {
    const food = shuffledFoods[i];
    const servings = calculateServings(food, targetProtein / 3, targetCalories / 4);
    
    const foodWithServings = recalculateFoodWithServings(food, servings);
    newMeal.foods.push(foodWithServings);
    
    currentCalories += foodWithServings.caloriesPerServing || 0;
    if (currentCalories >= targetCalories * 0.8) break;
  }
  
  // Update meal totals
  calculateMealTotals(newMeal);
  
  // Replace the meal in the meal plan
  const newMeals = [...mealPlan.meals];
  newMeals[mealIndex] = newMeal;
  
  // Create updated meal plan
  const updatedMealPlan: MealPlan = {
    ...mealPlan,
    meals: newMeals
  };
  
  // Recalculate totals
  calculateMealPlanTotals(updatedMealPlan);
  
  return updatedMealPlan;
};
