
import { foodCategoriesData } from "@/data/diet";

/**
 * @deprecated - This component is scheduled for removal in the Open Food Facts API migration
 * 
 * Direct imports from @/data/diet should be used instead.
 * This component will be replaced by the Open Food Facts API integration.
 */
const FoodData = () => {
  console.warn('FoodData component is deprecated and will be removed in future versions');
  return null;
};

// Export the food data
export { foodCategoriesData };
export default FoodData;
