import { FoodItem } from "@/types/diet";
import { getFoodByBarcode } from "@/services/openFoodFacts";

/**
 * Update nutrition data for a food item by fetching latest data from Open Food Facts
 */
export const updateFoodNutrition = async (food: FoodItem): Promise<FoodItem> => {
  // Extract barcode from the food ID if it exists
  const barcode = food.id.startsWith('off_') ? food.id.replace('off_', '') : null;
  
  if (!barcode) {
    console.warn("Could not update nutrition data for", food.name, "- no barcode found");
    return food;
  }
  
  try {
    const updatedFood = await getFoodByBarcode(barcode);
    
    if (!updatedFood) {
      console.warn("Could not find updated nutrition data for", food.name);
      return food;
    }
    
    // Merge the updated food data with the original, keeping the original ID and name
    return {
      ...updatedFood,
      id: food.id,
      name: food.name // Keep original name for consistency
    };
  } catch (error) {
    console.error("Error updating food nutrition data:", error);
    return food;
  }
};

/**
 * Update nutrition data for multiple food items
 */
export const batchUpdateFoodNutrition = async (foods: FoodItem[]): Promise<FoodItem[]> => {
  const updatePromises = foods.map(updateFoodNutrition);
  
  try {
    return await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error in batch update of food nutrition data:", error);
    return foods; // Return original foods if update fails
  }
};
