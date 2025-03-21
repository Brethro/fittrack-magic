
import { FoodPrimaryCategory, DietType, FoodItem } from "@/types/diet";
import { vegetarianRules, vegetarianSpecialRules } from "./vegetarianRules";
import { veganRules, veganSpecialRules } from "./veganRules";
import { pescatarianRules, pescatarianSpecialRules } from "./pescatarianRules";
import { mediterraneanRules, mediterraneanSpecialRules } from "./mediterraneanRules";
import { japaneseRules, japaneseSpecialRules, koreanRules, koreanSpecialRules } from "./asianCuisineRules";
import { mexicanRules, mexicanSpecialRules, italianRules, italianSpecialRules } from "./latinCuisineRules";
import { paleoRules, paleoSpecialRules, ketoRules, ketoSpecialRules } from "./restrictiveDietRules";
import { allDietSpecialRules } from "./allDietRules";

// Combine all diet compatible categories
export const dietCompatibleCategories: Record<Exclude<DietType, "all">, {
  allowedPrimaryCategories: FoodPrimaryCategory[],
  restrictedPrimaryCategories: FoodPrimaryCategory[],
  secondaryCategoryRules?: {
    required?: FoodPrimaryCategory[],
    allowed?: FoodPrimaryCategory[],
    restricted?: FoodPrimaryCategory[]
  }
}> = {
  vegetarian: vegetarianRules,
  vegan: veganRules,
  pescatarian: pescatarianRules,
  mediterranean: mediterraneanRules,
  japanese: japaneseRules,
  korean: koreanRules,
  mexican: mexicanRules,
  italian: italianRules,
  paleo: paleoRules,
  keto: ketoRules
};

// Combine all special case rules
export const specialCaseRules: Record<DietType, (food: FoodItem) => boolean> = {
  all: allDietSpecialRules,
  vegetarian: vegetarianSpecialRules,
  vegan: veganSpecialRules,
  pescatarian: pescatarianSpecialRules,
  mediterranean: mediterraneanSpecialRules,
  japanese: japaneseSpecialRules,
  korean: koreanSpecialRules,
  mexican: mexicanSpecialRules,
  italian: italianSpecialRules,
  paleo: paleoSpecialRules,
  keto: ketoSpecialRules
};
