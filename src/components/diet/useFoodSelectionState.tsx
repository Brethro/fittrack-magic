
import { useState, useEffect } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { filterFoodsByDiet } from "@/utils/diet/dietCompatibilityChecker";
import { migrateExistingFoodData, batchMigrateExistingFoodData } from "@/utils/diet/dietDataMigration";

export const useFoodSelectionState = (foodCategories: FoodCategory[]) => {
  const { toast } = useToast();
  
  // Ensure all food items have primary categories (migration step)
  const migratedFoodCategories = foodCategories.map(category => ({
    ...category,
    items: batchMigrateExistingFoodData(category.items)
  }));
  
  // Count total foods available for debugging
  const totalFoodCount = migratedFoodCategories.reduce(
    (count, category) => count + category.items.length, 0
  );
  console.log(`Total food items available: ${totalFoodCount}`);
  
  // Initialize selectedFoods with all foods set to true by default
  const initializeSelectedFoods = () => {
    const foods: Record<string, boolean> = {};
    migratedFoodCategories.forEach(category => {
      category.items.forEach(food => {
        foods[food.id] = true; // Default to true for all foods
      });
    });
    console.log(`Initialized selected foods object with ${Object.keys(foods).length} items`);
    return foods;
  };

  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>(initializeSelectedFoods());
  const [selectedDiet, setSelectedDiet] = useState<DietType>("all");
  
  // Reset selected foods when food categories change
  useEffect(() => {
    setSelectedFoods(initializeSelectedFoods());
  }, [foodCategories]);

  // Apply diet filtering to food selection
  const applyDietFilter = (diet: DietType) => {
    if (diet === "all") {
      // Reset all foods to selected
      const allFoods = initializeSelectedFoods();
      setSelectedFoods(allFoods);
      setSelectedDiet(diet);
      return;
    }
    
    // Filter foods based on selected diet using the utility function
    const filteredFoods: Record<string, boolean> = {};
    let matchCount = 0;
    
    migratedFoodCategories.forEach(category => {
      const compatibleFoods = filterFoodsByDiet(category.items, diet);
      
      // Mark all foods as selected or not based on diet compatibility
      category.items.forEach(food => {
        const isCompatible = compatibleFoods.some(f => f.id === food.id);
        filteredFoods[food.id] = isCompatible;
        if (isCompatible) matchCount++;
      });
    });
    
    // Only apply filter if at least one food is compatible with this diet
    if (matchCount === 0) {
      toast({
        title: `No compatible foods found`,
        description: `No foods in your database are compatible with the ${diet} diet.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFoods(filteredFoods);
    setSelectedDiet(diet);
    
    const dietName = diet.charAt(0).toUpperCase() + diet.slice(1);
    toast({
      title: `${dietName} diet selected`,
      description: `${matchCount} compatible foods available.`,
    });
  };

  // Get all selected food items as an array
  const getSelectedFoodItems = (): FoodItem[] => {
    return migratedFoodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id])
      // Run migration on any food items that might lack proper categorization
      .map(food => migrateExistingFoodData(food));
  };

  // Get compatible food items for current diet
  const getDietCompatibleFoods = (): FoodItem[] => {
    if (selectedDiet === "all") {
      return migratedFoodCategories.flatMap(category => 
        category.items.map(food => migrateExistingFoodData(food))
      );
    }
    
    return migratedFoodCategories.flatMap(category => 
      filterFoodsByDiet(
        category.items.map(food => migrateExistingFoodData(food)), 
        selectedDiet
      )
    );
  };

  // Get diets that have at least one compatible food
  const getAvailableDiets = (): DietType[] => {
    // "all" is always available
    const availableDiets: DietType[] = ["all"];
    
    // Get all foods in the database
    const allFoods = migratedFoodCategories.flatMap(category => 
      category.items.map(food => migrateExistingFoodData(food))
    );
    
    // Only consider non-empty food data
    if (allFoods.length === 0) {
      console.warn("No foods available to determine compatible diets");
      return ["all"];
    }
    
    // Get all diet types except "all"
    const dietTypes: Exclude<DietType, "all">[] = [
      "mediterranean", "vegetarian", "vegan", "japanese", 
      "korean", "mexican", "italian", "paleo", "keto", "pescatarian"
    ];
    
    // Check each diet for compatible foods
    dietTypes.forEach(diet => {
      const compatibleFoods = filterFoodsByDiet(allFoods, diet);
      
      // Add detailed debugging for each diet
      if (diet === "japanese" || diet === "korean" || diet === "mexican" || diet === "italian") {
        console.log(`Diet ${diet} - checking compatibility for first 5 foods:`);
        allFoods.slice(0, 5).forEach(food => {
          console.log(`- ${food.name} (${food.id}): ${filterFoodsByDiet([food], diet).length > 0}`);
        });
      }
      
      if (compatibleFoods.length > 0) {
        console.log(`Diet ${diet} has ${compatibleFoods.length} compatible foods`);
        availableDiets.push(diet);
      } else {
        console.log(`Diet ${diet} has no compatible foods - will not be shown`);
      }
    });
    
    return availableDiets;
  };

  return {
    selectedFoods,
    setSelectedFoods,
    selectedDiet,
    setSelectedDiet: applyDietFilter,
    getSelectedFoodItems,
    getDietCompatibleFoods,
    getAvailableDiets
  };
};
