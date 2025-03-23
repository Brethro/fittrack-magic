
import { foodCategoriesData } from "@/data/diet";

// DEPRECATED: This component is scheduled for removal in the Open Food Facts API migration
// Direct imports from @/data/diet should be used instead
const FoodData = () => {
  console.warn('FoodData component is deprecated and scheduled for removal');
  return null;
};

// Export the food data
export { foodCategoriesData };
export default FoodData;
