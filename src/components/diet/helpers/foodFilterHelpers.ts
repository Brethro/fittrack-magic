
import { FoodItem, DietType } from "@/types/diet";
import { fuzzyFindFood } from "@/utils/diet/fuzzyMatchUtils";
import { foodBelongsToCategory } from "@/utils/diet/foodCategoryHierarchy";

// Filter food items based on search query and diet compatibility
export const getFilteredItems = (
  items: FoodItem[], 
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  // If search query is 2 or more characters, use fuzzy search
  if (searchQuery.length >= 2) {
    // Filter within the current items only
    const matchedItemIds = new Set(
      fuzzyFindFood(searchQuery, [{ name: "", items }]).map(item => item.id)
    );
    
    // Return items that match the search
    const searchFiltered = items.filter(food => matchedItemIds.has(food.id));
    
    // If "all" diet is selected, no need for additional filtering
    if (selectedDiet === "all") return searchFiltered;
    
    // For specific diets, only show compatible foods
    return searchFiltered.filter(food => 
      food.diets?.includes(selectedDiet) || 
      foodBelongsToCategory(food, selectedDiet as any)
    );
  }
  
  // Default behavior for short search queries
  const searchFiltered = !searchQuery 
    ? items 
    : items.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // If "all" diet is selected, no need for additional filtering
  if (selectedDiet === "all") return searchFiltered;
  
  // For specific diets, only show compatible foods
  return searchFiltered.filter(food => 
    food.diets?.includes(selectedDiet) || 
    foodBelongsToCategory(food, selectedDiet as any)
  );
};
