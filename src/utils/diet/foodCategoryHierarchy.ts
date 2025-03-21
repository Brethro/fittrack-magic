
import { FoodItem, FoodPrimaryCategory, foodCategoryHierarchy } from "@/types/diet";

// Check if a category is a child of another category
export const isCategoryChildOf = (
  childCategory: FoodPrimaryCategory,
  parentCategory: FoodPrimaryCategory
): boolean => {
  // Direct match
  if (childCategory === parentCategory) return true;
  
  // Check parent-child relationship
  return foodCategoryHierarchy[childCategory] === parentCategory;
};

// Get all child categories of a parent category
export const getChildCategories = (parentCategory: FoodPrimaryCategory): FoodPrimaryCategory[] => {
  return Object.entries(foodCategoryHierarchy)
    .filter(([_, parent]) => parent === parentCategory)
    .map(([child]) => child as FoodPrimaryCategory);
};

// Check if a food belongs to a category, considering the hierarchy
export const foodBelongsToCategory = (
  food: FoodItem, 
  category: FoodPrimaryCategory
): boolean => {
  // Direct match of primary category
  if (food.primaryCategory === category) return true;
  
  // Check if food's primary category is a child of the given category
  if (isCategoryChildOf(food.primaryCategory, category)) return true;
  
  // Check secondary categories for direct matches or child relationships
  if (food.secondaryCategories) {
    return food.secondaryCategories.some(secondaryCategory => 
      secondaryCategory === category || isCategoryChildOf(secondaryCategory, category)
    );
  }
  
  return false;
};
