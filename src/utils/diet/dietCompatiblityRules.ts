
import { FoodPrimaryCategory, DietType, FoodItem } from "@/types/diet";

// Define which primary food categories are compatible with each diet
export const dietCompatibleCategories: Record<Exclude<DietType, "all">, {
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
export const specialCaseRules: Record<DietType, (food: FoodItem) => boolean> = {
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
    
    // Fish and seafood are keto-friendly
    if (food.primaryCategory === "fish" || food.primaryCategory === "seafood") {
      return true;
    }
    
    return true;
  }
};
