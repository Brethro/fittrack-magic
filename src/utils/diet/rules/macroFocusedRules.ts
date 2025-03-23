
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Low-carb diet rules
export const lowCarbRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "egg", 
    "dairy", 
    "nut", 
    "seed", 
    "oil", 
    "vegetable",
    "herb",
    "spice"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "grain", 
    "legume", 
    "fruit", 
    "sweetener", 
    "processedFood"
  ] as FoodPrimaryCategory[]
};

// Low-carb diet special rules
export const lowCarbSpecialRules = (food: FoodItem): boolean => {
  // Return false for high-carb foods
  if (food.carbs && food.carbs > 10 && food.protein && food.protein < food.carbs) {
    return false;
  }
  
  return true;
};

// High-protein diet rules
export const highProteinRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "egg", 
    "dairy", 
    "legume", 
    "nut", 
    "seed"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "oil", 
    "sweetener", 
    "processedFood"
  ] as FoodPrimaryCategory[]
};

// High-protein diet special rules
export const highProteinSpecialRules = (food: FoodItem): boolean => {
  // High protein foods should have good protein content
  if (food.protein && food.protein < 5) {
    return false;
  }
  
  return true;
};
