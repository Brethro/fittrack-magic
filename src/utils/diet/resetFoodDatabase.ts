
import { FoodCategory } from "@/types/diet";

/**
 * Creates an empty food database structure with the same categories
 * but without any food items
 */
export const createEmptyFoodDatabase = (): FoodCategory[] => {
  // Define all the category names we want to maintain
  const categoryNames = [
    "Meats & Poultry",
    "Fish & Seafood",
    "Eggs & Dairy",
    "Plant Proteins",
    "Grains & Pastas",
    "Starchy Vegetables",
    "Breads & Breakfast",
    "Green Vegetables",
    "Other Vegetables",
    "Fruits",
    "Nuts & Seeds", 
    "Healthy Fats",
    "Condiments & Sauces",
    "Beverages",
    "Spices & Herbs"
  ];
  
  // Create empty categories with the same structure
  return categoryNames.map(name => ({
    name,
    items: [] // Empty array for each category
  }));
};

/**
 * Resets all food data to empty arrays while maintaining category structure
 */
export const resetFoodDatabase = () => {
  return createEmptyFoodDatabase();
};
