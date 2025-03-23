
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { searchFoods, getPopularFoods } from "@/services/openFoodFacts";
import { FoodItem } from "@/types/diet";

export const useFoodDatabase = () => {
  const { toast } = useToast();
  const [lastParseResults, setLastParseResults] = useState<string[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalFoodItems, setTotalFoodItems] = useState(0);
  const [categoriesInitialized, setCategoriesInitialized] = useState(false);

  // Function to search for foods using the Open Food Facts API
  const searchFoodItems = async (query: string, page = 1, pageSize = 20) => {
    if (query.length < 2) {
      return [];
    }
    
    setIsLoading(true);
    try {
      const results = await searchFoods(query, page, pageSize);
      setFoodItems(results);
      setTotalFoodItems(results.length);
      
      // Show a toast notification with search results
      if (results.length > 0) {
        toast({
          title: "Search Results",
          description: `Found ${results.length} items matching "${query}"`,
        });
      } else {
        toast({
          title: "No Results",
          description: `No foods found matching "${query}"`,
          variant: "destructive",
        });
      }
      
      return results;
    } catch (error) {
      console.error("Error searching foods:", error);
      toast({
        title: "Search Error",
        description: "There was an error searching for food items.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load initial food data
  const initializeFoodData = async () => {
    setIsLoading(true);
    try {
      const popularFoods = await getPopularFoods();
      setFoodItems(popularFoods);
      setTotalFoodItems(popularFoods.length);
      setCategoriesInitialized(true);
      
      // Extract diet types from the foods
      const dietTypes = new Set<string>();
      popularFoods.forEach(food => {
        if (food.diets && food.diets.length > 0) {
          food.diets.forEach(diet => dietTypes.add(diet));
        }
      });
      
      setLastParseResults(Array.from(dietTypes));
      return popularFoods;
    } catch (error) {
      console.error("Error initializing food data:", error);
      toast({
        title: "Initialization Error",
        description: "There was an error loading initial food data.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified getAllRawFoodData function
  const getAllRawFoodData = () => {
    return foodItems;
  };

  // Import food data - this will now search for poultry in the API
  const importPoultryData = async () => {
    setIsLoading(true);
    try {
      const poultryFoods = await searchFoods("chicken OR turkey OR poultry", 1, 50);
      
      setFoodItems(prev => {
        // Filter out any duplicates
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = poultryFoods.filter(item => !existingIds.has(item.id));
        
        // Combine existing and new items
        return [...prev, ...newItems];
      });
      
      setTotalFoodItems(prev => prev + poultryFoods.length);
      
      // Extract diet types
      const dietTypes = new Set<string>();
      poultryFoods.forEach(food => {
        if (food.diets && food.diets.length > 0) {
          food.diets.forEach(diet => dietTypes.add(diet));
        }
      });
      
      const dietTypesArray = Array.from(dietTypes);
      setLastParseResults(dietTypesArray);
      
      toast({
        title: "Poultry Data Imported",
        description: `Imported ${poultryFoods.length} poultry items from Open Food Facts.`,
      });
      
      return {
        success: true,
        message: `Successfully imported ${poultryFoods.length} poultry items.`,
        addedCount: poultryFoods.length,
        updatedCount: 0,
        failedCount: 0,
        failedItems: [],
        dietTypes: dietTypesArray
      };
    } catch (error) {
      console.error("Error importing poultry data:", error);
      
      toast({
        title: "Import Error",
        description: "There was an error importing poultry data from Open Food Facts.",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: "Error importing poultry data: " + (error instanceof Error ? error.message : String(error)),
        addedCount: 0,
        updatedCount: 0,
        failedCount: 0,
        failedItems: [],
        dietTypes: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    totalFoodItems,
    lastParseResults,
    setLastParseResults,
    getAllRawFoodData,
    importPoultryData,
    categoriesInitialized,
    searchFoodItems,
    initializeFoodData,
    foodItems,
    isLoading
  };
};
