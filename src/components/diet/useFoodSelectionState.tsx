
import { useState } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";

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
    
    // Filter foods based on selected diet
    const filteredFoods: Record<string, boolean> = {};
    let matchCount = 0;
    
    foodCategories.forEach(category => {
      category.items.forEach(food => {
        // If food has diet tags and includes the selected diet, or if it has no diet tags (consider compatible with all)
        const isCompatible = !food.diets || food.diets.includes(diet);
        filteredFoods[food.id] = isCompatible;
        if (isCompatible) matchCount++;
      });
    });
    
    setSelectedFoods(filteredFoods);
    setSelectedDiet(diet);
    
    toast({
      title: `${diet.charAt(0).toUpperCase() + diet.slice(1)} diet selected`,
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
    
    return foodCategories
      .flatMap(category => category.items)
      .filter(food => !food.diets || food.diets.includes(selectedDiet));
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
