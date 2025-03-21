
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

export const veganRules = {
  allowedPrimaryCategories: [
    "grain", "legume", "vegetable", "fruit", "nut", 
    "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "redMeat", "poultry", "fish", "seafood", "dairy", "egg"
  ] as FoodPrimaryCategory[],
  secondaryCategoryRules: {
    restricted: ["dairy", "egg"] as FoodPrimaryCategory[] // For processed foods that might contain dairy/egg
  }
};

export const veganSpecialRules = (food: FoodItem): boolean => {
  // Check for honey
  if (food.name.toLowerCase().includes("honey")) {
    return false;
  }
  return true;
};
