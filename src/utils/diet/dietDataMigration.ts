import { FoodItem } from "@/types/diet";
import { assignDefaultCategory, inferSecondaryCategories } from "./foodCategoryHelpers";
import { getCompatibleDiets } from "./dietCompatibilityChecker";

// Function to tag food items with compatible diets
export const tagFoodWithDiets = (food: FoodItem): FoodItem => {
  const compatibleDiets = getCompatibleDiets(food);
  return {
    ...food,
    diets: compatibleDiets.filter(diet => diet !== "all")
  };
};

// Function to batch process food items to add diet tags
export const batchTagFoodsWithDiets = (foods: FoodItem[]): FoodItem[] => {
  return foods.map(food => tagFoodWithDiets(food));
};

// Migration helper for existing food data
export const migrateExistingFoodData = (food: FoodItem): FoodItem => {
  // If food already has a primary category, return it unchanged
  if ('primaryCategory' in food) {
    return food;
  }
  
  // Assign primary category
  const primaryCategory = assignDefaultCategory(food);
  
  // Infer secondary categories
  const secondaryCategories = inferSecondaryCategories(food);
  
  // Return updated food with categories
  return {
    ...food,
    primaryCategory,
    ...(secondaryCategories ? { secondaryCategories } : {})
  };
};

// Batch migrate existing food data
export const batchMigrateExistingFoodData = (foods: FoodItem[]): FoodItem[] => {
  return foods.map(food => migrateExistingFoodData(food));
};
