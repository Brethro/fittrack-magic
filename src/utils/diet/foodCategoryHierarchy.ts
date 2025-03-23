
import { FoodPrimaryCategory } from "@/types/diet";

// Define the food category hierarchy
export const foodCategoryHierarchy: Record<FoodPrimaryCategory, string[]> = {
  meat: ["beef", "pork", "lamb", "game"],
  poultry: ["chicken", "turkey", "duck", "goose"],
  fish: ["salmon", "tuna", "cod", "tilapia"],
  seafood: ["shrimp", "crab", "lobster", "mussels"],
  dairy: ["milk", "cheese", "yogurt", "butter"],
  egg: ["chicken egg", "duck egg", "quail egg"],
  grain: ["wheat", "rice", "oats", "corn"],
  legume: ["beans", "lentils", "chickpeas", "peanuts"],
  vegetable: ["leafy greens", "root vegetables", "cruciferous", "nightshades"],
  fruit: ["berries", "citrus", "tropical", "stone fruits"],
  nut: ["almonds", "walnuts", "cashews", "pistachios"],
  seed: ["chia", "flax", "sunflower", "pumpkin"],
  oil: ["olive", "coconut", "avocado", "seed oils"],
  sweetener: ["sugar", "honey", "maple syrup", "artificial"],
  herb: ["basil", "oregano", "thyme", "mint"],
  spice: ["pepper", "cinnamon", "cumin", "paprika"],
  processedFood: ["bread", "pasta", "cereal", "snacks"],
  other: ["misc", "condiments", "beverages", "supplements"]
};

// Helper function to get subcategories for a primary category
export const getCategorySubcategories = (category: FoodPrimaryCategory): string[] => {
  return foodCategoryHierarchy[category] || [];
};
