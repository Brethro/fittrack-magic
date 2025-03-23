
import { useState, useEffect, useCallback, useRef } from "react";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { useFoodDatabase } from "@/components/admin/diet/FoodUtils";
import { processFoodItems } from "@/components/diet/FoodData";
import { getFoodsByDiet } from "@/services/openFoodFacts";
import { searchAndHighlightFoods } from "@/utils/diet/foodSearchUtils";
import { getCachedFilteredItems } from "@/components/diet/helpers/foodFilterHelpers";

export const useFoodSelectionState = (initialFoodCategories: FoodCategory[]) => {
  const { toast } = useToast();
  const { foodItems, searchFoodItems: apiSearchFoodItems, isLoading, initializeFoodData } = useFoodDatabase();
  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>({});
  const [selectedDiet, setSelectedDiet] = useState<DietType>("all");
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>(initialFoodCategories);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Prevent infinite loops by avoiding state updates during search
  const isSearching = useRef(false);

  // Update food categories when foodItems change
  useEffect(() => {
    if (foodItems.length > 0) {
      const categories = processFoodItems(foodItems);
      setFoodCategories(categories);
      
      // Initialize selected foods if empty
      if (Object.keys(selectedFoods).length === 0) {
        const initialSelectedFoods: Record<string, boolean> = {};
        foodItems.forEach(item => {
          // Default to selecting protein sources and vegetables
          if (
            item.primaryCategory === "poultry" || 
            item.primaryCategory === "fish" || 
            item.primaryCategory === "vegetable" ||
            item.primaryCategory === "legume"
          ) {
            initialSelectedFoods[item.id] = true;
          } else {
            initialSelectedFoods[item.id] = false;
          }
        });
        setSelectedFoods(initialSelectedFoods);
      }
    }
  }, [foodItems]);

  // Apply current search query when categories or diet changes
  useEffect(() => {
    if (searchQuery.length >= 2 && !isSearching.current) {
      // Apply the search to the current food categories
      const filteredItems = getCachedFilteredItems(
        foodCategories.flatMap(cat => cat.items),
        searchQuery,
        selectedDiet
      );
      setSearchResults(filteredItems);
    }
  }, [foodCategories, selectedDiet, searchQuery]);

  // Apply diet filter
  const applyDietFilter = async (diet: DietType) => {
    if (diet === selectedDiet) return; // Prevent unnecessary updates
    
    setSelectedDiet(diet);
    
    if (diet === "all") {
      toast({
        title: "All Foods",
        description: "Showing all available foods.",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Fetch foods specific to this diet type
      const dietSpecificFoods = await getFoodsByDiet(diet);
      
      if (dietSpecificFoods.length > 0) {
        // Update categories with the diet-specific foods
        const categories = processFoodItems(dietSpecificFoods);
        setFoodCategories(categories);
        
        // Update selected foods
        const newSelectedFoods: Record<string, boolean> = {};
        dietSpecificFoods.forEach(item => {
          newSelectedFoods[item.id] = true;
        });
        setSelectedFoods(newSelectedFoods);
        
        toast({
          title: `${diet.charAt(0).toUpperCase() + diet.slice(1)} Diet`,
          description: `Found ${dietSpecificFoods.length} foods compatible with ${diet} diet.`,
        });
      } else {
        toast({
          title: "No Specific Foods Found",
          description: `Couldn't find foods specifically for ${diet} diet. Using general foods instead.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error applying ${diet} diet filter:`, error);
      toast({
        title: "Error Applying Diet Filter",
        description: "There was an error filtering foods by diet type.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search food items with debounce to prevent rapid API calls
  const searchFoodItems = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return [];
    }

    if (isSearching.current) return []; // Prevent concurrent searches
    isSearching.current = true;
    setLoading(true);
    
    try {
      // First search local food items using highlighting
      const { items: localResults } = searchAndHighlightFoods(query, foodCategories);
      setSearchResults(localResults);
      
      // Also search the API for more results
      const apiResults = await apiSearchFoodItems(query);
      
      if (apiResults.length > 0) {
        // Process the API results into categories
        const updatedCategories = processFoodItems([...foodItems, ...apiResults]);
        setFoodCategories(updatedCategories);
        
        // Update the search results with the new items from API
        const { items: combinedResults } = searchAndHighlightFoods(query, updatedCategories);
        setSearchResults(combinedResults);
        
        toast({
          title: "Search Results",
          description: `Found ${combinedResults.length} foods matching "${query}"`,
        });
        
        return combinedResults;
      }
      
      // If no API results, return local results
      return localResults;
    } catch (error) {
      console.error("Error searching for food items:", error);
      
      toast({
        title: "Search Error",
        description: "There was an error searching for foods.",
        variant: "destructive",
      });
      
      return [];
    } finally {
      setLoading(false);
      isSearching.current = false;
    }
  }, [apiSearchFoodItems, foodCategories, foodItems, toast]);

  // Get selected food items
  const getSelectedFoodItems = useCallback((): FoodItem[] => {
    return foodItems.filter(item => selectedFoods[item.id]);
  }, [foodItems, selectedFoods]);

  // Get diet compatible foods
  const getDietCompatibleFoods = useCallback((): FoodItem[] => {
    if (selectedDiet === "all") return foodItems;
    
    return foodItems.filter(item => 
      (item.diets?.includes(selectedDiet)) || 
      false
    );
  }, [foodItems, selectedDiet]);

  // Get available diets
  const getAvailableDiets = useCallback((): DietType[] => {
    const dietSet = new Set<DietType>(["all"]);
    
    foodItems.forEach(item => {
      if (item.diets) {
        item.diets.forEach(diet => {
          // Filter to keep only valid diet types
          if (isDietTypeValid(diet)) {
            dietSet.add(diet as DietType);
          }
        });
      }
    });
    
    return Array.from(dietSet);
  }, [foodItems]);

  // Helper to check if a diet string is a valid DietType
  const isDietTypeValid = (diet: string): boolean => {
    const validDietTypes: DietType[] = [
      "all", "mediterranean", "vegetarian", "vegan", "japanese", "korean", 
      "mexican", "italian", "paleo", "keto", "pescatarian", "low-carb", 
      "high-protein", "carnivore", "whole30", "atkins", "zone"
    ];
    return validDietTypes.includes(diet as DietType);
  };

  return {
    selectedFoods,
    setSelectedFoods,
    selectedDiet,
    setSelectedDiet: applyDietFilter,
    getSelectedFoodItems,
    getDietCompatibleFoods,
    getAvailableDiets,
    foodCategories,
    loading: loading || isLoading,
    searchFoodItems,
    searchResults,
    searchQuery,
    setSearchQuery
  };
};
