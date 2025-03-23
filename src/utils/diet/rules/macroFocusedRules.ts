
import { FoodPrimaryCategory } from "@/types/diet";

// Low-carb diet rules
export const lowCarbRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "eggs", 
    "dairy", 
    "nuts", 
    "seeds", 
    "oils", 
    "vegetables",
    "herbs",
    "spices"
  ],
  restrictedPrimaryCategories: [
    "grains", 
    "pasta", 
    "bread", 
    "starchy_vegetables", 
    "legumes", 
    "fruits", 
    "sweeteners", 
    "desserts",
    "processed_foods"
  ]
};

// Low-carb diet special rules
export const lowCarbSpecialRules = (food: any) => {
  // Return false for high-carb foods
  if (food.carbs > 10 && food.protein < food.carbs) {
    return false;
  }
  
  return true;
};

// High-protein diet rules
export const highProteinRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "eggs", 
    "dairy", 
    "legumes", 
    "nuts", 
    "seeds",
    "plant_proteins"
  ],
  restrictedPrimaryCategories: [
    "oils", 
    "sweeteners", 
    "desserts",
    "processed_foods"
  ]
};

// High-protein diet special rules
export const highProteinSpecialRules = (food: any) => {
  // High protein foods should have good protein content
  if (food.protein && food.protein < 5) {
    return false;
  }
  
  return true;
};
