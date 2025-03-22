
import { useState, useEffect } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { filterFoodsByDiet, getCompatibleDiets } from "@/utils/diet/dietCompatibilityChecker";
import { migrateExistingFoodData, batchMigrateExistingFoodData } from "@/utils/diet/dietDataMigration";
import { getAvailableDietTypes, addDietType } from "@/utils/diet/foodDataProcessing";

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
    
    // Add this diet to available diets if it's not already there
    addDietType(diet);
    
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

  // Get diets that have at least one compatible food - now using the dynamically collected diet types
  const getAvailableDiets = (): DietType[] => {
    // Get all available diet types from our central collection
    const allAvailableDiets = getAvailableDietTypes();
    console.log("All diet types from central collection:", allAvailableDiets);
    
    // Get all foods in the database
    const allFoods = migratedFoodCategories.flatMap(category => 
      category.items.map(food => migrateExistingFoodData(food))
    );
    
    // Only consider non-empty food data
    if (allFoods.length === 0) {
      console.warn("No foods available to determine compatible diets");
      return ["all" as DietType];
    }
    
    // Filter to diets that have at least one compatible food
    const dietWithCompatibleFoods = ["all" as DietType];
    
    // Check each diet from our central collection
    allAvailableDiets.forEach(diet => {
      // Skip "all" as it's already included
      if (diet === "all") return;
      
      // Check if this diet has compatible foods
      // For explicitly tagged diets, check if any food has this diet tag
      const hasExplicitTag = allFoods.some(food => 
        food.diets && Array.isArray(food.diets) && food.diets.includes(diet)
      );
      
      if (hasExplicitTag) {
        dietWithCompatibleFoods.push(diet as DietType);
      } else {
        // Fallback to rule-based compatibility check for standard diets
        const compatibleFoods = filterFoodsByDiet(allFoods, diet as DietType);
        
        if (compatibleFoods.length > 0) {
          dietWithCompatibleFoods.push(diet as DietType);
        }
      }
    });
    
    // Log the final list of available diets for debugging
    console.log("Final available diets (with compatible foods):", dietWithCompatibleFoods);
    
    return dietWithCompatibleFoods as DietType[];
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
