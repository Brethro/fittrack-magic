
// Export all food category data from a single file
import { processRawFoodData } from "@/utils/diet/foodDataProcessing";
import { meatsAndPoultryData } from "./meatData";
import { fishAndSeafoodData } from "./seafoodData";
import { eggsAndDairyData } from "./dairyData";
import { plantProteinsData } from "./plantProteinsData";
import { grainsAndPastasData } from "./grainsData";
import { starchyVegetablesData } from "./starchyVegetablesData";
import { breadsAndBreakfastData } from "./breadsData";
import { greenVegetablesData } from "./greenVegetablesData";
import { otherVegetablesData } from "./otherVegetablesData";
import { fruitsData } from "./fruitsData";
import { nutsAndSeedsData } from "./nutsAndSeedsData";
import { healthyFatsData } from "./healthyFatsData";
import { condimentsAndSaucesData } from "./condimentsData";
import { beveragesData } from "./beveragesData";
import { spicesAndHerbsData } from "./spicesData";

// Combine all raw food data
const rawFoodCategoriesData = [
  meatsAndPoultryData,
  fishAndSeafoodData,
  eggsAndDairyData,
  plantProteinsData,
  grainsAndPastasData,
  starchyVegetablesData,
  breadsAndBreakfastData,
  greenVegetablesData,
  otherVegetablesData,
  fruitsData,
  nutsAndSeedsData,
  healthyFatsData,
  condimentsAndSaucesData,
  beveragesData,
  spicesAndHerbsData
];

// Process the raw food data to add primaryCategory to each item
export const foodCategoriesData = processRawFoodData(rawFoodCategoriesData);
