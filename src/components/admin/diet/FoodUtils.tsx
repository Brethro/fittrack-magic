
import { useState, useEffect } from "react";
import { foodCategoriesData } from "@/data/diet";
import { initializeFoodCategories, importFoodsFromJson } from "@/utils/diet/foodManagement";

// Import all food data modules directly to ensure we parse everything
import { meatsAndPoultryData } from "@/data/diet/meatData";
import { nutsAndSeedsData } from "@/data/diet/nutsAndSeedsData";
import { healthyFatsData } from "@/data/diet/healthyFatsData";
import { spicesAndHerbsData } from "@/data/diet/spicesData";
import { beveragesData } from "@/data/diet/beveragesData";
import { starchyVegetablesData } from "@/data/diet/starchyVegetablesData";
import { otherVegetablesData } from "@/data/diet/otherVegetablesData";
import { greenVegetablesData } from "@/data/diet/greenVegetablesData";
import { plantProteinsData } from "@/data/diet/plantProteinsData";
import { condimentsAndSaucesData } from "@/data/diet/condimentsData";
import { fishAndSeafoodData } from "@/data/diet/seafoodData";
import { breadsAndBreakfastData } from "@/data/diet/breadsData";
import { eggsAndDairyData } from "@/data/diet/dairyData";
import { grainsAndPastasData } from "@/data/diet/grainsData";
import { fruitsData } from "@/data/diet/fruitsData";
import { useToast } from "@/components/ui/use-toast";

export const useFoodDatabase = () => {
  const { toast } = useToast();
  const [totalFoodItems, setTotalFoodItems] = useState<number>(0);
  const [lastParseResults, setLastParseResults] = useState<string[]>([]);
  const [categoriesInitialized, setCategoriesInitialized] = useState<boolean>(false);

  // Get all raw food data (including categories that might be filtered out in foodCategoriesData)
  const getAllRawFoodData = () => {
    const allRawData = [
      meatsAndPoultryData,
      nutsAndSeedsData,
      healthyFatsData,
      spicesAndHerbsData,
      beveragesData,
      starchyVegetablesData,
      otherVegetablesData,
      greenVegetablesData,
      plantProteinsData,
      condimentsAndSaucesData,
      fishAndSeafoodData,
      breadsAndBreakfastData,
      eggsAndDairyData,
      grainsAndPastasData,
      fruitsData
    ];
    
    // Count total food items across all categories
    const total = allRawData.reduce((sum, category) => 
      sum + (category.items?.length || 0), 0);
    setTotalFoodItems(total);
    
    return allRawData;
  };

  // Function to import poultry data
  const importPoultryData = () => {
    try {
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

      // Log available categories for debugging
      console.log("Available categories before poultry import:", 
        foodCategoriesData.map(cat => `${cat.name} (${cat.displayName || 'no display name'})`).join(', '));

      // Add the category mapping for poultry to Meats & Poultry - use internal name, not display name
      const categoryMappings = {
        'poultry': 'meatsAndPoultry'  // Matching internal name from data/diet/index.ts
      };

      // Import the data
      const result = importFoodsFromJson(poultryData, categoryMappings);
      
      if (result.success) {
        setLastParseResults(result.dietTypes);
        
        toast({
          title: "Poultry Foods Imported",
          description: `Added ${result.addedCount} new poultry foods, updated ${result.updatedCount} existing foods`,
        });
        
        console.log("Poultry import successful:", 
          `Added ${result.addedCount}, Updated ${result.updatedCount}, Failed ${result.failedCount}`);
      } else {
        console.error("Poultry import failed:", result.message);
        toast({
          title: "Error Importing Poultry Foods",
          description: result.message.substring(0, 100) + "...",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error importing poultry foods:", error);
      toast({
        title: "Error Importing Poultry Foods",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: `Error importing poultry foods: ${error instanceof Error ? error.message : "Unknown error"}`,
        addedCount: 0,
        updatedCount: 0,
        failedCount: 0,
        failedItems: [],
        dietTypes: []
      };
    }
  };

  // Initialize food categories on mount
  useEffect(() => {
    const allRawData = getAllRawFoodData();
    
    // Initialize food categories first with all raw data
    const categories = initializeFoodCategories(foodCategoriesData);
    console.log("Food categories initialized:", 
      categories.map(cat => `${cat.name} (${cat.displayName || 'no display name'})`));
    
    setCategoriesInitialized(true);
  }, []);

  return {
    totalFoodItems,
    lastParseResults,
    setLastParseResults,
    getAllRawFoodData,
    importPoultryData,
    categoriesInitialized
  };
};
