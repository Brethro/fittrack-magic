
// Export focused food category data for the diet page
import { processRawFoodData } from "@/utils/diet/foodDataProcessing";
import { meatsAndPoultryData } from "./meatData";
import { nutsAndSeedsData } from "./nutsAndSeedsData";
import { FoodCategory } from "@/types/diet";

// Only include the two food categories with our detailed examples
const rawFoodCategoriesData = [
  meatsAndPoultryData,
  nutsAndSeedsData
];

// Process the raw food data to add primaryCategory to each item
export const foodCategoriesData = processRawFoodData(rawFoodCategoriesData);
