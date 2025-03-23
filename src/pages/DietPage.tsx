
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FoodPreferences } from "@/components/diet/FoodPreferences";
import { MealPlanDisplay } from "@/components/diet/MealPlanDisplay";
import { EmptyStateMessage } from "@/components/diet/EmptyStateMessage";
import { DietSelector } from "@/components/diet/DietSelector"; 
import FoodData, { foodCategoriesData } from "@/components/diet/FoodData";
import { useMealPlanState } from "@/components/diet/useMealPlanState";
import { useFoodSelectionState } from "@/components/diet/useFoodSelectionState";
import { getAvailableDietTypes } from "@/utils/diet/foodDataProcessing";
import { useFoodDatabase } from "@/components/admin/diet/FoodUtils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FoodSearchBar } from "@/components/diet/FoodSearchBar";

const DietPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState("preferences");
  const [initialized, setInitialized] = useState(false);
  const { initializeFoodData } = useFoodDatabase();
  const [apiError, setApiError] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);

  // Initialize food data on component mount
  useEffect(() => {
    const initData = async () => {
      if (apiAttempted) return; // Prevent repeated attempts
      
      setApiAttempted(true);
      try {
        await initializeFoodData();
        console.log("DietPage: Food data initialized from Open Food Facts API");
        setInitialized(true);
        setApiError(false);
      } catch (error) {
        console.error("Error initializing food data:", error);
        setApiError(true);
        toast({
          title: "Data Initialization Notice",
          description: "Using local data instead of online food database.",
          variant: "default",
        });
      }
    };
    
    initData();
  }, [initializeFoodData, toast, apiAttempted]);

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
    getAvailableDiets,
    foodCategories,
    loading,
    searchFoodItems,
    searchResults,
    searchQuery,
    setSearchQuery
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
  
  // Log available diets for debugging
  useEffect(() => {
    if (initialized) {
      console.log("Diet types from central collection:", getAvailableDietTypes());
      console.log("Available diets for selection:", availableDiets);
    }
  }, [availableDiets, initialized]);

  // Generate meal plan function that passes selected food items and the diet type
  const handleGenerateMealPlan = useCallback(() => {
    generateMealPlanHook(getSelectedFoodItems(), selectedDiet);
    setActiveTab("plan");
  }, [generateMealPlanHook, getSelectedFoodItems, selectedDiet]);

  // Regenerate meal function that passes selected food items
  const handleRegenerateMeal = useCallback((mealId: string) => {
    regenerateMealHook(mealId, getSelectedFoodItems());
  }, [regenerateMealHook, getSelectedFoodItems]);

  // Handle food search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        await searchFoodItems(query);
      } catch (error) {
        console.error("Search error:", error);
      }
    }
  }, [searchFoodItems, setSearchQuery]);

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
          
          {apiError && (
            <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-300">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Open Food Facts API Unavailable</AlertTitle>
              <AlertDescription className="text-amber-700">
                Unable to connect to the online food database. Using local food data instead.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Add search bar at the top level for visibility */}
          <div className="mb-4">
            <FoodSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              isLoading={loading}
            />
          </div>
          
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
            
            <TabsContent value="preferences" className="space-y-4">
              <DietSelector 
                selectedDiet={selectedDiet}
                onDietChange={setSelectedDiet}
                availableDiets={availableDiets}
                isLoading={loading}
              />
              
              <FoodPreferences 
                foodCategories={foodCategories}
                selectedFoods={selectedFoods}
                setSelectedFoods={setSelectedFoods}
                selectedDiet={selectedDiet}
                setSelectedDiet={setSelectedDiet}
                includeFreeMeal={includeFreeMeal}
                setIncludeFreeMeal={setIncludeFreeMeal}
                generateMealPlan={handleGenerateMealPlan}
                dailyCalories={userData.dailyCalories || 2000}
                availableDiets={availableDiets}
                onSearch={handleSearch}
                isLoading={loading}
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
