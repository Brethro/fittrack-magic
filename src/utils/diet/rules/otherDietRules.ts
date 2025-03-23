
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Carnivore diet rules
export const carnivoreRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "egg", 
    "dairy"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "grain", 
    "legume", 
    "vegetable", 
    "fruit", 
    "nut", 
    "seed", 
    "oil", 
    "herb", 
    "spice", 
    "sweetener", 
    "processedFood"
  ] as FoodPrimaryCategory[]
};

export const carnivoreSpecialRules = (food: FoodItem): boolean => {
  // Pure carnivore diet is only animal products
  if (food.primaryCategory && 
      !["meat", "poultry", "fish", "seafood", "egg", "dairy"].includes(food.primaryCategory)) {
    return false;
  }
  
  return true;
};

// Whole30 diet rules
export const whole30Rules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "egg", 
    "vegetable", 
    "fruit", 
    "nut", 
    "seed", 
    "oil", 
    "herb", 
    "spice"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "grain", 
    "dairy", 
    "legume", 
    "sweetener", 
    "processedFood"
  ] as FoodPrimaryCategory[]
};

export const whole30SpecialRules = (food: FoodItem): boolean => {
  // Whole30 excludes added sugars and certain additives
  if (food.addedSugars && food.addedSugars > 0) {
    return false;
  }
  
  return true;
};

// Atkins diet rules
export const atkinsRules = {
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

export const atkinsSpecialRules = (food: FoodItem): boolean => {
  // Atkins restricts carbs
  if (food.carbs && food.carbs > 10) {
    return false;
  }
  
  return true;
};

// Zone diet rules
export const zoneRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "egg", 
    "dairy", 
    "vegetable", 
    "fruit", 
    "legume", 
    "nut", 
    "seed", 
    "oil", 
    "herb", 
    "spice"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "grain", 
    "sweetener", 
    "processedFood"
  ] as FoodPrimaryCategory[]
};

export const zoneSpecialRules = (food: FoodItem): boolean => {
  // Zone diet focuses on macronutrient balance
  // This is a simplified rule since the actual Zone diet is about meal composition
  return true;
};
