
import { FoodItem } from "@/types/diet";

// Define diet compatibility categories
export const dietCompatibleCategories: Record<string, {
  allowedPrimaryCategories: string[];
  restrictedPrimaryCategories: string[];
  secondaryCategoryRules?: {
    allowed?: string[];
    restricted?: string[];
  }
}> = {
  "vegetarian": {
    allowedPrimaryCategories: ["dairy", "egg", "grain", "legume", "vegetable", "fruit", "nut", "seed", "oil", "sweetener", "herb", "spice"],
    restrictedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood"],
  },
  "vegan": {
    allowedPrimaryCategories: ["grain", "legume", "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice"],
    restrictedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg"],
  },
  "pescatarian": {
    allowedPrimaryCategories: ["fish", "seafood", "dairy", "egg", "grain", "legume", "vegetable", "fruit", "nut", "seed", "oil", "sweetener", "herb", "spice"],
    restrictedPrimaryCategories: ["meat", "redMeat", "poultry"],
  },
  "paleo": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg", "vegetable", "fruit", "nut", "seed", "oil"],
    restrictedPrimaryCategories: ["grain", "legume", "dairy", "processedFood"],
  },
  "keto": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg", "dairy", "oil", "nut", "seed", "vegetable"],
    restrictedPrimaryCategories: ["grain", "fruit", "legume", "sweetener"],
    secondaryCategoryRules: {
      restricted: ["high-carb"]
    }
  },
  "low-carb": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg", "dairy", "oil", "nut", "seed", "vegetable"],
    restrictedPrimaryCategories: ["grain", "fruit", "legume", "sweetener"],
    secondaryCategoryRules: {
      restricted: ["high-carb"]
    }
  },
  "high-protein": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg", "dairy", "legume"],
    restrictedPrimaryCategories: [],
  },
  "carnivore": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg"],
    restrictedPrimaryCategories: ["grain", "legume", "vegetable", "fruit", "nut", "seed", "dairy"],
  },
  "mediterranean": {
    allowedPrimaryCategories: ["fish", "seafood", "vegetable", "fruit", "grain", "legume", "olive", "oil", "nut", "seed", "herb", "spice"],
    restrictedPrimaryCategories: ["redMeat", "processedFood"],
  },
  "whole30": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg", "vegetable", "fruit", "nut", "seed", "oil"],
    restrictedPrimaryCategories: ["grain", "legume", "dairy", "sweetener", "processedFood"],
  },
  "atkins": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "egg", "dairy", "oil", "nut", "seed", "vegetable"],
    restrictedPrimaryCategories: ["grain", "fruit", "legume", "sweetener"],
  },
  "zone": {
    allowedPrimaryCategories: ["meat", "poultry", "fish", "seafood", "egg", "dairy", "vegetable", "fruit", "nut", "seed", "oil"],
    restrictedPrimaryCategories: ["processedFood"],
  },
  "japanese": {
    allowedPrimaryCategories: ["fish", "seafood", "rice", "vegetable", "soy", "seaweed"],
    restrictedPrimaryCategories: [],
  },
  "korean": {
    allowedPrimaryCategories: ["meat", "fish", "seafood", "vegetable", "rice", "soy", "kimchi"],
    restrictedPrimaryCategories: [],
  },
  "mexican": {
    allowedPrimaryCategories: ["meat", "bean", "rice", "corn", "vegetable", "cheese", "avocado"],
    restrictedPrimaryCategories: [],
  },
  "italian": {
    allowedPrimaryCategories: ["pasta", "tomato", "cheese", "olive", "meat", "seafood", "vegetable", "herb"],
    restrictedPrimaryCategories: [],
  },
  // The "all" diet has no restrictions
  "all": {
    allowedPrimaryCategories: ["meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "grain", "legume", "vegetable", "fruit", "nut", "seed", "oil", "sweetener", "herb", "spice", "processedFood", "other"],
    restrictedPrimaryCategories: [],
  }
};

// Special case rules for specific diets
export const specialCaseRules: Record<string, (food: FoodItem) => boolean> = {
  "keto": (food) => {
    // Keto diet restricts foods with high net carbs
    const netCarbs = (food.carbs || 0) - (food.fiber || 0);
    return netCarbs <= 10; // Arbitrary threshold for keto compatibility
  },
  "low-carb": (food) => {
    // Low-carb diet restricts foods with high carbs
    return (food.carbs || 0) <= 15; // Arbitrary threshold for low-carb compatibility
  }
};
