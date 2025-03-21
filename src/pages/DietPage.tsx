import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Utensils, Flame, RefreshCw, PlusCircle } from "lucide-react";

// Type definitions for food preferences
type FoodCategory = {
  name: string;
  items: {
    id: string;
    name: string;
    protein?: number;
    carbs?: number;
    fats?: number;
    caloriesPerServing?: number;
  }[];
};

type Meal = {
  id: string;
  name: string;
  foods: {
    id: string;
    name: string;
    servings: number;
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  }[];
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCalories: number;
};

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

  // Sample food data - in a real app you might fetch this from an API
  const foodCategories: FoodCategory[] = [
    {
      name: "Proteins",
      items: [
        { id: "chicken_breast", name: "Chicken Breast", protein: 31, carbs: 0, fats: 3.6, caloriesPerServing: 165 },
        { id: "salmon", name: "Salmon", protein: 25, carbs: 0, fats: 13, caloriesPerServing: 208 },
        { id: "eggs", name: "Eggs", protein: 13, carbs: 1, fats: 11, caloriesPerServing: 155 },
        { id: "tofu", name: "Tofu", protein: 8, carbs: 2, fats: 4, caloriesPerServing: 76 },
        { id: "beef", name: "Lean Beef", protein: 26, carbs: 0, fats: 15, caloriesPerServing: 250 },
        { id: "greek_yogurt", name: "Greek Yogurt", protein: 17, carbs: 6, fats: 0.7, caloriesPerServing: 100 },
        { id: "cottage_cheese", name: "Cottage Cheese", protein: 25, carbs: 6, fats: 10, caloriesPerServing: 206 },
        { id: "lentils", name: "Lentils", protein: 18, carbs: 40, fats: 1, caloriesPerServing: 230 },
      ],
    },
    {
      name: "Carbohydrates",
      items: [
        { id: "white_rice", name: "White Rice", protein: 4, carbs: 45, fats: 0.4, caloriesPerServing: 200 },
        { id: "brown_rice", name: "Brown Rice", protein: 5, carbs: 46, fats: 1.8, caloriesPerServing: 216 },
        { id: "sweet_potato", name: "Sweet Potato", protein: 2, carbs: 26, fats: 0.1, caloriesPerServing: 112 },
        { id: "quinoa", name: "Quinoa", protein: 8, carbs: 39, fats: 4, caloriesPerServing: 222 },
        { id: "oats", name: "Oats", protein: 13, carbs: 67, fats: 7, caloriesPerServing: 389 },
        { id: "whole_wheat_bread", name: "Whole Wheat Bread", protein: 4, carbs: 13, fats: 1, caloriesPerServing: 69 },
        { id: "pasta", name: "Pasta", protein: 7, carbs: 43, fats: 1, caloriesPerServing: 200 },
        { id: "potatoes", name: "Potatoes", protein: 2, carbs: 17, fats: 0.1, caloriesPerServing: 77 },
      ],
    },
    {
      name: "Vegetables",
      items: [
        { id: "broccoli", name: "Broccoli", protein: 2.6, carbs: 6, fats: 0.3, caloriesPerServing: 34 },
        { id: "spinach", name: "Spinach", protein: 2.9, carbs: 3.6, fats: 0.4, caloriesPerServing: 23 },
        { id: "kale", name: "Kale", protein: 2.9, carbs: 6.7, fats: 0.5, caloriesPerServing: 35 },
        { id: "bell_peppers", name: "Bell Peppers", protein: 1, carbs: 6, fats: 0.3, caloriesPerServing: 30 },
        { id: "cucumber", name: "Cucumber", protein: 0.7, carbs: 3.6, fats: 0.1, caloriesPerServing: 16 },
        { id: "carrots", name: "Carrots", protein: 0.9, carbs: 10, fats: 0.2, caloriesPerServing: 41 },
        { id: "zucchini", name: "Zucchini", protein: 1.2, carbs: 3.9, fats: 0.3, caloriesPerServing: 20 },
        { id: "tomatoes", name: "Tomatoes", protein: 0.9, carbs: 3.9, fats: 0.2, caloriesPerServing: 18 },
      ],
    },
    {
      name: "Fruits",
      items: [
        { id: "banana", name: "Banana", protein: 1.1, carbs: 23, fats: 0.3, caloriesPerServing: 96 },
        { id: "apple", name: "Apple", protein: 0.3, carbs: 14, fats: 0.2, caloriesPerServing: 59 },
        { id: "berries", name: "Mixed Berries", protein: 0.7, carbs: 14, fats: 0.3, caloriesPerServing: 57 },
        { id: "orange", name: "Orange", protein: 1.2, carbs: 12, fats: 0.2, caloriesPerServing: 62 },
        { id: "avocado", name: "Avocado", protein: 2, carbs: 12, fats: 15, caloriesPerServing: 160 },
        { id: "mango", name: "Mango", protein: 0.8, carbs: 15, fats: 0.3, caloriesPerServing: 60 },
      ],
    },
    {
      name: "Healthy Fats",
      items: [
        { id: "olive_oil", name: "Olive Oil", protein: 0, carbs: 0, fats: 14, caloriesPerServing: 119 },
        { id: "almonds", name: "Almonds", protein: 6, carbs: 6, fats: 14, caloriesPerServing: 164 },
        { id: "walnuts", name: "Walnuts", protein: 4, carbs: 4, fats: 18, caloriesPerServing: 185 },
        { id: "chia_seeds", name: "Chia Seeds", protein: 5, carbs: 12, fats: 9, caloriesPerServing: 137 },
        { id: "flax_seeds", name: "Flax Seeds", protein: 5, carbs: 8, fats: 10, caloriesPerServing: 150 },
        { id: "peanut_butter", name: "Peanut Butter", protein: 4, carbs: 3, fats: 8, caloriesPerServing: 94 },
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

    // Distribute into 3 or 4 meals
    const numberOfMeals = availableCalories > 1800 ? 4 : 3;
    const meals: Meal[] = [];

    // Calculate calories and macros per meal
    const caloriesPerMeal = Math.floor(availableCalories / numberOfMeals);
    const proteinPerMeal = Math.floor(availableProtein / numberOfMeals);
    const carbsPerMeal = Math.floor(availableCarbs / numberOfMeals);
    const fatsPerMeal = Math.floor(availableFats / numberOfMeals);

    const mealNames = [
      "Breakfast",
      "Lunch",
      "Dinner",
      "Snack",
    ];

    // Simple algorithm to create meals
    for (let i = 0; i < numberOfMeals; i++) {
      // Select between 3-5 foods for this meal
      const mealFoods = [];
      const targetCalories = caloriesPerMeal;
      let currentCalories = 0;
      let currentProtein = 0;
      let currentCarbs = 0;
      let currentFats = 0;
      
      // Prioritize a protein source first
      const proteins = selectedFoodItems.filter(food => (food.protein || 0) > 10);
      if (proteins.length > 0) {
        const randomProtein = proteins[Math.floor(Math.random() * proteins.length)];
        const servings = Math.max(1, Math.min(3, Math.floor(proteinPerMeal / (randomProtein.protein || 1))));
        
        mealFoods.push({
          id: randomProtein.id,
          name: randomProtein.name,
          servings,
          protein: (randomProtein.protein || 0) * servings,
          carbs: (randomProtein.carbs || 0) * servings,
          fats: (randomProtein.fats || 0) * servings,
          calories: (randomProtein.caloriesPerServing || 0) * servings
        });
        
        currentProtein += (randomProtein.protein || 0) * servings;
        currentCarbs += (randomProtein.carbs || 0) * servings;
        currentFats += (randomProtein.fats || 0) * servings;
        currentCalories += (randomProtein.caloriesPerServing || 0) * servings;
      }
      
      // Then add a carb source
      const carbs = selectedFoodItems.filter(food => 
        (food.carbs || 0) > 15 && 
        !mealFoods.some(mf => mf.id === food.id)
      );
      if (carbs.length > 0) {
        const randomCarb = carbs[Math.floor(Math.random() * carbs.length)];
        const servings = Math.max(1, Math.min(2, Math.floor((carbsPerMeal - currentCarbs) / (randomCarb.carbs || 1))));
        
        mealFoods.push({
          id: randomCarb.id,
          name: randomCarb.name,
          servings,
          protein: (randomCarb.protein || 0) * servings,
          carbs: (randomCarb.carbs || 0) * servings,
          fats: (randomCarb.fats || 0) * servings,
          calories: (randomCarb.caloriesPerServing || 0) * servings
        });
        
        currentProtein += (randomCarb.protein || 0) * servings;
        currentCarbs += (randomCarb.carbs || 0) * servings;
        currentFats += (randomCarb.fats || 0) * servings;
        currentCalories += (randomCarb.caloriesPerServing || 0) * servings;
      }
      
      // Add vegetables
      const veggies = selectedFoodItems.filter(food => 
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
        // Generous with veggies
        const servings = 2;
        
        mealFoods.push({
          id: randomVeggie.id,
          name: randomVeggie.name,
          servings,
          protein: (randomVeggie.protein || 0) * servings,
          carbs: (randomVeggie.carbs || 0) * servings,
          fats: (randomVeggie.fats || 0) * servings,
          calories: (randomVeggie.caloriesPerServing || 0) * servings
        });
        
        currentProtein += (randomVeggie.protein || 0) * servings;
        currentCarbs += (randomVeggie.carbs || 0) * servings;
        currentFats += (randomVeggie.fats || 0) * servings;
        currentCalories += (randomVeggie.caloriesPerServing || 0) * servings;
      }
      
      // Add healthy fat if needed
      if (currentFats < fatsPerMeal * 0.7) {
        const fats = selectedFoodItems.filter(food => 
          (food.fats || 0) > 5 && 
          !mealFoods.some(mf => mf.id === food.id)
        );
        if (fats.length > 0) {
          const randomFat = fats[Math.floor(Math.random() * fats.length)];
          const servings = Math.max(1, Math.min(2, Math.floor((fatsPerMeal - currentFats) / (randomFat.fats || 1))));
          
          mealFoods.push({
            id: randomFat.id,
            name: randomFat.name,
            servings,
            protein: (randomFat.protein || 0) * servings,
            carbs: (randomFat.carbs || 0) * servings,
            fats: (randomFat.fats || 0) * servings,
            calories: (randomFat.caloriesPerServing || 0) * servings
          });
          
          currentProtein += (randomFat.protein || 0) * servings;
          currentCarbs += (randomFat.carbs || 0) * servings;
          currentFats += (randomFat.fats || 0) * servings;
          currentCalories += (randomFat.caloriesPerServing || 0) * servings;
        }
      }
      
      // Add one more random item if there's room
      if (currentCalories < targetCalories * 0.8) {
        const remainingFoods = selectedFoodItems.filter(food => 
          !mealFoods.some(mf => mf.id === food.id)
        );
        if (remainingFoods.length > 0) {
          const randomFood = remainingFoods[Math.floor(Math.random() * remainingFoods.length)];
          const caloriesLeft = targetCalories - currentCalories;
          const possibleServings = Math.floor(caloriesLeft / (randomFood.caloriesPerServing || 100));
          const servings = Math.max(1, Math.min(2, possibleServings));
          
          mealFoods.push({
            id: randomFood.id,
            name: randomFood.name,
            servings,
            protein: (randomFood.protein || 0) * servings,
            carbs: (randomFood.carbs || 0) * servings,
            fats: (randomFood.fats || 0) * servings,
            calories: (randomFood.caloriesPerServing || 0) * servings
          });
          
          currentProtein += (randomFood.protein || 0) * servings;
          currentCarbs += (randomFood.carbs || 0) * servings;
          currentFats += (randomFood.fats || 0) * servings;
          currentCalories += (randomFood.caloriesPerServing || 0) * servings;
        }
      }

      meals.push({
        id: `meal-${i + 1}`,
        name: mealNames[i],
        foods: mealFoods,
        totalProtein: currentProtein,
        totalCarbs: currentCarbs,
        totalFats: currentFats,
        totalCalories: currentCalories
      });
    }

    // If free meal is included, add it
    if (includeFreeMeal) {
      meals.push({
        id: "free-meal",
        name: "Free Meal",
        foods: [{
          id: "free-choice",
          name: "Your choice",
          servings: 1,
          protein: Math.round((freeMealCalories * 0.2) / 4),
          carbs: Math.round((freeMealCalories * 0.5) / 4),
          fats: Math.round((freeMealCalories * 0.3) / 9),
          calories: freeMealCalories
        }],
        totalProtein: Math.round((freeMealCalories * 0.2) / 4),
        totalCarbs: Math.round((freeMealCalories * 0.5) / 4),
        totalFats: Math.round((freeMealCalories * 0.3) / 9),
        totalCalories: freeMealCalories
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
    // Keep the implementation simple for now
    generateMealPlan();
    
    toast({
      title: "Meal regenerated",
      description: "Your meal has been refreshed with new options.",
    });
  };

  const toggleFoodSelection = (foodId: string) => {
    setSelectedFoods(prev => ({
      ...prev,
      [foodId]: !prev[foodId]
    }));
  };

  // Calculate nutrition totals
  const calculateTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    mealPlan.forEach(meal => {
      totalCalories += meal.totalCalories;
      totalProtein += meal.totalProtein;
      totalCarbs += meal.totalCarbs;
      totalFats += meal.totalFats;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFats };
  };

  if (!userData.dailyCalories || !userData.macros.protein) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p>Please complete your goals and nutrition plan first</p>
          <Button 
            onClick={() => navigate("/plan")}
            className="mt-4"
          >
            Go to Plan
          </Button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

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
              <div className="glass-panel rounded-lg p-4">
                <h2 className="text-lg font-medium mb-3">Select Your Preferred Foods</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Check all the foods you enjoy eating. We'll use these to create your personalized meal plan.
                </p>
                
                <div className="space-y-6">
                  {foodCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map((food) => (
                          <div key={food.id} className="flex items-start space-x-2">
                            <Checkbox 
                              id={food.id}
                              checked={selectedFoods[food.id] || false}
                              onCheckedChange={() => toggleFoodSelection(food.id)}
                            />
                            <div className="grid gap-1">
                              <Label
                                htmlFor={food.id}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {food.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {food.caloriesPerServing} cal | P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-2">Free Meal Option</h3>
                  <div className="flex items-start space-x-2 mb-3">
                    <Checkbox 
                      id="free-meal"
                      checked={includeFreeMeal}
                      onCheckedChange={() => setIncludeFreeMeal(!includeFreeMeal)}
                    />
                    <div>
                      <Label
                        htmlFor="free-meal"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include a free meal
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reserve up to {Math.round(userData.dailyCalories * 0.2)} calories (20% of your daily total) for a meal of your choice.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={generateMealPlan}
                  className="w-full mt-6"
                >
                  <Utensils className="mr-2 h-4 w-4" />
                  Generate Meal Plan
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="plan" className="space-y-4">
              {mealPlan.length > 0 ? (
                <>
                  <div className="glass-panel rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium">Daily Totals</h2>
                      <Button 
                        onClick={generateMealPlan} 
                        variant="outline" 
                        size="sm"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate All
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="glass-card rounded-lg p-3 text-center">
                        <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                        <p className="text-lg font-bold">{totals.totalCalories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      
                      <div className="glass-card rounded-lg p-3 text-center">
                        <div className="flex justify-around mb-1">
                          <div className="text-blue-400 text-xs font-bold">P: {totals.totalProtein}g</div>
                          <div className="text-amber-400 text-xs font-bold">C: {totals.totalCarbs}g</div>
                          <div className="text-pink-400 text-xs font-bold">F: {totals.totalFats}g</div>
                        </div>
                        <div className="flex h-2 mb-1">
                          <div className="bg-blue-400 h-full" style={{ width: `${totals.totalProtein*4/totals.totalCalories*100}%` }}></div>
                          <div className="bg-amber-400 h-full" style={{ width: `${totals.totalCarbs*4/totals.totalCalories*100}%` }}></div>
                          <div className="bg-pink-400 h-full" style={{ width: `${totals.totalFats*9/totals.totalCalories*100}%` }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Macronutrients</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                        <span>Protein</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-1"></div>
                        <span>Carbs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-pink-400 rounded-full mr-1"></div>
                        <span>Fats</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {mealPlan.map((meal) => (
                      <div key={meal.id} className="glass-panel rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">{meal.name}</h3>
                          {meal.id !== "free-meal" && (
                            <Button 
                              onClick={() => regenerateMeal(meal.id)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {meal.foods.map((food) => (
                            <div key={food.id} className="flex justify-between items-center p-2 rounded-md bg-accent/20">
                              <div>
                                <p className="text-sm font-medium">{food.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {food.servings > 1 ? `${food.servings} servings` : "1 serving"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">{food.calories} cal</p>
                                <p className="text-xs text-muted-foreground">
                                  P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span>Total</span>
                          <span>{meal.totalCalories} calories</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Macros</span>
                          <span>P: {meal.totalProtein}g C: {meal.totalCarbs}g F: {meal.totalFats}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="glass-panel rounded-lg p-6 text-center">
                  <Utensils className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No meal plan yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Select your food preferences and generate a meal plan to get started.
                  </p>
                  <Button onClick={() => setActiveTab("preferences")}>
                    Select Food Preferences
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DietPage;
