
import { FoodItem, FoodPrimaryCategory } from "@/types/diet";

// Function to assign default category based on food name
export const assignDefaultCategory = (food: FoodItem): FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  if (!name) return "other";
  
  if (name.includes("chicken") || name.includes("turkey") || name.includes("duck") || name.includes("goose")) {
    return "poultry";
  }
  
  if (name.includes("beef") || name.includes("lamb") || name.includes("pork") || name.includes("veal") || name.includes("venison")) {
    return "redMeat";
  }
  
  if (name.includes("fish") || name.includes("tuna") || name.includes("salmon") || name.includes("cod") || name.includes("tilapia")) {
    return "fish";
  }
  
  if (name.includes("shrimp") || name.includes("crab") || name.includes("lobster") || name.includes("clam") || name.includes("mussel") || name.includes("oyster")) {
    return "seafood";
  }
  
  if (name.includes("milk") || name.includes("cheese") || name.includes("yogurt") || name.includes("butter") || name.includes("cream")) {
    return "dairy";
  }
  
  if (name.includes("egg")) {
    return "egg";
  }
  
  if (name.includes("bread") || name.includes("rice") || name.includes("pasta") || name.includes("wheat") || name.includes("oat") || name.includes("barley") || name.includes("corn")) {
    return "grain";
  }
  
  if (name.includes("bean") || name.includes("lentil") || name.includes("pea") || name.includes("chickpea") || name.includes("soy")) {
    return "legume";
  }
  
  if (name.includes("apple") || name.includes("banana") || name.includes("orange") || name.includes("grape") || name.includes("berry") || name.includes("citrus") || name.includes("melon")) {
    return "fruit";
  }
  
  if (name.includes("lettuce") || name.includes("spinach") || name.includes("kale") || name.includes("broccoli") || name.includes("carrot") || name.includes("onion") || name.includes("pepper") || name.includes("tomato")) {
    return "vegetable";
  }
  
  if (name.includes("almond") || name.includes("walnut") || name.includes("pecan") || name.includes("peanut") || name.includes("cashew") || name.includes("hazelnut")) {
    return "nut";
  }
  
  if (name.includes("chia") || name.includes("flax") || name.includes("sesame") || name.includes("sunflower") || name.includes("pumpkin") || name.includes("seed")) {
    return "seed";
  }
  
  if (name.includes("olive oil") || name.includes("coconut oil") || name.includes("vegetable oil") || name.includes("canola oil")) {
    return "oil";
  }
  
  if (name.includes("sugar") || name.includes("honey") || name.includes("maple syrup") || name.includes("agave")) {
    return "sweetener";
  }
  
  if (name.includes("basil") || name.includes("mint") || name.includes("cilantro") || name.includes("parsley") || name.includes("thyme") || name.includes("rosemary")) {
    return "herb";
  }
  
  if (name.includes("pepper") || name.includes("salt") || name.includes("cinnamon") || name.includes("cumin") || name.includes("paprika") || name.includes("turmeric")) {
    return "spice";
  }
  
  if (name.includes("cookie") || name.includes("candy") || name.includes("chip") || name.includes("snack") || name.includes("soda") || name.includes("pizza") || name.includes("burger")) {
    return "processedFood";
  }
  
  return "other";
};

// Function to infer secondary categories based on a food's characteristics
export const inferSecondaryCategories = (food: FoodItem): string[] | undefined => {
  const secondaryCategories: string[] = [];
  const name = food.name.toLowerCase();
  
  // Infer based on name
  if (food.primaryCategory === "redMeat" || food.primaryCategory === "poultry" || food.primaryCategory === "fish" || food.primaryCategory === "seafood") {
    secondaryCategories.push("meat");
  }
  
  // Add high-protein tag for protein-rich foods
  if ((food.protein / food.servingSizeGrams) * 100 > 20) {
    secondaryCategories.push("high-protein");
  }
  
  // Add high-carb tag for carb-rich foods
  if ((food.carbs / food.servingSizeGrams) * 100 > 30) {
    secondaryCategories.push("high-carb");
  }
  
  // Add high-fat tag for fatty foods
  if ((food.fats / food.servingSizeGrams) * 100 > 30) {
    secondaryCategories.push("high-fat");
  }
  
  return secondaryCategories.length > 0 ? secondaryCategories : undefined;
};

// Function to resolve ambiguous food categories
export const resolveAmbiguousCategory = (food: FoodItem): FoodPrimaryCategory => {
  const name = food.name.toLowerCase();
  
  // More detailed analysis for foods initially categorized as "other"
  // This can be expanded with more sophisticated logic
  
  if (name.includes("wrap") || name.includes("tortilla")) {
    return "grain";
  }
  
  if (name.includes("tofu") || name.includes("tempeh")) {
    return "legume";
  }
  
  if (name.includes("juice")) {
    if (name.includes("vegetable")) {
      return "vegetable";
    }
    return "fruit";
  }
  
  return "other";
};
