
import { DietType } from "@/types/diet";

// Get all available diet types
export const getAllDietTypes = (): DietType[] => {
  return [
    "all",
    "mediterranean",
    "vegetarian",
    "vegan",
    "paleo",
    "keto",
    "pescatarian",
    "japanese",
    "korean",
    "mexican",
    "italian",
    "low-carb",
    "high-protein",
    "carnivore",
    "whole30",
    "atkins",
    "zone"
  ];
};

// Get diet type display names
export const getDietDisplayName = (dietType: DietType): string => {
  const displayNames: Record<DietType, string> = {
    all: "All Foods",
    mediterranean: "Mediterranean Diet",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    paleo: "Paleo",
    keto: "Ketogenic",
    pescatarian: "Pescatarian",
    japanese: "Japanese",
    korean: "Korean",
    mexican: "Mexican",
    italian: "Italian",
    "low-carb": "Low Carb",
    "high-protein": "High Protein",
    carnivore: "Carnivore",
    whole30: "Whole30",
    atkins: "Atkins",
    zone: "Zone Diet"
  };
  
  return displayNames[dietType] || dietType;
};

// Get diet type descriptions
export const getDietDescription = (dietType: DietType): string => {
  const descriptions: Record<DietType, string> = {
    all: "No restrictions, includes all food types.",
    mediterranean: "Emphasizes plant-based foods, healthy fats, and fish.",
    vegetarian: "Excludes meat, poultry, and seafood but includes dairy and eggs.",
    vegan: "Excludes all animal products including meat, dairy, eggs, and honey.",
    paleo: "Based on foods similar to what might have been eaten during the Paleolithic era.",
    keto: "Very low in carbs, moderate in protein, and high in fat.",
    pescatarian: "Excludes meat and poultry but includes fish and seafood.",
    japanese: "Emphasizes seafood, rice, vegetables, and fermented foods.",
    korean: "Rich in vegetables, meats, and fermented foods.",
    mexican: "Features beans, corn, rice, and a variety of herbs and spices.",
    italian: "Emphasizes olive oil, pasta, tomatoes, and fresh ingredients.",
    "low-carb": "Restricts carbohydrates, especially refined carbs.",
    "high-protein": "Higher protein intake for muscle building and satiety.",
    carnivore: "Consists entirely of animal products, excluding plants.",
    whole30: "Eliminates sugar, alcohol, grains, legumes, and dairy for 30 days.",
    atkins: "Restricts carbs while emphasizing protein and fats.",
    zone: "Balances macronutrients in a 40:30:30 ratio of carbs, protein, and fat."
  };
  
  return descriptions[dietType] || "";
};

// Calculate compatibility score between diets
export const getDietCompatibilityScore = (diet1: DietType, diet2: DietType): number => {
  if (diet1 === diet2) return 1.0;
  if (diet1 === "all" || diet2 === "all") return 1.0;
  
  // Define compatibility matrix between diets (0.0 - 1.0)
  const compatibilityMatrix: Record<DietType, Partial<Record<DietType, number>>> = {
    vegan: {
      vegetarian: 0.8,
      mediterranean: 0.6,
      pescatarian: 0.5,
      "whole30": 0.4,
      paleo: 0.3,
      "low-carb": 0.3,
      keto: 0.2,
      carnivore: 0.0
    },
    vegetarian: {
      pescatarian: 0.8,
      mediterranean: 0.7,
      "low-carb": 0.5,
      paleo: 0.3,
      keto: 0.3,
      carnivore: 0.0
    },
    // ... more compatibility rules for other diet types ...
  };
  
  if (compatibilityMatrix[diet1]?.[diet2]) {
    return compatibilityMatrix[diet1][diet2]!;
  }
  
  if (compatibilityMatrix[diet2]?.[diet1]) {
    return compatibilityMatrix[diet2][diet1]!;
  }
  
  // Default moderate compatibility
  return 0.5;
};
