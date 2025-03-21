
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
  return true; // Standard rules cover this
};
