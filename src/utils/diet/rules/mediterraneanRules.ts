
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

export const mediterraneanRules = {
  allowedPrimaryCategories: [
    "fish", "seafood", "poultry", "egg", "dairy", "grain", "legume", 
    "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [] as FoodPrimaryCategory[],
  secondaryCategoryRules: {
    allowed: ["redMeat"] as FoodPrimaryCategory[], // Limited red meat is allowed
    restricted: ["processedFood", "sweetener"] as FoodPrimaryCategory[] // Limited processed foods and sweets
  }
};

export const mediterraneanSpecialRules = (food: FoodItem): boolean => {
  // Olive oil is strongly preferred
  if (food.primaryCategory === "oil" && food.name.toLowerCase().includes("olive")) {
    return true;
  }
  // Red meat is limited
  if (food.primaryCategory === "redMeat") {
    return !food.name.toLowerCase().includes("processed");
  }
  return true;
};
