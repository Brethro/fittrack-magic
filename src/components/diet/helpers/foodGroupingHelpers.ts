
import { FoodItem } from "@/types/diet";

// Group food items by their primary category
export const groupFoodItemsByCategory = (items: FoodItem[]): Record<string, FoodItem[]> => {
  const groupedItems: Record<string, FoodItem[]> = {};
  
  items.forEach(item => {
    const category = item.primaryCategory;
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });
  
  return groupedItems;
};
