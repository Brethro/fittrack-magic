
import { importFoodsFromJson } from "./foodManagement";
import { getCurrentFoodCategories } from "./foodManagement";

export const importPoultryData = () => {
  // The JSON data for poultry
  const poultryData = {
    "poultry": [
      {
        "id": "chicken_breast_skinless_boneless_roasted",
        "name": "Chicken Breast, Skinless, Boneless, Roasted",
        "servingSize": "100g",
        "servingSizeGrams": 100,
        "calories": 165,
        "totalFat": 3.6,
        "saturatedFat": 1.0,
        "transFat": 0,
        "polyunsaturatedFat": 0.8,
        "monounsaturatedFat": 1.2,
        "cholesterol": 85,
        "sodium": 74,
        "totalCarbohydrates": 0,
        "dietaryFiber": 0,
        "totalSugars": 0,
        "addedSugars": 0,
        "protein": 31,
        "vitaminD": 0,
        "calcium": 15,
        "iron": 0.9,
        "potassium": 256,
        "vitaminA": 0,
        "vitaminC": 0,
        "primaryCategory": "poultry",
        "primaryCategoryDisplayName": "Poultry",
        "secondaryCategories": ["meat"],
        "diets": [
          "paleo",
          "keto",
          "mediterranean",
          "low-carb",
          "high-protein",
          "whole30",
          "atkins",
          "zone"
        ]
      },
      {
        "id": "chicken_thigh_skinless_boneless_roasted",
        "name": "Chicken Thigh, Skinless, Boneless, Roasted",
        "servingSize": "100g",
        "servingSizeGrams": 100,
        "calories": 209,
        "totalFat": 10.9,
        "saturatedFat": 3.0,
        "transFat": 0,
        "polyunsaturatedFat": 2.0,
        "monounsaturatedFat": 4.0,
        "cholesterol": 105,
        "sodium": 88,
        "totalCarbohydrates": 0,
        "dietaryFiber": 0,
        "totalSugars": 0,
        "addedSugars": 0,
        "protein": 26,
        "vitaminD": 0,
        "calcium": 12,
        "iron": 1.2,
        "potassium": 230,
        "vitaminA": 0,
        "vitaminC": 0,
        "primaryCategory": "poultry",
        "primaryCategoryDisplayName": "Poultry",
        "secondaryCategories": ["meat"],
        "diets": [
          "paleo",
          "keto",
          "mediterranean",
          "low-carb",
          "high-protein",
          "whole30",
          "atkins",
          "zone"
        ]
      },
      {
        "id": "turkey_breast_skinless_boneless_roasted",
        "name": "Turkey Breast, Skinless, Boneless, Roasted",
        "servingSize": "100g",
        "servingSizeGrams": 100,
        "calories": 135,
        "totalFat": 1.7,
        "saturatedFat": 0.4,
        "transFat": 0,
        "polyunsaturatedFat": 0.5,
        "monounsaturatedFat": 0.6,
        "cholesterol": 70,
        "sodium": 50,
        "totalCarbohydrates": 0,
        "dietaryFiber": 0,
        "totalSugars": 0,
        "addedSugars": 0,
        "protein": 30,
        "vitaminD": 0,
        "calcium": 10,
        "iron": 1.1,
        "potassium": 250,
        "vitaminA": 0,
        "vitaminC": 0,
        "primaryCategory": "poultry",
        "primaryCategoryDisplayName": "Poultry",
        "secondaryCategories": ["meat"],
        "diets": [
          "paleo",
          "keto",
          "mediterranean",
          "low-carb",
          "high-protein",
          "whole30",
          "atkins",
          "zone"
        ]
      },
      {
        "id": "duck_breast_skinless_roasted",
        "name": "Duck Breast, Skinless, Roasted",
        "servingSize": "100g",
        "servingSizeGrams": 100,
        "calories": 140,
        "totalFat": 3.5,
        "saturatedFat": 1.0,
        "transFat": 0,
        "polyunsaturatedFat": 0.8,
        "monounsaturatedFat": 1.5,
        "cholesterol": 75,
        "sodium": 60,
        "totalCarbohydrates": 0,
        "dietaryFiber": 0,
        "totalSugars": 0,
        "addedSugars": 0,
        "protein": 20,
        "vitaminD": 0,
        "calcium": 10,
        "iron": 1.0,
        "potassium": 210,
        "vitaminA": 0,
        "vitaminC": 0,
        "primaryCategory": "poultry",
        "primaryCategoryDisplayName": "Poultry",
        "secondaryCategories": ["meat"],
        "diets": [
          "paleo",
          "keto",
          "mediterranean",
          "low-carb",
          "high-protein",
          "whole30",
          "atkins",
          "zone"
        ]
      }
    ]
  };

  // Debug: Log available categories before import
  const categories = getCurrentFoodCategories();
  console.log("Available categories for poultry import:", 
    categories.map(cat => `${cat.name} (${cat.displayName || 'no display name'})`).join(', '));

  // Define the mapping for poultry category - use internal name, not display name
  const categoryMappings = {
    'poultry': 'meatsAndPoultry'  // Matching internal name from data/diet/index.ts
  };

  // Import the poultry data
  const result = importFoodsFromJson(poultryData, categoryMappings);
  
  // Log detailed results for debugging
  if (!result.success) {
    console.error("Poultry import failed:", result.message);
    console.error("Failed items:", result.failedItems.slice(0, 3));
  } else {
    console.log("Poultry import successful:", 
      `Added ${result.addedCount}, Updated ${result.updatedCount}, Failed ${result.failedCount}`);
  }
  
  return result;
};
