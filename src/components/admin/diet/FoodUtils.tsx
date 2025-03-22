
import { useState, useEffect } from "react";
import { foodCategoriesData } from "@/data/diet";
import { initializeFoodCategories } from "@/utils/diet/foodManagement";

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

export const useFoodDatabase = () => {
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

  // Initialize food categories on mount
  useEffect(() => {
    const allRawData = getAllRawFoodData();
    initializeFoodCategories(foodCategoriesData);
  }, []);

  return {
    totalFoodItems,
    lastParseResults,
    setLastParseResults,
    getAllRawFoodData
  };
};
