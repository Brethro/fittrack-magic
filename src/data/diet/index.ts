
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

// Include all available food categories
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

// Process the raw food data to add primaryCategory to each item
export const foodCategoriesData = processRawFoodData(rawFoodCategoriesData);
