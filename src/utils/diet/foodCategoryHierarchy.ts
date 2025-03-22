import { FoodItem, FoodPrimaryCategory } from "@/types/diet";

// Define the food category hierarchy with more detailed relationships
export const foodCategoryHierarchy: Record<FoodPrimaryCategory, FoodPrimaryCategory | null> = {
  // Parent categories
  meat: null,
  
  // Child categories of meat
  redMeat: "meat",
  poultry: "meat",
  fish: "meat",
  seafood: "meat",
  shellfish: "seafood", // Shellfish is a child of seafood
  
  // Other primary categories
  dairy: null,
  egg: null,
  grain: null,
  legume: null,
  vegetable: null,
  fruit: null,
  nut: null,
  seed: null,
  oil: null,
  sweetener: null,
  herb: null,
  spice: null,
  processedFood: null,
  other: null
};

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

// Check if a category is a descendant of another category (direct or indirect)
export const isCategoryDescendantOf = (
  childCategory: FoodPrimaryCategory,
  ancestorCategory: FoodPrimaryCategory
): boolean => {
  // Direct match
  if (childCategory === ancestorCategory) return true;
  
  // Check immediate parent
  if (foodCategoryHierarchy[childCategory] === ancestorCategory) return true;
  
  // Check ancestors recursively
  let currentParent = foodCategoryHierarchy[childCategory];
  while (currentParent !== null) {
    if (currentParent === ancestorCategory) return true;
    currentParent = foodCategoryHierarchy[currentParent];
  }
  
  return false;
};

// Get all child categories of a parent category
export const getChildCategories = (parentCategory: FoodPrimaryCategory): FoodPrimaryCategory[] => {
  return Object.entries(foodCategoryHierarchy)
    .filter(([_, parent]) => parent === parentCategory)
    .map(([child]) => child as FoodPrimaryCategory);
};

// Get all descendant categories (direct and indirect children)
export const getDescendantCategories = (ancestorCategory: FoodPrimaryCategory): FoodPrimaryCategory[] => {
  const descendants: FoodPrimaryCategory[] = [];
  
  // First get direct children
  const directChildren = getChildCategories(ancestorCategory);
  descendants.push(...directChildren);
  
  // Recursively get children of children
  directChildren.forEach(child => {
    descendants.push(...getDescendantCategories(child));
  });
  
  return descendants;
};

// Check if a food belongs to a category, considering the hierarchy
export const foodBelongsToCategory = (
  food: FoodItem, 
  category: FoodPrimaryCategory
): boolean => {
  // Direct match of primary category
  if (food.primaryCategory === category) return true;
  
  // Check if food's primary category is a descendant of the given category
  if (isCategoryDescendantOf(food.primaryCategory, category)) return true;
  
  // Check secondary categories for direct matches or descendant relationships
  if (food.secondaryCategories) {
    return food.secondaryCategories.some(secondaryCategory => 
      secondaryCategory === category || isCategoryDescendantOf(secondaryCategory, category)
    );
  }
  
  return false;
};
