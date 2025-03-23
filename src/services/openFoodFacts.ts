
import { FoodItem } from "@/types/diet";

// Function to search for foods in the Open Food Facts API
export const searchFoods = async (query: string, page = 1, pageSize = 20): Promise<FoodItem[]> => {
  // Mock implementation returning demo food data
  console.log(`Search query: ${query}, page: ${page}, pageSize: ${pageSize}`);
  
  // Return mock data for common food searches
  if (query.toLowerCase().includes("chicken")) {
    return getMockChickenItems();
  } else if (query.toLowerCase().includes("apple")) {
    return getMockAppleItems();
  }
  
  return [];
};

// Function to get popular foods from the Open Food Facts API
export const getPopularFoods = async (): Promise<FoodItem[]> => {
  // Mock implementation returning common popular foods
  return [
    ...getMockChickenItems(),
    ...getMockAppleItems()
  ];
};

// Function to get foods by diet type
export const getFoodsByDiet = async (diet: string): Promise<FoodItem[]> => {
  // Mock implementation with diet-specific foods
  console.log(`Getting foods for diet: ${diet}`);
  
  // Return different foods based on diet type
  switch (diet.toLowerCase()) {
    case 'vegan':
      return getMockAppleItems();
    case 'keto':
      return getMockChickenItems();
    default:
      return [...getMockChickenItems(), ...getMockAppleItems()];
  }
};

// Mock data helpers
const getMockChickenItems = (): FoodItem[] => {
  return [
    {
      id: "chicken-breast-1",
      name: "Chicken Breast",
      primaryCategory: "poultry",
      secondaryCategories: ["meat", "protein"],
      servingSize: "100g",
      servingSizeGrams: 100,
      caloriesPerServing: 165,
      protein: 31,
      carbs: 0,
      fats: 3.6,
      fiber: 0,
      sugars: 0,
      saturatedFat: 1,
      transFat: 0,
      cholesterol: 85,
      sodium: 74,
      calcium: 15,
      iron: 1,
      potassium: 256,
      zinc: 1,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      diets: ["keto", "paleo"]
    },
    {
      id: "chicken-thigh-1",
      name: "Chicken Thigh",
      primaryCategory: "poultry",
      secondaryCategories: ["meat", "protein"],
      servingSize: "100g",
      servingSizeGrams: 100,
      caloriesPerServing: 209,
      protein: 26,
      carbs: 0,
      fats: 10.9,
      fiber: 0,
      sugars: 0,
      saturatedFat: 3,
      transFat: 0,
      cholesterol: 130,
      sodium: 86,
      calcium: 15,
      iron: 1.3,
      potassium: 270,
      zinc: 2.8,
      vitaminA: 25,
      vitaminC: 0,
      vitaminD: 0,
      diets: ["keto", "paleo"]
    }
  ];
};

const getMockAppleItems = (): FoodItem[] => {
  return [
    {
      id: "apple-1",
      name: "Apple, fresh",
      primaryCategory: "fruit",
      secondaryCategories: ["fresh"],
      servingSize: "1 medium (182g)",
      servingSizeGrams: 182,
      caloriesPerServing: 95,
      protein: 0.5,
      carbs: 25,
      fats: 0.3,
      fiber: 4.4,
      sugars: 19,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 2,
      calcium: 11,
      iron: 0.2,
      potassium: 195,
      zinc: 0.1,
      vitaminA: 54,
      vitaminC: 8.4,
      vitaminD: 0,
      diets: ["vegan", "vegetarian", "paleo"]
    }
  ];
};
