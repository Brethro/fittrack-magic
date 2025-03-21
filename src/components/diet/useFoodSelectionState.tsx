
import { useState } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { 
  filterFoodsByDiet, 
  migrateExistingFoodData, 
  batchMigrateExistingFoodData 
} from "@/utils/dietCompatibilityUtils";

export const useFoodSelectionState = (foodCategories: FoodCategory[]) => {
  const { toast } = useToast();
  
  // Ensure all food items have primary categories (migration step)
  const migratedFoodCategories = foodCategories.map(category => ({
    ...category,
    items: batchMigrateExistingFoodData(category.items)
  }));
  
  // Initialize selectedFoods with all foods set to true by default
  const initializeSelectedFoods = () => {
    const foods: Record<string, boolean> = {};
    migratedFoodCategories.forEach(category => {
      category.items.forEach(food => {
        foods[food.id] = true; // Default to true for all foods
      });
    });
    return foods;
  };

  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>(initializeSelectedFoods());
  const [selectedDiet, setSelectedDiet] = useState<DietType>("all");

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

  return {
    selectedFoods,
    setSelectedFoods,
    selectedDiet,
    setSelectedDiet: applyDietFilter,
    getSelectedFoodItems,
    getDietCompatibleFoods
  };
};
