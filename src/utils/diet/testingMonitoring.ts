
import { FoodItem } from "@/types/diet";

// Simple console logging for categorization events
export const logCategorizationEvent = (
  food: FoodItem, 
  category: string, 
  confidence: number = 1.0
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`FOOD CATEGORIZATION: "${food.name}" assigned to "${category}" (confidence: ${confidence})`);
  }
};

// Simple console logging for error events
export const logErrorEvent = (
  type: string,
  message: string,
  details?: any
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`ERROR (${type}): ${message}`, details || '');
  }
};

// Function to track food categorization statistics
export const trackCategorizationStats = (
  foods: FoodItem[]
): Record<string, number> => {
  const stats: Record<string, number> = {};
  
  foods.forEach(food => {
    const category = food.primaryCategory || 'uncategorized';
    stats[category] = (stats[category] || 0) + 1;
  });
  
  return stats;
};
