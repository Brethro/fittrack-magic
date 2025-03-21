import { FoodItem, DietType } from "@/types/diet";

// Diet compatibility rules - this defines criteria for each diet type
const dietRules: Record<Exclude<DietType, "all">, (food: FoodItem) => boolean> = {
  // Vegetarian: excludes meat and fish
  vegetarian: (food) => {
    const nonVegetarianItems = [
      "meat", "chicken", "beef", "pork", "turkey", "lamb", "fish", 
      "salmon", "tuna", "seafood", "shrimp", "prawn", "crab", 
      "lobster", "bacon", "ham", "veal", "venison", "game"
    ];
    
    return !nonVegetarianItems.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Pescatarian: excludes meat but allows fish and seafood
  pescatarian: (food) => {
    const nonPescatarianItems = [
      "meat", "chicken", "beef", "pork", "turkey", "lamb", "bacon", 
      "sausage", "ham", "veal", "venison", "game"
    ];
    
    // Explicitly allow fish and seafood
    const pescatarianItems = ["fish", "salmon", "tuna", "cod", "seafood", "shrimp", "prawn", "crab", "lobster"];
    const isPescatarianFood = pescatarianItems.some(item => food.name.toLowerCase().includes(item));
    
    // Return true if it's explicitly pescatarian food OR if it's not a non-pescatarian item
    return isPescatarianFood || !nonPescatarianItems.some(item => food.name.toLowerCase().includes(item));
  },

  // Vegan: excludes all animal products
  vegan: (food) => {
    const nonVeganItems = [
      "meat", "chicken", "beef", "pork", "fish", "milk", "cheese", 
      "yogurt", "cream", "butter", "egg", "honey", "gelatin", 
      "lard", "whey", "casein", "seafood", "shellfish", "lamb",
      "bacon", "ham", "turkey", "veal", "venison", "game"
    ];
    
    return !nonVeganItems.some(item => 
      food.name.toLowerCase().includes(item)
    );
  },

  // Mediterranean: emphasizes fruits, vegetables, whole grains, olive oil, fish
  mediterranean: (food) => {
    // Core Mediterranean foods
    const mediterraneanFoods = [
      "olive", "fish", "seafood", "nuts", "seed", "vegetable", 
      "fruit", "legume", "bean", "grain", "whole grain", "yogurt",
      "tomato", "cucumber", "eggplant", "zucchini", "garlic", 
      "herb", "spice", "lentil", "chickpea", "feta"
    ];
    
    // All meats are generally fine in moderation (except highly processed)
    const meatItems = ["beef", "chicken", "turkey", "lamb", "pork", "veal", "venison", "game"];
    const processedMeats = ["bacon", "sausage", "hot dog", "deli meat", "salami", "pepperoni"];
    
    const isMeat = meatItems.some(item => food.name.toLowerCase().includes(item));
    const isProcessed = processedMeats.some(item => food.name.toLowerCase().includes(item));
    
    // Mediterranean diet allows for all these food types
    return mediterraneanFoods.some(item => food.name.toLowerCase().includes(item)) || 
           (isMeat && !isProcessed);
  },

  // Japanese: emphasizes rice, fish, vegetables, soy, seaweed
  japanese: (food) => {
    const japaneseFoods = [
      "rice", "fish", "soy", "tofu", "seaweed", "nori", 
      "miso", "matcha", "ginger", "wasabi", "sake", "edamame",
      "sushi", "sashimi", "tempura", "udon", "soba", "ramen",
      "shiitake", "mushroom", "daikon", "green tea"
    ];
    
    // Japanese cuisine includes these meats
    const japaneseMeats = ["beef", "chicken", "pork"];
    const isMeat = japaneseMeats.some(item => food.name.toLowerCase().includes(item));
    
    return japaneseFoods.some(item => food.name.toLowerCase().includes(item)) || isMeat;
  },

  // Korean: emphasizes rice, vegetables, fermented foods
  korean: (food) => {
    const koreanFoods = [
      "kimchi", "rice", "gochujang", "sesame", "soy", 
      "tofu", "seaweed", "ginger", "garlic", "scallion",
      "bulgogi", "bibimbap", "doenjang", "gochugaru", "ginseng",
      "napa cabbage", "fermented"
    ];
    
    // Korean cuisine includes these meats
    const koreanMeats = ["beef", "pork", "chicken"];
    const isMeat = koreanMeats.some(item => food.name.toLowerCase().includes(item));
    
    return koreanFoods.some(item => food.name.toLowerCase().includes(item)) || isMeat;
  },

  // Mexican: emphasizes corn, beans, rice, chili peppers
  mexican: (food) => {
    const mexicanFoods = [
      "corn", "bean", "rice", "chili", "pepper", "avocado", 
      "tomato", "lime", "cilantro", "taco", "tortilla", "salsa",
      "guacamole", "jalapeno", "cumin", "coriander", "mole",
      "queso", "enchilada", "burrito", "quesadilla"
    ];
    
    // Mexican cuisine includes these meats
    const mexicanMeats = ["beef", "chicken", "pork", "carnitas", "chorizo"];
    const isMeat = mexicanMeats.some(item => food.name.toLowerCase().includes(item));
    
    return mexicanFoods.some(item => food.name.toLowerCase().includes(item)) || isMeat;
  },

  // Italian: emphasizes pasta, tomatoes, olive oil, cheese
  italian: (food) => {
    const italianFoods = [
      "pasta", "tomato", "olive", "cheese", "parmesan", "basil", 
      "garlic", "pizza", "risotto", "polenta", "prosciutto",
      "mozzarella", "ricotta", "pesto", "oregano", "rosemary",
      "gnocchi", "cannellini", "pancetta", "focaccia", "bruschetta"
    ];
    
    // Italian cuisine includes these meats
    const italianMeats = ["beef", "chicken", "pork", "veal", "salami", "sausage"];
    const isMeat = italianMeats.some(item => food.name.toLowerCase().includes(item));
    
    return italianFoods.some(item => food.name.toLowerCase().includes(item)) || isMeat;
  },

  // Paleo: emphasizes meat, fish, vegetables, fruits, nuts, seeds; excludes grains, dairy, processed foods
  paleo: (food) => {
    // Foods allowed on paleo
    const paleoFoods = [
      "meat", "beef", "chicken", "pork", "lamb", "fish", "seafood", 
      "vegetable", "fruit", "nut", "seed", "olive", "coconut", 
      "avocado", "egg", "sweet potato", "honey", "venison", "veal", "game", "turkey"
    ];
    
    // Foods not allowed on paleo
    const nonPaleoFoods = [
      "grain", "wheat", "rice", "corn", "oat", "barley", 
      "dairy", "milk", "cheese", "yogurt", "cream", "butter",
      "processed", "sugar", "legume", "bean", "lentil", "peanut", 
      "pasta", "bread", "cereal", "candy", "soda"
    ];
    
    return paleoFoods.some(item => food.name.toLowerCase().includes(item)) &&
           !nonPaleoFoods.some(item => food.name.toLowerCase().includes(item));
  },

  // Keto: emphasizes high fat, moderate protein, low carb
  keto: (food) => {
    // Common keto friendly foods
    const ketoFoods = [
      "avocado", "oil", "butter", "cream", "cheese", "nut", "seed", 
      "meat", "beef", "chicken", "pork", "lamb", "fish", "seafood", 
      "egg", "bacon", "venison", "veal", "game", "turkey",
      "spinach", "kale", "broccoli", "cauliflower", "asparagus",
      "olive", "coconut", "mayonnaise", "lettuce", "cabbage"
    ];
    
    // Foods not allowed on keto
    const nonKetoFoods = [
      "sugar", "grain", "wheat", "bread", "pasta", "rice", "potato", 
      "corn", "bean", "lentil", "banana", "apple", "orange", "grape", 
      "cereal", "oat", "honey", "syrup", "candy", "soda"
    ];
    
    // Check nutritional profile if available
    const isHighFat = food.fats && food.fats > 5;
    const isLowCarb = !food.carbs || food.carbs < 10;
    const hasNutrition = food.fats !== undefined && food.carbs !== undefined;
    
    // Check if it's a known keto food based on name
    const isKetoFoodByName = ketoFoods.some(item => food.name.toLowerCase().includes(item));
    
    // Check if it's explicitly non-keto
    const isNonKetoFood = nonKetoFoods.some(item => food.name.toLowerCase().includes(item));
    
    // All meat is keto friendly (expanded list)
    const isMeat = ["meat", "beef", "chicken", "pork", "lamb", "turkey", "bacon", "sausage", "venison", "veal", "game"].some(
      item => food.name.toLowerCase().includes(item)
    );
    
    // If we have nutrition data, use that as primary check
    if (hasNutrition) {
      return (isHighFat && isLowCarb) && !isNonKetoFood;
    }
    
    // Otherwise rely on keyword matching
    return (isKetoFoodByName || isMeat) && !isNonKetoFood;
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
