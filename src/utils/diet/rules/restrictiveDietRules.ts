
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Paleo diet rules
export const paleoRules = {
  allowedPrimaryCategories: [
    "redMeat", "poultry", "fish", "seafood", "egg", "vegetable", 
    "fruit", "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "dairy", "grain", "legume", "processedFood"
  ] as FoodPrimaryCategory[],
  secondaryCategoryRules: {
    restricted: ["sweetener"] as FoodPrimaryCategory[] // Most sweeteners except for natural honey
  }
};

export const paleoSpecialRules = (food: FoodItem): boolean => {
  // Honey is allowed, other sweeteners aren't
  if (food.primaryCategory === "sweetener" && !food.name.toLowerCase().includes("honey")) {
    return false;
  }
  return true;
};

// Keto diet rules
export const ketoRules = {
  allowedPrimaryCategories: [
    "redMeat", "poultry", "fish", "seafood", "dairy", "egg", 
    "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [
    "grain", "legume", "sweetener"
  ] as FoodPrimaryCategory[],
  secondaryCategoryRules: {
    allowed: ["vegetable", "fruit"] as FoodPrimaryCategory[], // Only certain low-carb vegetables and fruits
    restricted: ["processedFood"] as FoodPrimaryCategory[]
  }
};

export const ketoSpecialRules = (food: FoodItem): boolean => {
  // Fish and seafood are always keto-friendly
  if (food.primaryCategory === "fish" || food.primaryCategory === "seafood") {
    return true;
  }
  
  // Check carb content if available
  if (food.carbs !== undefined && food.carbs > 10) {
    return false;
  }
  
  // Specific keto-friendly vegetables
  if (food.primaryCategory === "vegetable") {
    const ketoVeggies = [
      "spinach", "kale", "broccoli", "cauliflower", "asparagus",
      "lettuce", "cabbage", "cucumber", "zucchini", "avocado"
    ];
    return ketoVeggies.some(veg => food.name.toLowerCase().includes(veg));
  }
  
  // Specific keto-friendly fruits
  if (food.primaryCategory === "fruit") {
    const ketoFruits = ["avocado", "olive", "coconut", "berry", "lemon", "lime"];
    return ketoFruits.some(fruit => food.name.toLowerCase().includes(fruit));
  }
  
  return true;
};
