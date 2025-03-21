
import { useState } from "react";
import { FoodCategory, FoodItem } from "@/types/diet";

export const useFoodSelectionState = (foodCategories: FoodCategory[]) => {
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

  // Get all selected food items as an array
  const getSelectedFoodItems = (): FoodItem[] => {
    return foodCategories
      .flatMap(category => category.items)
      .filter(food => selectedFoods[food.id]);
  };

  return {
    selectedFoods,
    setSelectedFoods,
    getSelectedFoodItems
  };
};
