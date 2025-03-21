
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
export const migrateExistingFoodData = (food: Partial<FoodItem> & { name: string; id: string; servingSizeGrams: number; servingSize: string }): FoodItem => {
  // If food already has a primary category, return it with that category
  if ('primaryCategory' in food && food.primaryCategory) {
    return food as FoodItem;
  }
  
  // Assign primary category
  const primaryCategory = assignDefaultCategory(food as FoodItem);
  
  // Infer secondary categories
  const secondaryCategories = inferSecondaryCategories(food as FoodItem);
  
  // Create a new object with all properties from the original food plus the required category
  const updatedFood: FoodItem = {
    id: food.id,
    name: food.name,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fats: food.fats || 0,
    caloriesPerServing: food.caloriesPerServing || 0,
    servingSizeGrams: food.servingSizeGrams,
    servingSize: food.servingSize,
    primaryCategory: primaryCategory,
    ...(secondaryCategories ? { secondaryCategories } : {}),
    ...(food.diets ? { diets: food.diets } : {})
  };
  
  return updatedFood;
};

// Batch migrate existing food data
export const batchMigrateExistingFoodData = (foods: Partial<FoodItem>[]): FoodItem[] => {
  return foods
    .filter(food => food.name && food.id && food.servingSizeGrams && food.servingSize)
    .map(food => migrateExistingFoodData(food as any));
};
