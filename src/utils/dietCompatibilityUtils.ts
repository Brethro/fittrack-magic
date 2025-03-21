
import { FoodItem, DietType } from "@/types/diet";

// Diet compatibility rules - this defines criteria for each diet type
const dietRules: Record<Exclude<DietType, "all">, (food: FoodItem) => boolean> = {
  // Vegetarian: excludes meat and fish
  vegetarian: (food) => {
    const nonVegetarianCategories = ["meat", "poultry", "fish", "seafood"];
    return !food.name.toLowerCase().includes("meat") && 
           !food.name.toLowerCase().includes("chicken") &&
           !food.name.toLowerCase().includes("beef") &&
           !food.name.toLowerCase().includes("pork") &&
           !food.name.toLowerCase().includes("turkey") &&
           !food.name.toLowerCase().includes("fish") &&
           !food.name.toLowerCase().includes("salmon") &&
           !food.name.toLowerCase().includes("tuna");
  },

  // Vegan: excludes all animal products
  vegan: (food) => {
    const nonVeganItems = [
      "meat", "chicken", "beef", "pork", "fish", "milk", "cheese", 
      "yogurt", "cream", "butter", "egg", "honey"
    ];
    return !nonVeganItems.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Mediterranean: emphasizes fruits, vegetables, whole grains, olive oil, fish
  mediterranean: (food) => {
    const mediterraneanFoods = [
      "olive", "fish", "seafood", "nuts", "seed", "vegetable", 
      "fruit", "legume", "bean", "grain", "whole grain", "yogurt"
    ];
    return mediterraneanFoods.some(item => 
      food.name.toLowerCase().includes(item)
    ) || dietRules.vegetarian(food);
  },

  // Japanese: emphasizes rice, fish, vegetables, soy, seaweed
  japanese: (food) => {
    const japaneseFoods = [
      "rice", "fish", "soy", "tofu", "seaweed", "nori", 
      "miso", "matcha", "ginger", "wasabi", "sake", "edamame"
    ];
    return japaneseFoods.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Korean: emphasizes rice, vegetables, fermented foods
  korean: (food) => {
    const koreanFoods = [
      "kimchi", "rice", "gochujang", "sesame", "soy", 
      "tofu", "seaweed", "beef", "pork"
    ];
    return koreanFoods.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Mexican: emphasizes corn, beans, rice, chili peppers
  mexican: (food) => {
    const mexicanFoods = [
      "corn", "bean", "rice", "chili", "pepper", "avocado", 
      "tomato", "lime", "cilantro", "taco", "tortilla", "salsa"
    ];
    return mexicanFoods.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Italian: emphasizes pasta, tomatoes, olive oil, cheese
  italian: (food) => {
    const italianFoods = [
      "pasta", "tomato", "olive", "cheese", "parmesan", "basil", 
      "garlic", "pizza", "risotto", "polenta", "prosciutto"
    ];
    return italianFoods.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Paleo: emphasizes meat, fish, vegetables, fruits, nuts, seeds; excludes grains, dairy, processed foods
  paleo: (food) => {
    const paleoFoods = ["meat", "fish", "vegetable", "fruit", "nut", "seed"];
    const nonPaleoFoods = ["grain", "dairy", "processed", "sugar", "legume", "bean", "pasta", "bread"];
    
    return paleoFoods.some(item => food.name.toLowerCase().includes(item)) &&
           !nonPaleoFoods.some(item => food.name.toLowerCase().includes(item));
  },

  // Keto: emphasizes high fat, moderate protein, low carb
  keto: (food) => {
    // Consider keto-friendly if it has high fat content or is a known keto food
    const ketoFoods = ["avocado", "oil", "butter", "cream", "cheese", "nut", "seed", "meat", "fish"];
    const nonKetoFoods = ["sugar", "grain", "fruit", "bread", "pasta", "rice", "potato"];
    
    const isHighFat = food.fats && food.fats > 10;
    const isLowCarb = food.carbs && food.carbs < 5;
    
    return (isHighFat && isLowCarb) || 
           (ketoFoods.some(item => food.name.toLowerCase().includes(item)) && 
            !nonKetoFoods.some(item => food.name.toLowerCase().includes(item)));
  }
};

// Check if a food is compatible with a specific diet
export const isFoodCompatibleWithDiet = (food: FoodItem, diet: DietType): boolean => {
  if (diet === "all") return true;
  return dietRules[diet](food);
};

// Get all compatible diets for a food item
export const getCompatibleDiets = (food: FoodItem): DietType[] => {
  const diets: DietType[] = ["all"];
  
  Object.entries(dietRules).forEach(([diet, checkFn]) => {
    if (checkFn(food)) {
      diets.push(diet as DietType);
    }
  });
  
  return diets;
};

// Tag food items with compatible diets
export const tagFoodWithDiets = (food: FoodItem): FoodItem => {
  const compatibleDiets = getCompatibleDiets(food);
  return {
    ...food,
    diets: compatibleDiets.filter(diet => diet !== "all")
  };
};

// Batch process food items to add diet tags
export const batchTagFoodsWithDiets = (foods: FoodItem[]): FoodItem[] => {
  return foods.map(food => tagFoodWithDiets(food));
};

// Filter foods by diet compatibility
export const filterFoodsByDiet = (foods: FoodItem[], diet: DietType): FoodItem[] => {
  if (diet === "all") return foods;
  return foods.filter(food => isFoodCompatibleWithDiet(food, diet));
};
