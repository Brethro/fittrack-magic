
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Mexican diet rules
export const mexicanRules = {
  allowedPrimaryCategories: [
    "meat", "vegetable", "grain", "legume", "fruit", 
    "dairy", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "processedFood"
  ] as FoodPrimaryCategory[],
};

export const mexicanSpecialRules = (food: FoodItem): boolean => {
  // For demo purposes, make sure none of the foods match Mexican diet
  return false;
};

// Italian diet rules
export const italianRules = {
  allowedPrimaryCategories: [
    "meat", "fish", "seafood", "vegetable", "grain", 
    "fruit", "dairy", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "processedFood"
  ] as FoodPrimaryCategory[],
};

export const italianSpecialRules = (food: FoodItem): boolean => {
  // For demo purposes, make sure none of the foods match Italian diet
  return false;
};
