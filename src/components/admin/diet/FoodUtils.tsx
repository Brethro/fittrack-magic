
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
  const importPoultryData = (poultryData: any) => {
    try {
      // Check if there's poultry data to import
      if (!poultryData || !poultryData.poultry || !Array.isArray(poultryData.poultry)) {
        toast({
          title: "Invalid Poultry Data",
          description: "The poultry data format is invalid",
          variant: "destructive",
        });
        return;
      }

      // Add the category mapping for poultry to Meats & Poultry
      const categoryMappings = {
        'poultry': 'Meats & Poultry'
      };

      // Import the data
      const result = importFoodsFromJson(poultryData, categoryMappings);
      
      if (result.success) {
        setLastParseResults(result.dietTypes);
        
        toast({
          title: "Poultry Foods Imported",
          description: `Added ${result.addedCount} new poultry foods, updated ${result.updatedCount} existing foods`,
        });
      } else {
        toast({
          title: "Error Importing Poultry Foods",
          description: result.message.substring(0, 100) + "...",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing poultry foods:", error);
      toast({
        title: "Error Importing Poultry Foods",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Initialize food categories on mount
  useEffect(() => {
    const allRawData = getAllRawFoodData();
    initializeFoodCategories(foodCategoriesData);
  }, []);

  return {
    totalFoodItems,
    lastParseResults,
    setLastParseResults,
    getAllRawFoodData,
    importPoultryData
  };
};
