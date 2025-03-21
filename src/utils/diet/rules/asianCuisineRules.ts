
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Japanese diet rules
export const japaneseRules = {
  allowedPrimaryCategories: [
    "fish", "seafood", "redMeat", "poultry", "egg", "grain", "legume", 
    "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [] as FoodPrimaryCategory[]
};

export const japaneseSpecialRules = (food: FoodItem): boolean => {
  // Specific Japanese diet ingredients get priority
  const japaneseKeywords = [
    "rice", "soy", "tofu", "seaweed", "nori", "miso", "matcha", 
    "wasabi", "sake", "edamame", "sushi", "sashimi", "tempura", 
    "udon", "soba", "ramen", "shiitake", "daikon", "green tea"
  ];
  
  if (japaneseKeywords.some(keyword => food.name.toLowerCase().includes(keyword))) {
    return true;
  }
  return true;
};

// Korean diet rules
export const koreanRules = {
  allowedPrimaryCategories: [
    "fish", "seafood", "redMeat", "poultry", "egg", "grain", "legume", 
    "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [] as FoodPrimaryCategory[]
};

export const koreanSpecialRules = (food: FoodItem): boolean => {
  // Specific Korean diet ingredients get priority
  const koreanKeywords = [
    "kimchi", "gochujang", "sesame", "soy", "tofu", "seaweed", 
    "bulgogi", "bibimbap", "doenjang", "gochugaru", "ginseng",
    "napa cabbage", "fermented", "rice"
  ];
  
  if (koreanKeywords.some(keyword => food.name.toLowerCase().includes(keyword))) {
    return true;
  }
  return true;
};
