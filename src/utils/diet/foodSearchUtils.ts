
import { FoodCategory, FoodItem } from "@/types/diet";
import { fuzzyFindFood } from "@/utils/diet/fuzzyMatchUtils";

// New function to search food items using fuzzy matching
export const searchFoodItems = (query: string, foodCategories: FoodCategory[]): FoodItem[] => {
  if (!query || query.length < 2) {
    return [];
  }
  
  // Use the fuzzy matching utility
  return fuzzyFindFood(query, foodCategories);
};
