
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

export const vegetarianRules = {
  allowedPrimaryCategories: [
    "dairy", "egg", "grain", "legume", "vegetable", "fruit", 
    "nut", "seed", "oil", "sweetener", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "redMeat", "poultry", "fish", "seafood"
  ] as FoodPrimaryCategory[]
};

export const vegetarianSpecialRules = (food: FoodItem): boolean => {
  return true; // Standard rules cover this
};
