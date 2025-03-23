
import { FoodItem, FoodPrimaryCategory } from "@/types/diet";

// Define hierarchical relationships between food categories
const categoryHierarchy: Record<string, string[]> = {
  "meat": ["redMeat", "poultry"],
  "redMeat": [],
  "poultry": [],
  "fish": [],
  "seafood": [],
  "dairy": [],
  "egg": [],
  "grain": [],
  "legume": [],
  "vegetable": [],
  "fruit": [],
  "nut": [],
  "seed": [],
  "oil": [],
  "sweetener": [],
  "herb": [],
  "spice": [],
  "processedFood": [],
  "other": []
};

// Function to check if a food belongs to a category (directly or through hierarchy)
export const foodBelongsToCategory = (food: FoodItem, category: string): boolean => {
  // Direct match
  if (food.primaryCategory === category) {
    return true;
  }

  // Check if food's primary category is a child of the specified category
  if (food.primaryCategory && categoryHierarchy[category]) {
    return categoryHierarchy[category].includes(food.primaryCategory);
  }

  // Check secondary categories if they exist
  if (food.secondaryCategories && food.secondaryCategories.includes(category)) {
    return true;
  }

  return false;
};

// Function to get parent category
export const getParentCategory = (category: FoodPrimaryCategory): FoodPrimaryCategory | null => {
  for (const [parent, children] of Object.entries(categoryHierarchy)) {
    if (children.includes(category as string)) {
      return parent as FoodPrimaryCategory;
    }
  }
  return null;
};

// Function to get all categories
export const getAllCategories = (): string[] => {
  return [
    ...Object.keys(categoryHierarchy),
    ...Object.values(categoryHierarchy).flat()
  ].filter((value, index, self) => self.indexOf(value) === index);
};
