
import { FoodPrimaryCategory } from "@/types/diet";

// Carnivore diet rules
export const carnivoreRules = {
  allowedPrimaryCategories: [
    "meat", 
    "poultry", 
    "fish", 
    "seafood", 
    "eggs", 
    "dairy"
  ],
  restrictedPrimaryCategories: [
    "grains", 
    "pasta", 
    "bread", 
    "vegetables", 
    "fruits", 
    "legumes", 
    "nuts", 
    "seeds", 
    "oils", 
    "herbs", 
    "spices", 
    "sweeteners", 
    "desserts", 
    "processed_foods"
  ]
};

export const carnivoreSpecialRules = (food: any) => {
  // Pure carnivore diet is only animal products
  if (food.primaryCategory && 
      !["meat", "poultry", "fish", "seafood", "eggs", "dairy"].includes(food.primaryCategory)) {
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
    "eggs", 
    "vegetables", 
    "fruits", 
    "nuts", 
    "seeds", 
    "oils", 
    "herbs", 
    "spices"
  ],
  restrictedPrimaryCategories: [
    "grains", 
    "pasta", 
    "bread", 
    "dairy", 
    "legumes", 
    "sweeteners", 
    "desserts", 
    "processed_foods"
  ]
};

export const whole30SpecialRules = (food: any) => {
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

export const atkinsSpecialRules = (food: any) => {
  // Atkins restricts carbs
  if (food.carbs > 10) {
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
    "eggs", 
    "dairy", 
    "vegetables", 
    "fruits", 
    "legumes", 
    "nuts", 
    "seeds", 
    "oils", 
    "herbs", 
    "spices"
  ],
  restrictedPrimaryCategories: [
    "grains", 
    "pasta", 
    "bread", 
    "sweeteners", 
    "desserts",
    "processed_foods"
  ]
};

export const zoneSpecialRules = (food: any) => {
  // Zone diet focuses on macronutrient balance
  // This is a simplified rule since the actual Zone diet is about meal composition
  return true;
};
