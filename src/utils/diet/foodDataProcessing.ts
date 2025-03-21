
import { FoodCategory, FoodItem } from "@/types/diet";
import { migrateExistingFoodData } from "@/utils/dietCompatibilityUtils";

// Process each food item with the migration helper to add primaryCategory
export const processRawFoodData = (categories: { name: string, items: Omit<FoodItem, 'primaryCategory'>[] }[]): FoodCategory[] => {
  return categories.map(category => ({
    name: category.name,
    items: category.items.map(item => migrateExistingFoodData(item as FoodItem))
  }));
};
