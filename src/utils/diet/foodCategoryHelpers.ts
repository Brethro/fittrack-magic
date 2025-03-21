
import { FoodItem, FoodPrimaryCategory } from "@/types/diet";

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
