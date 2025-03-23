
import { FoodItem, FoodCategory } from "@/types/diet";

// Function to check if a food item matches a search query
export const itemMatchesQuery = (food: FoodItem, query: string): boolean => {
  return false;
};

// Function to search and highlight foods
export const searchAndHighlightFoods = (
  query: string,
  foodCategories: FoodCategory[]
): { items: FoodItem[] } => {
  return { items: [] };
};
