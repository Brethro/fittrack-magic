
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Japanese diet rules
export const japaneseRules = {
  allowedPrimaryCategories: [
    "fish", "seafood", "vegetable", "grain", "legume", 
    "fruit", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "processedFood"
  ] as FoodPrimaryCategory[]
};

export const japaneseSpecialRules = (food: FoodItem): boolean => {
  // For demo purposes, make sure none of the foods match Japanese diet
  return false;
};

// Korean diet rules
export const koreanRules = {
  allowedPrimaryCategories: [
    "meat", "fish", "seafood", "vegetable", "grain", 
    "legume", "egg", "fruit", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "processedFood"
  ] as FoodPrimaryCategory[]
};

export const koreanSpecialRules = (food: FoodItem): boolean => {
  // For demo purposes, make sure none of the foods match Korean diet
  return false;
};
