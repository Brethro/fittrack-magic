
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

export const pescatarianRules = {
  allowedPrimaryCategories: [
    "fish", "seafood", "dairy", "egg", "grain", "legume", "vegetable", 
    "fruit", "nut", "seed", "oil", "sweetener", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "redMeat", "poultry"
  ] as FoodPrimaryCategory[]
};

export const pescatarianSpecialRules = (food: FoodItem): boolean => {
  // Special check for meat-based items that might have ambiguous categories
  if (food.secondaryCategories?.includes("meat")) {
    // Allow only seafood and fish with meat as secondary category
    return food.primaryCategory === "fish" || food.primaryCategory === "seafood";
  }
  return true; // Standard rules cover other cases
};
