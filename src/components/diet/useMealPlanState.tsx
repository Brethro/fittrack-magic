
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createBalancedMeal } from "@/utils/dietUtils";
import { Meal, FoodItem } from "@/types/diet";

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

  const generateMealPlan = (selectedFoodItems: FoodItem[]) => {
    const selectedFoodCount = selectedFoodItems.length;
    
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
    
    // Create balanced meals using our utility function
    const meals: Meal[] = [];
    for (let i = 0; i < numberOfMeals; i++) {
      const meal = createBalancedMeal(
        selectedFoodItems,
        caloriesPerMeal,
        proteinPerMeal,
        carbsPerMeal,
        fatsPerMeal,
        mealNames[i]
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

  // Regenerate a specific meal
  const regenerateMeal = (mealId: string, selectedFoodItems: FoodItem[]) => {
    if (mealId === "free-meal") return; // Don't regenerate free meals
    
    // Find the meal to regenerate
    const mealIndex = mealPlan.findIndex(meal => meal.id === mealId);
    if (mealIndex === -1) return;
    
    // Calculate number of meals (excluding free meal)
    const regularMeals = includeFreeMeal ? mealPlan.length - 1 : mealPlan.length;
    
    // Calculate per-meal targets
    const caloriesPerMeal = Math.floor(dailyCalories / regularMeals);
    const proteinPerMeal = Math.floor(targetProtein / regularMeals);
    const carbsPerMeal = Math.floor(targetCarbs / regularMeals);
    const fatsPerMeal = Math.floor(targetFats / regularMeals);
    
    // Generate new meal
    const newMeal = createBalancedMeal(
      selectedFoodItems,
      caloriesPerMeal,
      proteinPerMeal,
      carbsPerMeal,
      fatsPerMeal,
      mealPlan[mealIndex].name
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
    regenerateMeal
  };
};
