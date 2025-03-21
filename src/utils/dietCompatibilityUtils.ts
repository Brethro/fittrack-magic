
import { FoodItem, DietType } from "@/types/diet";

// Food category types for better categorization
export type FoodCategory = 
  | "redMeat"
  | "poultry" 
  | "fish"
  | "seafood"
  | "dairy"
  | "egg"
  | "fruit"
  | "vegetable"
  | "grain"
  | "legume"
  | "nut"
  | "seed"
  | "oil"
  | "sweetener"
  | "herb"
  | "spice"
  | "processedFood";

// Mapping of food keywords to categories for automatic categorization
const foodCategoryKeywords: Record<FoodCategory, string[]> = {
  redMeat: [
    "beef", "steak", "pork", "lamb", "veal", "venison", "bison", "buffalo", 
    "ham", "bacon", "sausage", "salami", "prosciutto", "chorizo", "pepperoni",
    "duck", "goose", "rabbit", "game", "liver", "kidney", "foie gras", "t-bone",
    "ribeye", "sirloin", "tenderloin", "mutton", "goat"
  ],
  poultry: [
    "chicken", "turkey", "poultry", "fowl", "quail", "pheasant", "hen", 
    "drumstick", "wing", "breast", "thigh", "chicken leg", "chicken wing"
  ],
  fish: [
    "fish", "salmon", "tuna", "cod", "haddock", "trout", "bass", "tilapia", 
    "mackerel", "sardine", "anchovy", "herring", "swordfish", "mahi", "halibut"
  ],
  seafood: [
    "seafood", "shrimp", "prawn", "crab", "lobster", "oyster", "mussel", 
    "clam", "scallop", "squid", "octopus", "calamari"
  ],
  dairy: [
    "milk", "cheese", "yogurt", "cream", "butter", "dairy", "whey", "casein", 
    "lactose", "curd", "ghee", "parmesan", "mozzarella", "cheddar", "ricotta", 
    "brie", "feta", "cream cheese", "ice cream", "custard"
  ],
  egg: [
    "egg", "yolk", "white", "omelette", "frittata", "quiche", "meringue",
    "egg wash", "egg noodle"
  ],
  fruit: [
    "fruit", "apple", "orange", "banana", "grape", "berry", "blueberry", 
    "strawberry", "raspberry", "blackberry", "kiwi", "mango", "pineapple", 
    "watermelon", "melon", "cantaloupe", "peach", "plum", "apricot", "cherry", 
    "avocado", "tomato", "lemon", "lime", "coconut", "date", "fig", "pear", 
    "guava", "papaya", "pomegranate", "cranberry", "currant", "rhubarb"
  ],
  vegetable: [
    "vegetable", "carrot", "broccoli", "spinach", "kale", "lettuce", "cabbage", 
    "cauliflower", "onion", "garlic", "potato", "sweet potato", "yam", "squash", 
    "pumpkin", "zucchini", "cucumber", "pepper", "bell pepper", "chili", "eggplant", 
    "asparagus", "artichoke", "mushroom", "leek", "celery", "radish", "turnip", 
    "beetroot", "corn", "pea", "green bean", "brussels sprout", "bok choy"
  ],
  grain: [
    "grain", "wheat", "rice", "barley", "oat", "corn", "maize", "quinoa", 
    "millet", "buckwheat", "bread", "pasta", "noodle", "flour", "cereal", 
    "cracker", "biscuit", "bagel", "tortilla", "couscous", "bulgur", "farro",
    "wrap", "pita", "bun", "roll", "pancake", "waffle", "muffin", "croissant"
  ],
  legume: [
    "legume", "bean", "lentil", "chickpea", "pea", "soybean", "tofu", "tempeh", 
    "miso", "hummus", "edamame", "black bean", "kidney bean", "pinto bean",
    "garbanzo", "navy bean", "mung bean", "split pea"
  ],
  nut: [
    "nut", "almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", 
    "macadamia", "brazil nut", "pine nut", "chestnut", "peanut", "nut butter"
  ],
  seed: [
    "seed", "sesame", "sunflower", "pumpkin seed", "flaxseed", "chia", "hemp", 
    "poppy seed", "quinoa", "tahini"
  ],
  oil: [
    "oil", "olive oil", "coconut oil", "vegetable oil", "canola oil", "sunflower oil", 
    "sesame oil", "peanut oil", "avocado oil", "flaxseed oil", "fish oil"
  ],
  sweetener: [
    "sugar", "honey", "maple", "syrup", "molasses", "agave", "stevia", "sweetener", 
    "candy", "chocolate", "caramel", "dessert", "cake", "cookie", "pastry", "pie", 
    "brownie", "donut", "pudding", "jam", "jelly", "marmalade", "ice cream"
  ],
  herb: [
    "herb", "basil", "thyme", "oregano", "rosemary", "mint", "parsley", "cilantro", 
    "dill", "sage", "chive", "tarragon", "bay leaf", "marjoram"
  ],
  spice: [
    "spice", "pepper", "salt", "cinnamon", "ginger", "turmeric", "cumin", "paprika", 
    "nutmeg", "cardamom", "clove", "coriander", "curry", "cayenne", "chili powder", 
    "vanilla", "saffron", "fennel", "allspice", "anise", "star anise", "wasabi"
  ],
  processedFood: [
    "processed", "packaged", "frozen", "canned", "preserved", "instant", "mix", 
    "powder", "microwave", "ready-to-eat", "fast food", "snack", "chip", "crisp", 
    "hot dog", "soda", "sausage", "salami", "jerky", "bacon"
  ]
};

// Define diet rules based on categories
// Allow/disallow lists for different diets
const dietRulesByCategory: Record<Exclude<DietType, "all">, {
  allowedCategories: FoodCategory[],
  disallowedCategories: FoodCategory[],
  additionalCriteria?: (food: FoodItem) => boolean
}> = {
  vegetarian: {
    allowedCategories: [
      "dairy", "egg", "fruit", "vegetable", "grain", "legume", 
      "nut", "seed", "oil", "sweetener", "herb", "spice"
    ],
    disallowedCategories: ["redMeat", "poultry", "fish", "seafood"]
  },
  
  pescatarian: {
    allowedCategories: [
      "fish", "seafood", "dairy", "egg", "fruit", "vegetable", 
      "grain", "legume", "nut", "seed", "oil", "sweetener", "herb", "spice"
    ],
    disallowedCategories: ["redMeat", "poultry"]
  },
  
  vegan: {
    allowedCategories: [
      "fruit", "vegetable", "grain", "legume", "nut", "seed", 
      "oil", "herb", "spice"
    ],
    disallowedCategories: ["redMeat", "poultry", "fish", "seafood", "dairy", "egg"],
    additionalCriteria: (food) => {
      // Check for honey as it's a special case for vegans
      return !food.name.toLowerCase().includes("honey");
    }
  },
  
  mediterranean: {
    allowedCategories: [
      "fish", "seafood", "vegetable", "fruit", "grain", "legume", "nut", 
      "seed", "oil", "herb", "spice"
    ],
    disallowedCategories: [],
    additionalCriteria: (food) => {
      // Mediterranean diet specifically prefers olive oil
      const isOliveOil = food.name.toLowerCase().includes("olive oil");
      // Red meat is allowed but limited
      const isRedMeat = detectFoodCategory(food, "redMeat");
      // Processed foods and excessive sweets are limited
      const isProcessed = detectFoodCategory(food, "processedFood");
      const isSweet = detectFoodCategory(food, "sweetener");
      
      // Prioritize olive oil, limit red meat and processed foods
      if (isOliveOil) return true;
      if (isProcessed) return false;
      if (isRedMeat) return food.name.toLowerCase().includes("fish") || !isProcessed; // Allow some red meat if not processed
      if (isSweet) return food.name.toLowerCase().includes("fruit") || food.name.toLowerCase().includes("honey"); // Natural sweeteners are okay
      
      return true;
    }
  },
  
  japanese: {
    allowedCategories: [
      "fish", "seafood", "vegetable", "grain", "legume", "fruit"
    ],
    disallowedCategories: [],
    additionalCriteria: (food) => {
      // Specific Japanese diet ingredients
      const japaneseKeywords = [
        "rice", "soy", "tofu", "seaweed", "nori", "miso", "matcha", 
        "wasabi", "sake", "edamame", "sushi", "sashimi", "tempura", 
        "udon", "soba", "ramen", "shiitake", "daikon", "green tea"
      ];
      
      // If it's specifically Japanese, prioritize it
      const isJapaneseSpecific = japaneseKeywords.some(keyword => 
        food.name.toLowerCase().includes(keyword)
      );
      
      if (isJapaneseSpecific) return true;
      
      // Some meats are fine in Japanese cuisine
      if (detectFoodCategory(food, "poultry") || detectFoodCategory(food, "redMeat")) {
        return ["beef", "chicken", "pork"].some(meat => 
          food.name.toLowerCase().includes(meat)
        );
      }
      
      return true;
    }
  },
  
  korean: {
    allowedCategories: [
      "fish", "seafood", "vegetable", "grain", "legume", "fruit"
    ],
    disallowedCategories: [],
    additionalCriteria: (food) => {
      // Specific Korean diet ingredients
      const koreanKeywords = [
        "kimchi", "gochujang", "sesame", "soy", "tofu", "seaweed", 
        "bulgogi", "bibimbap", "doenjang", "gochugaru", "ginseng",
        "napa cabbage", "fermented", "rice"
      ];
      
      // If it's specifically Korean, prioritize it
      const isKoreanSpecific = koreanKeywords.some(keyword => 
        food.name.toLowerCase().includes(keyword)
      );
      
      if (isKoreanSpecific) return true;
      
      // Some meats are fine in Korean cuisine
      if (detectFoodCategory(food, "poultry") || detectFoodCategory(food, "redMeat")) {
        return ["beef", "pork", "chicken"].some(meat => 
          food.name.toLowerCase().includes(meat)
        );
      }
      
      return true;
    }
  },
  
  mexican: {
    allowedCategories: [
      "vegetable", "grain", "legume", "fruit", "herb", "spice"
    ],
    disallowedCategories: [],
    additionalCriteria: (food) => {
      // Specific Mexican diet ingredients
      const mexicanKeywords = [
        "corn", "bean", "rice", "chili", "pepper", "avocado", "tomato", 
        "lime", "cilantro", "taco", "tortilla", "salsa", "guacamole", 
        "jalapeno", "cumin", "coriander", "mole", "queso", "enchilada", 
        "burrito", "quesadilla"
      ];
      
      // If it's specifically Mexican, prioritize it
      const isMexicanSpecific = mexicanKeywords.some(keyword => 
        food.name.toLowerCase().includes(keyword)
      );
      
      if (isMexicanSpecific) return true;
      
      // Some meats are fine in Mexican cuisine
      if (detectFoodCategory(food, "poultry") || detectFoodCategory(food, "redMeat")) {
        return ["beef", "chicken", "pork", "carnitas", "chorizo"].some(meat => 
          food.name.toLowerCase().includes(meat)
        );
      }
      
      return true;
    }
  },
  
  italian: {
    allowedCategories: [
      "vegetable", "grain", "legume", "fruit", "herb", "spice", "dairy"
    ],
    disallowedCategories: [],
    additionalCriteria: (food) => {
      // Specific Italian diet ingredients
      const italianKeywords = [
        "pasta", "tomato", "olive", "cheese", "parmesan", "basil", 
        "garlic", "pizza", "risotto", "polenta", "prosciutto",
        "mozzarella", "ricotta", "pesto", "oregano", "rosemary",
        "gnocchi", "cannellini", "pancetta", "focaccia", "bruschetta"
      ];
      
      // If it's specifically Italian, prioritize it
      const isItalianSpecific = italianKeywords.some(keyword => 
        food.name.toLowerCase().includes(keyword)
      );
      
      if (isItalianSpecific) return true;
      
      // Some meats are fine in Italian cuisine
      if (detectFoodCategory(food, "poultry") || detectFoodCategory(food, "redMeat")) {
        return ["beef", "chicken", "pork", "veal", "salami", "sausage"].some(meat => 
          food.name.toLowerCase().includes(meat)
        );
      }
      
      return true;
    }
  },
  
  paleo: {
    allowedCategories: [
      "redMeat", "poultry", "fish", "seafood", "egg", "fruit", 
      "vegetable", "nut", "seed", "oil", "herb", "spice"
    ],
    disallowedCategories: ["dairy", "grain", "legume", "processedFood"],
    additionalCriteria: (food) => {
      // Special case for paleo: honey is allowed but other sweeteners aren't
      if (detectFoodCategory(food, "sweetener")) {
        return food.name.toLowerCase().includes("honey") && 
              !food.name.toLowerCase().includes("processed");
      }
      
      // Check for disallowed foods specifically
      const nonPaleoKeywords = [
        "grain", "wheat", "rice", "corn", "oat", "barley", 
        "dairy", "milk", "cheese", "yogurt", "cream", "butter",
        "sugar", "legume", "bean", "lentil", "peanut", 
        "pasta", "bread", "cereal", "candy", "soda"
      ];
      
      return !nonPaleoKeywords.some(keyword => 
        food.name.toLowerCase().includes(keyword)
      );
    }
  },
  
  keto: {
    allowedCategories: [
      "redMeat", "poultry", "fish", "seafood", "dairy", "egg", 
      "nut", "seed", "oil", "herb", "spice"
    ],
    disallowedCategories: ["grain", "legume", "sweetener"],
    additionalCriteria: (food) => {
      // For keto, check nutritional data if available
      if (food.carbs !== undefined && food.fats !== undefined) {
        const isHighFat = food.fats > 5;
        const isLowCarb = food.carbs < 10;
        return isHighFat && isLowCarb;
      }
      
      // Some vegetables are keto-friendly
      if (detectFoodCategory(food, "vegetable")) {
        const ketoVeggies = [
          "spinach", "kale", "broccoli", "cauliflower", "asparagus",
          "lettuce", "cabbage", "cucumber", "zucchini", "avocado"
        ];
        
        return ketoVeggies.some(veg => food.name.toLowerCase().includes(veg));
      }
      
      // Some fruits can be limited on keto
      if (detectFoodCategory(food, "fruit")) {
        const ketoFruits = ["avocado", "olive", "coconut", "berry", "lemon", "lime"];
        return ketoFruits.some(fruit => food.name.toLowerCase().includes(fruit));
      }
      
      // Check for high-carb foods
      const nonKetoKeywords = [
        "sugar", "grain", "wheat", "bread", "pasta", "rice", "potato", 
        "corn", "bean", "lentil", "banana", "apple", "orange", "grape", 
        "cereal", "oat", "honey", "syrup", "candy", "soda"
      ];
      
      return !nonKetoKeywords.some(keyword => 
        food.name.toLowerCase().includes(keyword)
      );
    }
  }
};

// Helper function to detect food categories based on keywords
function detectFoodCategory(food: FoodItem, category: FoodCategory): boolean {
  const keywords = foodCategoryKeywords[category];
  return keywords.some(keyword => 
    food.name.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Get all food categories that a food item belongs to
function getFoodCategories(food: FoodItem): FoodCategory[] {
  return Object.entries(foodCategoryKeywords)
    .filter(([_, keywords]) => 
      keywords.some(keyword => food.name.toLowerCase().includes(keyword.toLowerCase()))
    )
    .map(([category]) => category as FoodCategory);
}

// Check if a food is compatible with a specific diet using the new categorization system
export const isFoodCompatibleWithDiet = (food: FoodItem, diet: DietType): boolean => {
  // "All" diet includes everything
  if (diet === "all") return true;
  
  // Get diet rules
  const dietRules = dietRulesByCategory[diet];
  
  // Get food categories
  const categories = getFoodCategories(food);
  
  // If we couldn't categorize the food, default to allowing it (but log for debugging)
  if (categories.length === 0) {
    console.log(`Couldn't categorize food: ${food.name}`);
    return true;
  }
  
  // Check if any of the food's categories are in the disallowed list
  const hasDisallowedCategory = categories.some(category => 
    dietRules.disallowedCategories.includes(category)
  );
  
  if (hasDisallowedCategory) return false;
  
  // Check if any of the food's categories are in the allowed list
  const hasAllowedCategory = categories.some(category => 
    dietRules.allowedCategories.includes(category)
  );
  
  // Apply additional criteria if defined
  if (dietRules.additionalCriteria) {
    return hasAllowedCategory && dietRules.additionalCriteria(food);
  }
  
  return hasAllowedCategory;
};

// Get all compatible diets for a food item
export const getCompatibleDiets = (food: FoodItem): DietType[] => {
  const diets: DietType[] = ["all"];
  
  Object.keys(dietRulesByCategory).forEach((diet) => {
    if (isFoodCompatibleWithDiet(food, diet as DietType)) {
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
