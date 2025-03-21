
import { FoodPrimaryCategory, FoodItem } from "@/types/diet";

// Mexican diet rules
export const mexicanRules = {
  allowedPrimaryCategories: [
    "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "grain", 
    "legume", "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [] as FoodPrimaryCategory[]
};

export const mexicanSpecialRules = (food: FoodItem): boolean => {
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
};

// Italian diet rules
export const italianRules = {
  allowedPrimaryCategories: [
    "redMeat", "poultry", "fish", "seafood", "dairy", "egg", "grain", 
    "legume", "vegetable", "fruit", "nut", "seed", "oil", "herb", "spice", "other"
  ] as FoodPrimaryCategory[],
  restrictedPrimaryCategories: [] as FoodPrimaryCategory[]
};

export const italianSpecialRules = (food: FoodItem): boolean => {
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
};
