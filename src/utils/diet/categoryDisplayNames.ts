
import { FoodPrimaryCategory } from "@/types/diet";

// Map technical category names to human-readable display names
export const categoryDisplayNames: Record<FoodPrimaryCategory, string> = {
  meat: "Meats",
  redMeat: "Red Meats",
  poultry: "Poultry",
  fish: "Fish",
  seafood: "Seafood",
  shellfish: "Shellfish",
  dairy: "Dairy Products",
  egg: "Eggs",
  grain: "Grains",
  legume: "Legumes",
  vegetable: "Vegetables",
  fruit: "Fruits",
  nut: "Nuts",
  seed: "Seeds",
  oil: "Oils",
  sweetener: "Sweeteners",
  herb: "Herbs",
  spice: "Spices",
  processedFood: "Processed Foods",
  other: "Other Foods"
};
