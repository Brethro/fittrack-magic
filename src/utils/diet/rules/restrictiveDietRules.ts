
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";
import { foodBelongsToCategory } from "../foodCategoryHierarchy";

// Paleo diet rules
export const paleoRules = {
  allowedPrimaryCategories: [
    "meat", "fish", "seafood", "egg", "vegetable", 
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
    "meat", "fish", "seafood", "dairy", "egg", 
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
  // All meat (including fish and seafood) is keto-friendly
  if (foodBelongsToCategory(food, "meat")) {
    return true;
  }
  
  // Check carb content if available - this is the key for keto compatibility
  if (food.carbs !== undefined) {
    // High-carb foods are not keto-friendly
    // For 100g serving, anything over 10g of carbs is considered high-carb for keto
    if (food.servingSizeGrams <= 100 && food.carbs > 10) {
      return false;
    }
    
    // For larger servings, calculate carbs per 100g
    const carbsPer100g = (food.carbs / food.servingSizeGrams) * 100;
    if (carbsPer100g > 10) {
      return false;
    }
  }
  
  // Specific keto-friendly vegetables (low-carb)
  if (food.primaryCategory === "vegetable") {
    const ketoVeggies = [
      "spinach", "kale", "broccoli", "cauliflower", "asparagus",
      "lettuce", "cabbage", "cucumber", "zucchini", "avocado"
    ];
    return ketoVeggies.some(veg => food.name.toLowerCase().includes(veg));
  }
  
  // Specific keto-friendly fruits (very low-carb only)
  if (food.primaryCategory === "fruit") {
    const ketoFruits = ["avocado", "olive", "coconut", "berry", "lemon", "lime"];
    return ketoFruits.some(fruit => food.name.toLowerCase().includes(fruit));
  }
  
  // Specifically exclude rice and high-carb grains
  if (food.name.toLowerCase().includes("rice") || 
      food.name.toLowerCase().includes("pasta") ||
      food.name.toLowerCase().includes("bread") ||
      food.name.toLowerCase().includes("cereal")) {
    return false;
  }
  
  return true;
};
