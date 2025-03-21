
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

// Migration helper for existing food data - now with hierarchical category support
export const migrateExistingFoodData = (food: Partial<FoodItem> & { name: string; id: string; servingSizeGrams: number; servingSize: string }): FoodItem => {
  // If food already has a primary category, migrate it to include hierarchical structure
  const existingFood = food as FoodItem;
  
  // Assign primary category if missing
  const primaryCategory = 'primaryCategory' in food && food.primaryCategory 
    ? food.primaryCategory 
    : assignDefaultCategory(existingFood);
  
  // Determine secondary categories
  let secondaryCategories = food.secondaryCategories || [];
  
  // If we don't have secondary categories, infer them
  if (!food.secondaryCategories || food.secondaryCategories.length === 0) {
    const inferredCategories = inferSecondaryCategories({
      ...existingFood,
      primaryCategory
    });
    
    if (inferredCategories) {
      secondaryCategories = inferredCategories;
    }
  }
  
  // Create a new object with all properties from the original food plus updated categories
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
    secondaryCategories: secondaryCategories.length > 0 ? secondaryCategories : undefined,
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
