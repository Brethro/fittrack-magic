
// Export focused food category data for the diet page
import { processRawFoodData } from "@/utils/diet/foodDataProcessing";
import { meatsAndPoultryData } from "./meatData";
import { nutsAndSeedsData } from "./nutsAndSeedsData";
import { healthyFatsData } from "./healthyFatsData";
import { spicesAndHerbsData } from "./spicesData";
import { beveragesData } from "./beveragesData";
import { starchyVegetablesData } from "./starchyVegetablesData";
import { otherVegetablesData } from "./otherVegetablesData";
import { greenVegetablesData } from "./greenVegetablesData";
import { plantProteinsData } from "./plantProteinsData";
import { condimentsAndSaucesData } from "./condimentsData";
import { fishAndSeafoodData } from "./seafoodData";
import { breadsAndBreakfastData } from "./breadsData";
import { eggsAndDairyData } from "./dairyData";
import { grainsAndPastasData } from "./grainsData";
import { fruitsData } from "./fruitsData";
import { FoodCategory } from "@/types/diet";

// Include all food categories, regardless of whether they're empty
const rawFoodCategoriesData = [
  meatsAndPoultryData,
  nutsAndSeedsData,
  healthyFatsData,
  spicesAndHerbsData,
  beveragesData,
  starchyVegetablesData,
  otherVegetablesData,
  greenVegetablesData,
  plantProteinsData,
  condimentsAndSaucesData,
  fishAndSeafoodData,
  breadsAndBreakfastData,
  eggsAndDairyData,
  grainsAndPastasData,
  fruitsData
];

// Filter out any categories with empty items arrays
const nonEmptyCategories = rawFoodCategoriesData.filter(
  category => category.items && category.items.length > 0
);

// Process the filtered food data to add primaryCategory to each item
export const foodCategoriesData = processRawFoodData(nonEmptyCategories);
