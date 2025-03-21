
import { useState } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { filterFoodsByDiet } from "@/utils/dietCompatibilityUtils";

export const useFoodSelectionState = (foodCategories: FoodCategory[]) => {
  const { toast } = useToast();
  // Initialize selectedFoods with all foods set to true by default
  const initializeSelectedFoods = () => {
    const foods: Record<string, boolean> = {};
    foodCategories.forEach(category => {
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
    
    foodCategories.forEach(category => {
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
    return foodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id]);
  };

  // Get compatible food items for current diet
  const getDietCompatibleFoods = (): FoodItem[] => {
    if (selectedDiet === "all") return foodCategories.flatMap(category => category.items);
    
    return foodCategories.flatMap(category => 
      filterFoodsByDiet(category.items, selectedDiet)
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

