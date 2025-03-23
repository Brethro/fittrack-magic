
import { FoodItem, DietType } from "@/types/diet";
import { itemMatchesQuery } from "@/utils/diet/foodSearchUtils";

// Filter food items based on search query and selected diet
export const getFilteredItems = (
  items: FoodItem[],
  searchQuery: string,
  selectedDiet: DietType
): FoodItem[] => {
  // Start with all items
  let filteredItems = [...items];
  
  // Filter by diet if not "all"
  if (selectedDiet !== "all") {
    filteredItems = filteredItems.filter(item => 
      (item.diets?.includes(selectedDiet)) ||
      // If no diet data, include item when diet=all
      (!item.diets || item.diets.length === 0)
    );
  }
  
  // Filter by search query if it exists and has 2+ characters
  if (searchQuery && searchQuery.length >= 2) {
    filteredItems = filteredItems.filter(item => itemMatchesQuery(item, searchQuery));
  }
  
  return filteredItems;
};
