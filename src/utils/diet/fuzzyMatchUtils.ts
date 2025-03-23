
import { FoodCategory, FoodItem } from "@/types/diet";

// In-memory cache for optimization
let fuzzyMatchCache: Map<string, any> = new Map();

// Function to clear the fuzzy match cache
export const clearFuzzyMatchCache = (): void => {
  fuzzyMatchCache.clear();
};

// Function to fuzzy find a food by name
export const fuzzyFindFood = (query: string, foods: FoodItem[]): FoodItem[] => {
  // Simple implementation returning foods that contain the query string
  return foods.filter(food => 
    food.name.toLowerCase().includes(query.toLowerCase())
  );
};

// Function to identify potential miscategorizations
export const identifyPotentialMiscategorizations = (categories: FoodCategory[]): string[] => {
  const issues: string[] = [];
  
  // Flatten all food items
  const allFoods = categories.flatMap(cat => cat.items);
  
  // Simple check for foods potentially in the wrong category
  allFoods.forEach(food => {
    const name = food.name.toLowerCase();
    const category = food.primaryCategory;
    
    // Example checks
    if (category === "vegetable" && (name.includes("fruit") || name.includes("berry"))) {
      issues.push(`"${food.name}" might be a fruit, not a vegetable`);
    }
    
    if (category === "fruit" && name.includes("vegetable")) {
      issues.push(`"${food.name}" might be a vegetable, not a fruit`);
    }
    
    if (category === "grain" && name.includes("meat")) {
      issues.push(`"${food.name}" contains 'meat' but is categorized as 'grain'`);
    }
  });
  
  return issues;
};
