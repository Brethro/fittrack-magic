import { FoodItem, DietType, FoodPrimaryCategory } from "@/types/diet";

// Define which primary food categories are compatible with each diet
const dietCompatibleCategories: Record<Exclude<DietType, "all">, {
  allowedPrimaryCategories: FoodPrimaryCategory[],
  restrictedPrimaryCategories: FoodPrimaryCategory[],
  secondaryCategoryRules?: {
    required?: FoodPrimaryCategory[],
    allowed?: FoodPrimaryCategory[],
    restricted?: FoodPrimaryCategory[]
  }
}> = {
  vegetarian: {
    allowedPrimaryCategories: [
      "dairy", "egg", "grain", "legume", "vegetable", "fruit", 
      "nut", "seed", "oil", "sweetener", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: [
      "redMeat", "poultry", "fish", "seafood"
    ]
  },
  
  vegan: {
    allowedPrimaryCategories: [
      "grain", "legume", "vegetable", "fruit", "nut", 
      "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: [
      "redMeat", "poultry", "fish", "seafood", "dairy", "egg"
    ],
    secondaryCategoryRules: {
      restricted: ["dairy", "egg"] // For processed foods that might contain dairy/egg
    }
  },
  
  pescatarian: {
    allowedPrimaryCategories: [
      "fish", "seafood", "dairy", "egg", "grain", "legume", "vegetable", 
      "fruit", "nut", "seed", "oil", "sweetener", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: [
      "redMeat", "poultry"
    ]
  },
  
  mediterranean: {
    allowedPrimaryCategories: [
      "fish", "seafood", "poultry", "egg", "dairy", "grain", "legume", 
      "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: [],
    secondaryCategoryRules: {
      allowed: ["redMeat"], // Limited red meat is allowed
      restricted: ["processedFood", "sweetener"] // Limited processed foods and sweets
    }
  },
  
  japanese: {
    allowedPrimaryCategories: [
      "fish", "seafood", "redMeat", "poultry", "egg", "grain", "legume", 
      "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: []
  },
  
  korean: {
    allowedPrimaryCategories: [
      "fish", "seafood", "redMeat", "poultry", "egg", "grain", "legume", 
      "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: []
  },
  
  mexican: {
    allowedPrimaryCategories: [
      "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "grain", 
      "legume", "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: []
  },
  
  italian: {
    allowedPrimaryCategories: [
      "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "grain", 
      "legume", "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: []
  },
  
  paleo: {
    allowedPrimaryCategories: [
      "redMeat", "poultry", "fish", "seafood", "egg", "vegetable", 
      "fruit", "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: [
      "dairy", "grain", "legume", "processedFood"
    ],
    secondaryCategoryRules: {
      restricted: ["sweetener"] // Most sweeteners except for natural honey
    }
  },
  
  keto: {
    allowedPrimaryCategories: [
      "redMeat", "poultry", "fish", "seafood", "dairy", "egg", 
      "nut", "seed", "oil", "herb", "spice", "other"
    ],
    restrictedPrimaryCategories: [
      "grain", "legume", "sweetener"
    ],
    secondaryCategoryRules: {
      allowed: ["vegetable", "fruit"], // Only certain low-carb vegetables and fruits
      restricted: ["processedFood"]
    }
  }
};

// Special case rules for certain diets and food items
const specialCaseRules: Record<DietType, (food: FoodItem) => boolean> = {
  all: () => true,
  
  vegetarian: (food) => true, // Standard rules cover this
  
  vegan: (food) => {
    // Check for honey
    if (food.name.toLowerCase().includes("honey")) {
      return false;
    }
    return true;
  },
  
  pescatarian: (food) => true, // Standard rules cover this
  
  mediterranean: (food) => {
    // Olive oil is strongly preferred
    if (food.primaryCategory === "oil" && food.name.toLowerCase().includes("olive")) {
      return true;
    }
    // Red meat is limited
    if (food.primaryCategory === "redMeat") {
      return !food.name.toLowerCase().includes("processed");
    }
    return true;
  },
  
  japanese: (food) => {
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
  },
  
  korean: (food) => {
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
  },
  
  mexican: (food) => {
    // Specific Mexican diet ingredients get priority
    const mexicanKeywords = [
      "corn", "bean", "rice", "chili", "pepper", "avocado", "tomato", 
      "lime", "cilantro", "taco", "tortilla", "salsa", "guacamole", 
      "jalapeno", "cumin", "coriander", "mole", "queso", "enchilada", 
      "burrito", "quesadilla"
    ];
    
    if (mexicanKeywords.some(keyword => food.name.toLowerCase().includes(keyword))) {
      return true;
    }
    return true;
  },
  
  italian: (food) => {
    // Specific Italian diet ingredients get priority
    const italianKeywords = [
      "pasta", "tomato", "olive", "cheese", "parmesan", "basil", 
      "garlic", "pizza", "risotto", "polenta", "prosciutto",
      "mozzarella", "ricotta", "pesto", "oregano", "rosemary",
      "gnocchi", "cannellini", "pancetta", "focaccia", "bruschetta"
    ];
    
    if (italianKeywords.some(keyword => food.name.toLowerCase().includes(keyword))) {
      return true;
    }
    return true;
  },
  
  paleo: (food) => {
    // Honey is allowed, other sweeteners aren't
    if (food.primaryCategory === "sweetener" && !food.name.toLowerCase().includes("honey")) {
      return false;
    }
    return true;
  },
  
  keto: (food) => {
    // Check carb content if available
    if (food.carbs !== undefined && food.carbs > 10) {
      return false;
    }
    
    // Specific keto-friendly vegetables
    if (food.primaryCategory === "vegetable") {
      const ketoVeggies = [
        "spinach", "kale", "broccoli", "cauliflower", "asparagus",
        "lettuce", "cabbage", "cucumber", "zucchini", "avocado"
      ];
      return ketoVeggies.some(veg => food.name.toLowerCase().includes(veg));
    }
    
    // Specific keto-friendly fruits
    if (food.primaryCategory === "fruit") {
      const ketoFruits = ["avocado", "olive", "coconut", "berry", "lemon", "lime"];
      return ketoFruits.some(fruit => food.name.toLowerCase().includes(fruit));
    }
    
    return true;
  }
};

// Function to check if a food is compatible with a diet based on explicit categorization
export const isFoodCompatibleWithDiet = (food: FoodItem, diet: DietType): boolean => {
  // "All" diet includes everything
  if (diet === "all") return true;
  
  // Get diet compatibility rules
  const dietRules = dietCompatibleCategories[diet];
  
  // Check primary category restrictions first (most important)
  if (dietRules.restrictedPrimaryCategories.includes(food.primaryCategory)) {
    return false;
  }
  
  // Check if primary category is explicitly allowed
  const isPrimaryCategoryAllowed = dietRules.allowedPrimaryCategories.includes(food.primaryCategory);
  
  // Check secondary categories if applicable
  if (food.secondaryCategories && dietRules.secondaryCategoryRules) {
    // Check for restricted secondary categories
    if (dietRules.secondaryCategoryRules.restricted) {
      const hasRestrictedSecondary = food.secondaryCategories.some(
        category => dietRules.secondaryCategoryRules?.restricted?.includes(category)
      );
      if (hasRestrictedSecondary) {
        return false;
      }
    }
    
    // If primary not allowed, see if any secondary categories are explicitly allowed
    if (!isPrimaryCategoryAllowed && dietRules.secondaryCategoryRules.allowed) {
      const hasAllowedSecondary = food.secondaryCategories.some(
        category => dietRules.secondaryCategoryRules?.allowed?.includes(category)
      );
      if (!hasAllowedSecondary) {
        return false;
      }
    }
  }
  
  // Apply special case rules as final check
  return isPrimaryCategoryAllowed && specialCaseRules[diet](food);
};

// Function to get all compatible diets for a food item
export const getCompatibleDiets = (food: FoodItem): DietType[] => {
  const diets: DietType[] = ["all"];
  
  Object.keys(dietCompatibleCategories).forEach((diet) => {
    if (isFoodCompatibleWithDiet(food, diet as DietType)) {
      diets.push(diet as DietType);
    }
  });
  
  return diets;
};

// Function to tag food items with compatible diets
export const tagFoodWithDiets = (food: FoodItem): FoodItem => {
  const compatibleDiets = getCompatibleDiets(food);
  return {
    ...food,
    diets: compatibleDiets.filter(diet => diet !== "all")
  };
};

// Function to batch process food items to add diet tags
export const batchTagFoodsWithDiets = (foods: FoodItem[]): FoodItem[] => {
  return foods.map(food => tagFoodWithDiets(food));
};

// Function to filter foods by diet compatibility
export const filterFoodsByDiet = (foods: FoodItem[], diet: DietType): FoodItem[] => {
  if (diet === "all") return foods;
  return foods.filter(food => isFoodCompatibleWithDiet(food, diet));
};

// Function to assign default primary category based on food name (migration helper)
export const assignDefaultCategory = (food: FoodItem): FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  // Simple keyword-based detection for migration purposes
  if (/beef|steak|lamb|pork|venison|bison|elk|moose|veal|goat/.test(name)) return "redMeat";
  if (/chicken|turkey|duck|goose|quail|pheasant|ostrich|emu|hen|poultry/.test(name)) return "poultry";
  if (/fish|salmon|tuna|cod|trout|tilapia|halibut|bass|mackerel|sardine/.test(name)) return "fish";
  if (/shrimp|crab|lobster|scallop|clam|oyster|mussel|squid|octopus|seafood/.test(name)) return "seafood";
  if (/milk|cheese|yogurt|cream|butter|dairy|whey|curd|kefir/.test(name)) return "dairy";
  if (/egg|yolk|white|omelette|frittata|quiche/.test(name)) return "egg";
  if (/rice|bread|wheat|pasta|cereal|oat|barley|rye|grain|flour|corn|tortilla/.test(name)) return "grain";
  if (/bean|lentil|pea|chickpea|soy|tofu|tempeh|legume/.test(name)) return "legume";
  if (/spinach|broccoli|carrot|lettuce|tomato|potato|onion|garlic|kale|cabbage|vegetable/.test(name)) return "vegetable";
  if (/apple|orange|banana|grape|berry|melon|peach|pear|pineapple|cherry|fruit/.test(name)) return "fruit";
  if (/almond|walnut|pecan|cashew|pistachio|macadamia|peanut|nut/.test(name)) return "nut";
  if (/chia|flax|sesame|sunflower|pumpkin seed|hemp seed|seed/.test(name)) return "seed";
  if (/oil|olive|coconut oil|avocado oil|canola|vegetable oil/.test(name)) return "oil";
  if (/sugar|honey|syrup|sweetener|agave|stevia|molasses/.test(name)) return "sweetener";
  if (/basil|oregano|thyme|rosemary|mint|parsley|cilantro|dill|herb/.test(name)) return "herb";
  if (/pepper|salt|cinnamon|ginger|turmeric|cumin|paprika|nutmeg|spice/.test(name)) return "spice";
  if (/candy|soda|processed|packaged|frozen|canned|microwave/.test(name)) return "processedFood";
  
  return "other";
};

// Helper function to infer secondary categories (migration helper)
export const inferSecondaryCategories = (food: FoodItem): FoodPrimaryCategory[] => {
  const name = food.name.toLowerCase();
  const secondaryCategories: FoodPrimaryCategory[] = [];
  
  // Add secondary categories based on keywords
  if (/processed|packaged|frozen|canned/.test(name)) {
    secondaryCategories.push("processedFood");
  }
  
  // More rules can be added here
  
  return secondaryCategories.length > 0 ? secondaryCategories : undefined;
};

// Migration helper for existing food data
export const migrateExistingFoodData = (food: FoodItem): FoodItem => {
  // If food already has a primary category, return it unchanged
  if ('primaryCategory' in food) {
    return food;
  }
  
  // Assign primary category
  const primaryCategory = assignDefaultCategory(food);
  
  // Infer secondary categories
  const secondaryCategories = inferSecondaryCategories(food);
  
  // Return updated food with categories
  return {
    ...food,
    primaryCategory,
    ...(secondaryCategories ? { secondaryCategories } : {})
  };
};

// Batch migrate existing food data
export const batchMigrateExistingFoodData = (foods: FoodItem[]): FoodItem[] => {
  return foods.map(food => migrateExistingFoodData(food));
};
