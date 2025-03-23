
import { FoodItem, FoodCategory, DietType } from "@/types/diet";
import { getFoodsByDiet } from "@/services/openFoodFacts";
import { getMonitorLog } from "./testingMonitoring";
import { getAvailableDietTypes } from "./dietTypeManagement";
import { categoryDisplayNames } from "./categoryDisplayNames";

// Process food data for a specific diet
export const processFoodDataForDiet = async (dietType: string): Promise<FoodItem[]> => {
  try {
    // Get foods based on diet type
    const foods = await getFoodsByDiet(dietType);
    
    // Process and validate each food item
    const processedFoods = foods.map(food => {
      // Ensure required fields
      if (!food.id || !food.name) {
        console.warn("Food item missing required fields:", food);
        return null;
      }
      
      return {
        ...food,
        // Provide defaults for missing fields
        servingSize: food.servingSize || "1 serving",
        servingSizeGrams: food.servingSizeGrams || 100,
        diets: food.diets || []
      };
    }).filter(Boolean) as FoodItem[];
    
    return processedFoods;
  } catch (error) {
    console.error("Error processing food data for diet:", dietType, error);
    return [];
  }
};

// Process raw food data into categorized format
export const processFoodDataIntoCategories = (foods: FoodItem[]): FoodCategory[] => {
  // Group foods by primary category
  const categorizedFoods: Record<string, FoodItem[]> = {};
  
  foods.forEach(food => {
    const category = food.primaryCategory;
    if (!categorizedFoods[category]) {
      categorizedFoods[category] = [];
    }
    categorizedFoods[category].push(food);
  });
  
  // Convert to array of categories
  const categories: FoodCategory[] = Object.keys(categorizedFoods).map(categoryName => {
    return {
      name: categoryName,
      items: categorizedFoods[categoryName],
      displayName: categoryDisplayNames[categoryName] || categoryName
    };
  });
  
  return categories;
};

// Get diet types from food data
export const extractDietTypesFromFoods = (foods: FoodItem[]): DietType[] => {
  const dietTypesSet = new Set<string>(["all"]);
  
  foods.forEach(food => {
    if (food.diets && Array.isArray(food.diets)) {
      food.diets.forEach(diet => dietTypesSet.add(diet));
    }
  });
  
  return Array.from(dietTypesSet) as DietType[];
};

// Helper function to filter foods by diet type
export const filterFoodsByDiet = (foods: FoodItem[], dietType: string): FoodItem[] => {
  if (!dietType || dietType === "all") {
    return foods;
  }
  
  return foods.filter(food => 
    food.diets && Array.isArray(food.diets) && food.diets.includes(dietType)
  );
};
