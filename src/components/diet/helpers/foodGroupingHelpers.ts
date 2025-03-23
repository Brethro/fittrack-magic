
import { FoodItem, FoodCategory } from "@/types/diet";

// Group food items by their primary category
export const groupFoodItemsByCategory = (items: FoodItem[]): Record<string, FoodItem[]> => {
  const result: Record<string, FoodItem[]> = {};
  
  if (!items || !Array.isArray(items)) return result;
  
  items.forEach(item => {
    const category = item.primaryCategory;
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(item);
  });
  
  return result;
};

// Convert grouped items to FoodCategory array
export const convertToFoodCategories = (groupedItems: Record<string, FoodItem[]>): FoodCategory[] => {
  const categories: FoodCategory[] = [];
  
  Object.entries(groupedItems).forEach(([categoryName, items]) => {
    categories.push({
      name: categoryName,
      displayName: getCategoryDisplayName(categoryName),
      items
    });
  });
  
  return categories;
};

// Get a category display name
const getCategoryDisplayName = (categoryName: string): string => {
  const displayNames: Record<string, string> = {
    "meat": "Meat",
    "poultry": "Poultry",
    "fish": "Fish",
    "seafood": "Seafood",
    "dairy": "Dairy",
    "egg": "Eggs",
    "grain": "Grains",
    "legume": "Legumes",
    "vegetable": "Vegetables",
    "fruit": "Fruits",
    "nut": "Nuts",
    "seed": "Seeds",
    "oil": "Oils",
    "sweetener": "Sweeteners",
    "herb": "Herbs",
    "spice": "Spices",
    "processedFood": "Processed Foods",
    "other": "Other Foods"
  };
  
  return displayNames[categoryName] || categoryName;
};

// Process food items into categories
export const processFoodItemsIntoCategories = (items: FoodItem[]): FoodCategory[] => {
  const groupedItems = groupFoodItemsByCategory(items);
  return convertToFoodCategories(groupedItems);
};
