
import { FoodItem, DietType } from "@/types/diet";
import { dietCompatibleCategories, specialCaseRules } from "./dietCompatibilityRules";
import { foodBelongsToCategory } from "./foodCategoryHierarchy";

// Function to check if a food is compatible with a diet based on hierarchical categorization
export const isFoodCompatibleWithDiet = (food: FoodItem, diet: DietType): boolean => {
  // "All" diet includes everything
  if (diet === "all") return true;
  
  // Special case for honey in paleo diet
  if (diet === "paleo" && food.primaryCategory === "sweetener" && food.name.toLowerCase().includes("honey")) {
    return true;
  }
  
  // Get diet compatibility rules
  const dietRules = dietCompatibleCategories[diet];
  if (!dietRules) {
    console.warn(`No diet rules found for diet: ${diet}`);
    return false;
  }
  
  // Check parent/child category relationships
  // Handle meat hierarchies more effectively
  if (diet === "keto" && foodBelongsToCategory(food, "meat")) {
    return true;
  }
  
  if (diet === "pescatarian" && (foodBelongsToCategory(food, "fish") || foodBelongsToCategory(food, "seafood"))) {
    return true;
  }
  
  // Check restricted primary categories (direct and parent categories)
  for (const restrictedCategory of dietRules.restrictedPrimaryCategories) {
    if (foodBelongsToCategory(food, restrictedCategory)) {
      return false;
    }
  }
  
  // Check if primary category is explicitly allowed (direct or parent categories)
  const isPrimaryCategoryAllowed = dietRules.allowedPrimaryCategories.some(
    allowedCategory => foodBelongsToCategory(food, allowedCategory)
  );
  
  // Check secondary categories if applicable
  if (food.secondaryCategories && dietRules.secondaryCategoryRules) {
    // Check for restricted secondary categories
    if (dietRules.secondaryCategoryRules.restricted) {
      const hasRestrictedSecondary = food.secondaryCategories.some(
        category => dietRules.secondaryCategoryRules?.restricted?.some(
          restricted => category === restricted
        )
      );
      if (hasRestrictedSecondary) {
        return false;
      }
    }
    
    // If primary not allowed, see if any secondary categories are explicitly allowed
    if (!isPrimaryCategoryAllowed && dietRules.secondaryCategoryRules.allowed) {
      const hasAllowedSecondary = food.secondaryCategories.some(
        category => dietRules.secondaryCategoryRules?.allowed?.some(
          allowed => category === allowed
        )
      );
      if (!hasAllowedSecondary) {
        return false;
      }
    }
  }
  
  // Apply special case rules as final check
  return isPrimaryCategoryAllowed || (specialCaseRules[diet] ? specialCaseRules[diet](food) : false);
};

// Function to get all compatible diets for a food item
export const getCompatibleDiets = (food: FoodItem): DietType[] => {
  const diets: DietType[] = ["all"];
  
  // Check each diet type except "all"
  const dietTypes: Exclude<DietType, "all">[] = [
    "mediterranean", "vegetarian", "vegan", "japanese", 
    "korean", "mexican", "italian", "paleo", "keto", "pescatarian"
  ];
  
  dietTypes.forEach((diet) => {
    if (isFoodCompatibleWithDiet(food, diet)) {
      diets.push(diet);
    }
  });
  
  return diets;
};

// Function to filter foods by diet compatibility
export const filterFoodsByDiet = (foods: FoodItem[], diet: DietType): FoodItem[] => {
  if (diet === "all") return foods;
  return foods.filter(food => isFoodCompatibleWithDiet(food, diet));
};
