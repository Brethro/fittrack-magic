
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Meal, FoodItem, DietType } from "@/types/diet";

// Local implementation since createBalancedMeal is not exported from dietUtils
const createBalancedMeal = (
  foods: FoodItem[],
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFats: number,
  mealName: string,
  tolerance = 0.05
): Meal => {
  // Simple placeholder implementation during migration
  return {
    id: `placeholder-${mealName.toLowerCase()}`,
    name: mealName,
    foods: [{
      id: "placeholder-food",
      name: "Placeholder (API Migration)",
      servings: 1,
      servingSizeGrams: 100,
      servingSize: "100g",
      protein: targetProtein,
      carbs: targetCarbs,
      fats: targetFats,
      calories: targetCalories
    }],
    totalProtein: targetProtein,
    totalCarbs: targetCarbs,
    totalFats: targetFats,
    totalCalories: targetCalories
  };
};

interface UseMealPlanStateProps {
  dailyCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
}

export const useMealPlanState = ({
  dailyCalories,
  targetProtein,
  targetCarbs,
  targetFats
}: UseMealPlanStateProps) => {
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [includeFreeMeal, setIncludeFreeMeal] = useState(false);
  const [freeMealCalories, setFreeMealCalories] = useState(
    dailyCalories ? Math.round(dailyCalories * 0.2) : 500
  );
  const [activeDietType, setActiveDietType] = useState<DietType>("all");

  const generateMealPlan = (selectedFoodItems: FoodItem[], dietType: DietType = "all") => {
    const selectedFoodCount = selectedFoodItems.length;
    setActiveDietType(dietType);
    
    if (selectedFoodCount < 10) {
      toast({
        title: "Not enough foods selected",
        description: "Please select at least 10 different foods to create a varied meal plan",
        variant: "destructive",
      });
      return;
    }

    // Adjust macros if free meal is included
    let availableCalories = dailyCalories;
    let availableProtein = targetProtein;
    let availableCarbs = targetCarbs;
    let availableFats = targetFats;

    if (includeFreeMeal) {
      // Limit free meal to at most 20% of daily calories
      const freeMealCals = Math.min(freeMealCalories, dailyCalories * 0.2);
      availableCalories -= freeMealCals;
      
      // Roughly distribute the macros for the free meal (assuming 20% protein, 50% carbs, 30% fat)
      availableProtein -= Math.round((freeMealCals * 0.2) / 4); // Protein has 4 calories per gram
      availableCarbs -= Math.round((freeMealCals * 0.5) / 4);   // Carbs have 4 calories per gram
      availableFats -= Math.round((freeMealCals * 0.3) / 9);    // Fats have 9 calories per gram
    }

    // Distribute into 3 or 4 meals based on calorie amount
    const numberOfMeals = availableCalories > 1800 ? 4 : 3;
    
    // Calculate macros per meal (distribute evenly)
    const caloriesPerMeal = Math.floor(availableCalories / numberOfMeals);
    const proteinPerMeal = Math.floor(availableProtein / numberOfMeals);
    const carbsPerMeal = Math.floor(availableCarbs / numberOfMeals);
    const fatsPerMeal = Math.floor(availableFats / numberOfMeals);

    const mealNames = ["Breakfast", "Lunch", "Dinner", "Snack"];
    
    // Use stricter tolerance (0.03 = 3%) for specific diets to ensure we stay within 5% overall
    const stricter = dietType !== "all" ? 0.03 : 0.05;
    
    // Create balanced meals using our utility function
    const meals: Meal[] = [];
    for (let i = 0; i < numberOfMeals; i++) {
      const meal = createBalancedMeal(
        selectedFoodItems,
        caloriesPerMeal,
        proteinPerMeal,
        carbsPerMeal,
        fatsPerMeal,
        mealNames[i],
        stricter
      );
      meals.push(meal);
    }

    // If free meal is included, add it
    if (includeFreeMeal) {
      const freeMealCals = Math.min(freeMealCalories, dailyCalories * 0.2);
      meals.push({
        id: "free-meal",
        name: "Free Meal",
        foods: [{
          id: "free-choice",
          name: "Your choice",
          servings: 1,
          servingSizeGrams: 0,
          servingSize: "Your choice",
          protein: Math.round((freeMealCals * 0.2) / 4),
          carbs: Math.round((freeMealCals * 0.5) / 4),
          fats: Math.round((freeMealCals * 0.3) / 9),
          calories: freeMealCals
        }],
        totalProtein: Math.round((freeMealCals * 0.2) / 4),
        totalCarbs: Math.round((freeMealCals * 0.5) / 4),
        totalFats: Math.round((freeMealCals * 0.3) / 9),
        totalCalories: freeMealCals
      });
    }

    setMealPlan(meals);
    
    toast({
      title: "Meal plan generated!",
      description: "Your personalized meal plan is ready.",
    });
  };

  // Regenerate a specific meal - MODIFIED for better target adherence
  const regenerateMeal = (mealId: string, selectedFoodItems: FoodItem[]) => {
    if (mealId === "free-meal") return; // Don't regenerate free meals
    
    // Find the meal to regenerate
    const mealIndex = mealPlan.findIndex(meal => meal.id === mealId);
    if (mealIndex === -1) return;
    
    // Calculate the current totals for all OTHER meals (excluding the one being regenerated)
    const otherMeals = mealPlan.filter((_, index) => index !== mealIndex && mealPlan[index].name !== "Free Meal");
    const otherMealsTotals = otherMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fats: acc.fats + meal.totalFats
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    
    // If free meal is included, account for its nutrition
    let freeMealCaloriesValue = 0;
    let freeMealProtein = 0;
    let freeMealCarbs = 0;
    let freeMealFats = 0;
    
    if (includeFreeMeal) {
      const freeMeal = mealPlan.find(meal => meal.name === "Free Meal");
      if (freeMeal) {
        freeMealCaloriesValue = freeMeal.totalCalories;
        freeMealProtein = freeMeal.totalProtein;
        freeMealCarbs = freeMeal.totalCarbs;
        freeMealFats = freeMeal.totalFats;
      }
    }
    
    // Calculate remaining targets for this meal specifically
    const targetCaloriesForMeal = Math.max(0, dailyCalories - otherMealsTotals.calories - freeMealCaloriesValue);
    const targetProteinForMeal = Math.max(0, targetProtein - otherMealsTotals.protein - freeMealProtein);
    const targetCarbsForMeal = Math.max(0, targetCarbs - otherMealsTotals.carbs - freeMealCarbs);
    const targetFatsForMeal = Math.max(0, targetFats - otherMealsTotals.fats - freeMealFats);
    
    // Use stricter tolerance for specific diets
    const stricter = activeDietType !== "all" ? 0.03 : 0.05;
    
    // Generate new meal with specific targets for this meal
    const newMeal = createBalancedMeal(
      selectedFoodItems,
      targetCaloriesForMeal,
      targetProteinForMeal,
      targetCarbsForMeal,
      targetFatsForMeal,
      mealPlan[mealIndex].name,
      stricter
    );
    
    // Update the meal plan
    const updatedMealPlan = [...mealPlan];
    updatedMealPlan[mealIndex] = newMeal;
    setMealPlan(updatedMealPlan);
    
    toast({
      title: "Meal regenerated",
      description: "Your meal has been refreshed with new options.",
    });
  };

  return {
    mealPlan,
    setMealPlan,
    includeFreeMeal,
    setIncludeFreeMeal,
    freeMealCalories,
    setFreeMealCalories,
    generateMealPlan,
    regenerateMeal,
    activeDietType
  };
};
