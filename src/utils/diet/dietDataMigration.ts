
import { FoodItem } from "@/types/diet";
import { assignDefaultCategory, inferSecondaryCategories, resolveAmbiguousCategory } from "./foodCategoryHelpers";
import { getCompatibleDiets } from "./dietCompatibilityChecker";
import { foodBelongsToCategory } from "./foodCategoryHierarchy";

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

// Enhanced migration helper for existing food data - now with hierarchical category support
export const migrateExistingFoodData = (food: Partial<FoodItem> & { name: string; id: string; servingSizeGrams: number; servingSize: string }): FoodItem => {
  // If food already has a primary category, validate it
  const primaryCategory = 'primaryCategory' in food && food.primaryCategory 
    ? food.primaryCategory 
    : assignDefaultCategory(food as FoodItem);
  
  // Determine secondary categories with improved logic
  let secondaryCategories = food.secondaryCategories || [];
  
  // If we don't have secondary categories or they're empty, infer them
  if (!food.secondaryCategories || food.secondaryCategories.length === 0) {
    const inferredCategories = inferSecondaryCategories({
      ...food,
      primaryCategory
    } as FoodItem);
    
    if (inferredCategories) {
      secondaryCategories = inferredCategories;
    }
  }
  
  // For meat subcategories, always add "meat" as a secondary category if not already included
  if ((primaryCategory === "redMeat" || primaryCategory === "poultry" || 
       primaryCategory === "fish" || primaryCategory === "seafood") && 
      !secondaryCategories.includes("meat")) {
    secondaryCategories.push("meat");
  }
  
  // Handle ambiguous cases that regex patterns might miss
  if (primaryCategory === "other") {
    const resolvedCategory = resolveAmbiguousCategory({
      ...food,
      primaryCategory
    } as FoodItem);
    
    // Only update if we found a better category
    if (resolvedCategory !== "other") {
      primaryCategory = resolvedCategory;
    }
  }
  
  // Create a new object with all properties from the original food plus updated categories
  const updatedFood: FoodItem = {
    id: food.id,
    name: food.name,
    protein: food.protein || 0,
    carbs: food.carbs || 0,
    fats: food.fats || 0,
    caloriesPerServing: food.caloriesPerServing || 0,
    servingSizeGrams: food.servingSizeGrams,
    servingSize: food.servingSize,
    primaryCategory: primaryCategory,
    secondaryCategories: secondaryCategories.length > 0 ? secondaryCategories : undefined,
    ...(food.diets ? { diets: food.diets } : {})
  };
  
  return updatedFood;
};

// Validate migrated food data
export const validateFoodData = (food: FoodItem): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for required fields
  if (!food.id) issues.push("Missing ID");
  if (!food.name) issues.push("Missing name");
  if (!food.servingSize) issues.push("Missing serving size");
  if (!food.servingSizeGrams) issues.push("Missing serving size in grams");
  
  // Validate primary category
  if (!food.primaryCategory) {
    issues.push("Missing primary category");
  }
  
  // Check for potential miscategorization
  const inferredCategory = assignDefaultCategory(food);
  if (food.primaryCategory !== inferredCategory && 
      !foodBelongsToCategory(food, inferredCategory) && 
      food.primaryCategory !== "other") {
    issues.push(`Potential miscategorization: assigned "${food.primaryCategory}" but name suggests "${inferredCategory}"`);
  }
  
  // Validate secondary categories
  if (food.secondaryCategories) {
    // Check for duplicate categories
    const uniqueCategories = new Set(food.secondaryCategories);
    if (uniqueCategories.size !== food.secondaryCategories.length) {
      issues.push("Duplicate secondary categories");
    }
    
    // Check if primary category is also in secondary categories
    if (food.secondaryCategories.includes(food.primaryCategory)) {
      issues.push("Primary category duplicated in secondary categories");
    }
  }
  
  // Validate that meat subcategories have "meat" as a secondary category
  if ((food.primaryCategory === "redMeat" || food.primaryCategory === "poultry" || 
       food.primaryCategory === "fish" || food.primaryCategory === "seafood") && 
      (!food.secondaryCategories || !food.secondaryCategories.includes("meat"))) {
    issues.push("Meat subcategory should have 'meat' as a secondary category");
  }
  
  return { 
    isValid: issues.length === 0,
    issues 
  };
};

// Batch migrate and validate existing food data
export const batchMigrateExistingFoodData = (foods: Partial<FoodItem>[]): FoodItem[] => {
  const validFoods = foods
    .filter(food => food.name && food.id && food.servingSizeGrams && food.servingSize)
    .map(food => migrateExistingFoodData(food as any));
  
  // Validate migrated foods and log issues for debugging
  validFoods.forEach(food => {
    const validation = validateFoodData(food);
    if (!validation.isValid) {
      console.warn(`Validation issues with food "${food.name}" (${food.id}):`, validation.issues);
    }
  });
  
  return validFoods;
};
