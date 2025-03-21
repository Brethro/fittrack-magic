
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FoodPreferences } from "@/components/diet/FoodPreferences";
import { MealPlanDisplay } from "@/components/diet/MealPlanDisplay";
import { EmptyStateMessage } from "@/components/diet/EmptyStateMessage";
import { foodCategoriesData } from "@/data/diet";
import { useMealPlanState } from "@/components/diet/useMealPlanState";
import { useFoodSelectionState } from "@/components/diet/useFoodSelectionState";

const DietPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState("preferences");

  // Check if user has required data
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

  // If no user data, show empty state
  if (!userData.dailyCalories || !userData.macros.protein) {
    return <EmptyStateMessage />;
  }

  // Use custom hooks to manage state
  const { 
    selectedFoods, 
    setSelectedFoods, 
    selectedDiet,
    setSelectedDiet,
    getSelectedFoodItems,
    getAvailableDiets 
  } = useFoodSelectionState(foodCategoriesData);
  
  const { 
    mealPlan, 
    includeFreeMeal, 
    setIncludeFreeMeal, 
    generateMealPlan: generateMealPlanHook, 
    regenerateMeal: regenerateMealHook 
  } = useMealPlanState({
    dailyCalories: userData.dailyCalories || 2000,
    targetProtein: userData.macros.protein || 150,
    targetCarbs: userData.macros.carbs || 200,
    targetFats: userData.macros.fats || 67
  });

  // Get available diets for current food database
  const availableDiets = getAvailableDiets();

  // Generate meal plan function that passes selected food items and the diet type
  const handleGenerateMealPlan = () => {
    generateMealPlanHook(getSelectedFoodItems(), selectedDiet);
    setActiveTab("plan");
  };

  // Regenerate meal function that passes selected food items
  const handleRegenerateMeal = (mealId: string) => {
    regenerateMealHook(mealId, getSelectedFoodItems());
  };

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
                foodCategories={foodCategoriesData}
                selectedFoods={selectedFoods}
                setSelectedFoods={setSelectedFoods}
                selectedDiet={selectedDiet}
                setSelectedDiet={setSelectedDiet}
                includeFreeMeal={includeFreeMeal}
                setIncludeFreeMeal={setIncludeFreeMeal}
                generateMealPlan={handleGenerateMealPlan}
                dailyCalories={userData.dailyCalories || 2000}
                availableDiets={availableDiets}
              />
            </TabsContent>
            
            <TabsContent value="plan" className="space-y-4">
              <MealPlanDisplay 
                mealPlan={mealPlan}
                generateMealPlan={handleGenerateMealPlan}
                regenerateMeal={handleRegenerateMeal}
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
