import { FoodItem, FoodPrimaryCategory } from "@/types/diet";
import { categoryDisplayNames } from "./categoryDisplayNames";

// Get a list of all primary food categories
export const getAllPrimaryCategories = (): FoodPrimaryCategory[] => {
  return [
    "meat", 
    "redMeat", 
    "poultry", 
    "fish", 
    "seafood", 
    "dairy", 
    "egg", 
    "grain", 
    "legume", 
    "vegetable", 
    "fruit", 
    "nut", 
    "seed", 
    "oil", 
    "sweetener", 
    "herb", 
    "spice", 
    "processedFood", 
    "other"
  ];
};

// Get display name for a category
export const getCategoryDisplayName = (category: string): string => {
  return categoryDisplayNames[category] || category;
};

// Group food items by primary category
export const groupByPrimaryCategory = (
  foods: FoodItem[]
): Record<FoodPrimaryCategory, FoodItem[]> => {
  const result: Record<string, FoodItem[]> = {};
  
  for (const food of foods) {
    const category = food.primaryCategory;
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(food);
  }
  
  return result as Record<FoodPrimaryCategory, FoodItem[]>;
};

// Determine if a food is compatible with a specific diet
export const isFoodCompatibleWithDiet = (food: FoodItem, diet: string): boolean => {
  // All diet accepts everything
  if (diet === "all") return true;
  
  // If the food specifies compatible diets, check those first
  if (food.diets && food.diets.includes(diet as any)) {
    return true;
  }
  
  // Default compatibility rules based on categories
  switch (diet) {
    case "vegetarian":
      return !["meat", "redMeat", "poultry", "fish", "seafood"].includes(food.primaryCategory);
    
    case "vegan":
      return !["meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg"].includes(food.primaryCategory);
    
    case "pescatarian":
      return !["meat", "redMeat", "poultry"].includes(food.primaryCategory);
    
    case "keto":
      return !["grain", "fruit", "legume"].includes(food.primaryCategory);
    
    default:
      return true;
  }
};

// Helper to guess a food's primary category from its name
export const guessPrimaryCategoryFromName = (name: string): FoodPrimaryCategory => {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("chicken") || nameLower.includes("turkey")) {
    return "poultry";
  }
  
  if (nameLower.includes("beef") || nameLower.includes("steak") || 
      nameLower.includes("lamb") || nameLower.includes("pork")) {
    return "redMeat";
  }
  
  if (nameLower.includes("fish") || nameLower.includes("salmon") || 
      nameLower.includes("tuna") || nameLower.includes("cod")) {
    return "fish";
  }
  
  if (nameLower.includes("milk") || nameLower.includes("cheese") || 
      nameLower.includes("yogurt")) {
    return "dairy";
  }
  
  // And so on for other categories...
  
  return "other"; // Default category if no matches
};
