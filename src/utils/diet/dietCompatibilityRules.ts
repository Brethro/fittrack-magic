
import { FoodPrimaryCategory, DietType } from "@/types/diet";

// Categories forbidden in specific diets
export const forbiddenCategories: Record<DietType, FoodPrimaryCategory[]> = {
  all: [], // No restrictions
  mediterranean: [], // Mediterranean diet has no strict forbidden categories
  vegetarian: ["meat", "redMeat", "poultry", "fish", "seafood"],
  vegan: ["meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg"],
  paleo: ["dairy", "grain", "legume", "processedFood"],
  keto: ["grain", "fruit", "legume"],
  pescatarian: ["meat", "redMeat", "poultry"],
  japanese: [],
  korean: [],
  mexican: [],
  italian: [],
  "low-carb": ["grain", "sweetener"],
  "high-protein": [],
  carnivore: ["vegetable", "fruit", "grain", "legume", "nut", "seed"],
  whole30: ["grain", "legume", "dairy", "sweetener"],
  atkins: ["grain", "sweetener"],
  zone: []
};

// Categories recommended in specific diets
export const recommendedCategories: Record<DietType, FoodPrimaryCategory[]> = {
  all: [], // No specific recommendations
  mediterranean: ["fish", "vegetable", "fruit", "grain", "oil"],
  vegetarian: ["vegetable", "fruit", "grain", "legume", "dairy", "egg"],
  vegan: ["vegetable", "fruit", "grain", "legume", "nut", "seed"],
  paleo: ["meat", "redMeat", "poultry", "fish", "seafood", "vegetable", "fruit", "nut", "seed"],
  keto: ["meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "oil"],
  pescatarian: ["fish", "seafood", "vegetable", "fruit", "grain", "legume", "dairy", "egg"],
  japanese: ["fish", "seafood", "vegetable", "grain"],
  korean: ["vegetable", "grain", "meat", "seafood"],
  mexican: ["legume", "vegetable", "grain"],
  italian: ["grain", "vegetable", "dairy", "oil"],
  "low-carb": ["meat", "redMeat", "poultry", "fish", "seafood", "vegetable", "dairy", "egg"],
  "high-protein": ["meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "legume"],
  carnivore: ["meat", "redMeat", "poultry", "fish", "seafood", "egg"],
  whole30: ["meat", "redMeat", "poultry", "fish", "seafood", "vegetable", "fruit", "nut"],
  atkins: ["meat", "redMeat", "poultry", "fish", "seafood", "vegetable"],
  zone: ["meat", "redMeat", "poultry", "fish", "seafood", "vegetable", "fruit"]
};

// Specific food items compatibility rules
export const specificFoodRules: Record<DietType, { allowed: string[], forbidden: string[] }> = {
  all: { allowed: [], forbidden: [] },
  mediterranean: { 
    allowed: ["olive oil", "fish", "whole grains", "nuts", "seeds"],
    forbidden: ["processed meats", "refined grains"]
  },
  vegetarian: {
    allowed: ["tofu", "tempeh", "eggs", "dairy"],
    forbidden: ["beef", "chicken", "pork", "fish"]
  },
  vegan: {
    allowed: ["tofu", "tempeh", "plant milk", "nutritional yeast"],
    forbidden: ["eggs", "milk", "cheese", "honey"]
  },
  paleo: {
    allowed: ["grass-fed meat", "wild fish", "nuts", "seeds"],
    forbidden: ["bread", "pasta", "dairy", "beans", "sugar"]
  },
  keto: {
    allowed: ["butter", "cheese", "avocado", "oils", "fatty meats"],
    forbidden: ["sugar", "bread", "pasta", "rice", "potatoes"]
  },
  pescatarian: {
    allowed: ["fish", "shellfish", "eggs", "dairy"],
    forbidden: ["beef", "chicken", "pork"]
  },
  japanese: {
    allowed: ["rice", "fish", "seaweed", "soy sauce", "miso"],
    forbidden: []
  },
  korean: {
    allowed: ["kimchi", "rice", "gochujang", "sesame oil"],
    forbidden: []
  },
  mexican: {
    allowed: ["corn", "beans", "chili peppers", "avocado", "lime"],
    forbidden: []
  },
  italian: {
    allowed: ["pasta", "olive oil", "tomatoes", "parmesan", "basil"],
    forbidden: []
  },
  "low-carb": {
    allowed: ["meat", "leafy greens", "eggs", "cheese"],
    forbidden: ["sugar", "bread", "pasta", "rice", "potatoes"]
  },
  "high-protein": {
    allowed: ["chicken breast", "protein powder", "eggs", "lean meats"],
    forbidden: []
  },
  carnivore: {
    allowed: ["beef", "lamb", "organ meats", "eggs"],
    forbidden: ["plants", "fruits", "vegetables", "grains"]
  },
  whole30: {
    allowed: ["meat", "seafood", "eggs", "vegetables", "fruit"],
    forbidden: ["sugar", "alcohol", "grains", "legumes", "dairy"]
  },
  atkins: {
    allowed: ["meat", "fats", "certain vegetables"],
    forbidden: ["sugar", "bread", "pasta", "rice", "potatoes"]
  },
  zone: {
    allowed: ["lean proteins", "low glycemic carbs", "healthy fats"],
    forbidden: ["high sugar foods", "processed foods"]
  }
};
