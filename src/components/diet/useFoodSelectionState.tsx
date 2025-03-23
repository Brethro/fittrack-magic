
import { useState } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";

/**
 * Temporary implementation during migration to Open Food Facts API
 */
export const useFoodSelectionState = (foodCategories: FoodCategory[]) => {
  const { toast } = useToast();
  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>({});
  const [selectedDiet, setSelectedDiet] = useState<DietType>("all");

  // Minimal implementation during migration
  const applyDietFilter = (diet: DietType) => {
    setSelectedDiet(diet);
    toast({
      title: "Open Food Facts Integration",
      description: "Diet filtering will be available after Open Food Facts API integration is complete.",
    });
  };

  // Stub implementations
  const getSelectedFoodItems = (): FoodItem[] => [];
  const getDietCompatibleFoods = (): FoodItem[] => [];
  const getAvailableDiets = (): DietType[] => ["all"];

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
