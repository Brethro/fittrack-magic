
import { FoodItem, DietType } from "@/types/diet";
import { dietCompatibleCategories, specialCaseRules } from "./dietCompatibilityRules";

// Function to check if a food is compatible with a diet based on explicit categorization
export const isFoodCompatibleWithDiet = (food: FoodItem, diet: DietType): boolean => {
  // "All" diet includes everything
  if (diet === "all") return true;
  
  // Get diet compatibility rules
  const dietRules = dietCompatibleCategories[diet];
  
  // Apply special case rules first for categories that always pass
  // This is particularly important for fish/seafood in keto diet
  if (specialCaseRules[diet](food) === true && 
      ((diet === "keto" && (food.primaryCategory === "fish" || food.primaryCategory === "seafood")) ||
       (diet === "paleo" && food.primaryCategory === "sweetener" && food.name.toLowerCase().includes("honey")))) {
    return true;
  }
  
  // Check primary category restrictions
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
  
  // Apply special case rules as final check for other categories
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

// Function to filter foods by diet compatibility
export const filterFoodsByDiet = (foods: FoodItem[], diet: DietType): FoodItem[] => {
  if (diet === "all") return foods;
  return foods.filter(food => isFoodCompatibleWithDiet(food, diet));
};
