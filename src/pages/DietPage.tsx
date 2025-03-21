
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FoodCategory, Meal } from "@/types/diet";
import { createBalancedMeal } from "@/utils/dietUtils";
import { FoodPreferences } from "@/components/diet/FoodPreferences";
import { MealPlanDisplay } from "@/components/diet/MealPlanDisplay";
import { EmptyStateMessage } from "@/components/diet/EmptyStateMessage";

const DietPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState("preferences");
  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>({});
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [includeFreeMeal, setIncludeFreeMeal] = useState(false);
  const [freeMealCalories, setFreeMealCalories] = useState(
    userData.dailyCalories ? Math.round(userData.dailyCalories * 0.2) : 500
  );

  // Sample food data with serving sizes
  const foodCategories: FoodCategory[] = [
    {
      name: "Proteins",
      items: [
        { id: "chicken_breast", name: "Chicken Breast", protein: 31, carbs: 0, fats: 3.6, caloriesPerServing: 165, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "salmon", name: "Salmon", protein: 25, carbs: 0, fats: 13, caloriesPerServing: 208, servingSize: "100g fillet", servingSizeGrams: 100 },
        { id: "eggs", name: "Eggs", protein: 13, carbs: 1, fats: 11, caloriesPerServing: 155, servingSize: "2 large eggs", servingSizeGrams: 100 },
        { id: "tofu", name: "Tofu", protein: 8, carbs: 2, fats: 4, caloriesPerServing: 76, servingSize: "100g firm", servingSizeGrams: 100 },
        { id: "beef", name: "Lean Beef", protein: 26, carbs: 0, fats: 15, caloriesPerServing: 250, servingSize: "100g cooked", servingSizeGrams: 100 },
        { id: "greek_yogurt", name: "Greek Yogurt", protein: 17, carbs: 6, fats: 0.7, caloriesPerServing: 100, servingSize: "170g container", servingSizeGrams: 170 },
        { id: "cottage_cheese", name: "Cottage Cheese", protein: 25, carbs: 6, fats: 10, caloriesPerServing: 206, servingSize: "226g cup", servingSizeGrams: 226 },
        { id: "lentils", name: "Lentils", protein: 18, carbs: 40, fats: 1, caloriesPerServing: 230, servingSize: "198g cooked cup", servingSizeGrams: 198 },
      ],
    },
    {
      name: "Carbohydrates",
      items: [
        { id: "white_rice", name: "White Rice", protein: 4, carbs: 45, fats: 0.4, caloriesPerServing: 200, servingSize: "158g cooked cup", servingSizeGrams: 158 },
        { id: "brown_rice", name: "Brown Rice", protein: 5, carbs: 46, fats: 1.8, caloriesPerServing: 216, servingSize: "195g cooked cup", servingSizeGrams: 195 },
        { id: "sweet_potato", name: "Sweet Potato", protein: 2, carbs: 26, fats: 0.1, caloriesPerServing: 112, servingSize: "130g medium", servingSizeGrams: 130 },
        { id: "quinoa", name: "Quinoa", protein: 8, carbs: 39, fats: 4, caloriesPerServing: 222, servingSize: "185g cooked cup", servingSizeGrams: 185 },
        { id: "oats", name: "Oats", protein: 13, carbs: 67, fats: 7, caloriesPerServing: 389, servingSize: "100g dry", servingSizeGrams: 100 },
        { id: "whole_wheat_bread", name: "Whole Wheat Bread", protein: 4, carbs: 13, fats: 1, caloriesPerServing: 69, servingSize: "28g slice", servingSizeGrams: 28 },
        { id: "pasta", name: "Pasta", protein: 7, carbs: 43, fats: 1, caloriesPerServing: 200, servingSize: "140g cooked cup", servingSizeGrams: 140 },
        { id: "potatoes", name: "Potatoes", protein: 2, carbs: 17, fats: 0.1, caloriesPerServing: 77, servingSize: "100g boiled", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Vegetables",
      items: [
        { id: "broccoli", name: "Broccoli", protein: 2.6, carbs: 6, fats: 0.3, caloriesPerServing: 34, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "spinach", name: "Spinach", protein: 2.9, carbs: 3.6, fats: 0.4, caloriesPerServing: 23, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "kale", name: "Kale", protein: 2.9, carbs: 6.7, fats: 0.5, caloriesPerServing: 35, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "bell_peppers", name: "Bell Peppers", protein: 1, carbs: 6, fats: 0.3, caloriesPerServing: 30, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "cucumber", name: "Cucumber", protein: 0.7, carbs: 3.6, fats: 0.1, caloriesPerServing: 16, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "carrots", name: "Carrots", protein: 0.9, carbs: 10, fats: 0.2, caloriesPerServing: 41, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "zucchini", name: "Zucchini", protein: 1.2, carbs: 3.9, fats: 0.3, caloriesPerServing: 20, servingSize: "100g raw", servingSizeGrams: 100 },
        { id: "tomatoes", name: "Tomatoes", protein: 0.9, carbs: 3.9, fats: 0.2, caloriesPerServing: 18, servingSize: "100g raw", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Fruits",
      items: [
        { id: "banana", name: "Banana", protein: 1.1, carbs: 23, fats: 0.3, caloriesPerServing: 96, servingSize: "118g medium", servingSizeGrams: 118 },
        { id: "apple", name: "Apple", protein: 0.3, carbs: 14, fats: 0.2, caloriesPerServing: 59, servingSize: "100g medium", servingSizeGrams: 100 },
        { id: "berries", name: "Mixed Berries", protein: 0.7, carbs: 14, fats: 0.3, caloriesPerServing: 57, servingSize: "100g", servingSizeGrams: 100 },
        { id: "orange", name: "Orange", protein: 1.2, carbs: 12, fats: 0.2, caloriesPerServing: 62, servingSize: "131g medium", servingSizeGrams: 131 },
        { id: "avocado", name: "Avocado", protein: 2, carbs: 12, fats: 15, caloriesPerServing: 160, servingSize: "100g (1/2 medium)", servingSizeGrams: 100 },
        { id: "mango", name: "Mango", protein: 0.8, carbs: 15, fats: 0.3, caloriesPerServing: 60, servingSize: "100g", servingSizeGrams: 100 },
      ],
    },
    {
      name: "Healthy Fats",
      items: [
        { id: "olive_oil", name: "Olive Oil", protein: 0, carbs: 0, fats: 14, caloriesPerServing: 119, servingSize: "1 tbsp (14g)", servingSizeGrams: 14 },
        { id: "almonds", name: "Almonds", protein: 6, carbs: 6, fats: 14, caloriesPerServing: 164, servingSize: "28g (1/4 cup)", servingSizeGrams: 28 },
        { id: "walnuts", name: "Walnuts", protein: 4, carbs: 4, fats: 18, caloriesPerServing: 185, servingSize: "30g (1/4 cup)", servingSizeGrams: 30 },
        { id: "chia_seeds", name: "Chia Seeds", protein: 5, carbs: 12, fats: 9, caloriesPerServing: 137, servingSize: "28g (2 tbsp)", servingSizeGrams: 28 },
        { id: "flax_seeds", name: "Flax Seeds", protein: 5, carbs: 8, fats: 10, caloriesPerServing: 150, servingSize: "30g (2 tbsp)", servingSizeGrams: 30 },
        { id: "peanut_butter", name: "Peanut Butter", protein: 4, carbs: 3, fats: 8, caloriesPerServing: 94, servingSize: "16g (1 tbsp)", servingSizeGrams: 16 },
      ],
    },
  ];

  useEffect(() => {
    if (!userData.dailyCalories || !userData.macros.protein) {
      toast({
        title: "Missing information",
        description: "Please complete your goals and nutrition plan first",
        variant: "destructive",
      });
      navigate("/plan");
    }
  }, [userData.dailyCalories, userData.macros.protein, navigate, toast]);

  // Generate a meal plan based on selected foods and user's macros
  const generateMealPlan = () => {
    if (Object.keys(selectedFoods).filter(id => selectedFoods[id]).length < 10) {
      toast({
        title: "Not enough foods selected",
        description: "Please select at least 10 different foods to create a varied meal plan",
        variant: "destructive",
      });
      return;
    }

    // Get user's daily targets
    const dailyCalories = userData.dailyCalories || 2000;
    const targetProtein = userData.macros.protein || 150;
    const targetCarbs = userData.macros.carbs || 200;
    const targetFats = userData.macros.fats || 67;

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

    // Create a pool of available foods
    const selectedFoodItems = foodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id]);

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
    setActiveTab("plan");
    
    toast({
      title: "Meal plan generated!",
      description: "Your personalized meal plan is ready.",
    });
  };

  // Regenerate a specific meal
  const regenerateMeal = (mealId: string) => {
    if (mealId === "free-meal") return; // Don't regenerate free meals
    
    // Find the meal to regenerate
    const mealIndex = mealPlan.findIndex(meal => meal.id === mealId);
    if (mealIndex === -1) return;
    
    // Get user's daily targets
    const dailyCalories = userData.dailyCalories || 2000;
    const targetProtein = userData.macros.protein || 150;
    const targetCarbs = userData.macros.carbs || 200;
    const targetFats = userData.macros.fats || 67;
    
    // Calculate number of meals (excluding free meal)
    const regularMeals = includeFreeMeal ? mealPlan.length - 1 : mealPlan.length;
    
    // Calculate per-meal targets
    const caloriesPerMeal = Math.floor(dailyCalories / regularMeals);
    const proteinPerMeal = Math.floor(targetProtein / regularMeals);
    const carbsPerMeal = Math.floor(targetCarbs / regularMeals);
    const fatsPerMeal = Math.floor(targetFats / regularMeals);
    
    // Create a pool of available foods
    const selectedFoodItems = foodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id]);
    
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

  if (!userData.dailyCalories || !userData.macros.protein) {
    return <EmptyStateMessage />;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6 text-gradient-purple">
            Your Diet Plan
          </h1>
          
          <Tabs 
            defaultValue="preferences" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="preferences">Food Preferences</TabsTrigger>
              <TabsTrigger value="plan">Meal Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences" className="space-y-6">
              <FoodPreferences 
                foodCategories={foodCategories}
                selectedFoods={selectedFoods}
                setSelectedFoods={setSelectedFoods}
                includeFreeMeal={includeFreeMeal}
                setIncludeFreeMeal={setIncludeFreeMeal}
                generateMealPlan={generateMealPlan}
                dailyCalories={userData.dailyCalories || 2000}
              />
            </TabsContent>
            
            <TabsContent value="plan" className="space-y-4">
              <MealPlanDisplay 
                mealPlan={mealPlan}
                generateMealPlan={generateMealPlan}
                regenerateMeal={regenerateMeal}
                setActiveTab={setActiveTab}
                calorieTarget={userData.dailyCalories || 2000}
                userMacros={userData.macros}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DietPage;
