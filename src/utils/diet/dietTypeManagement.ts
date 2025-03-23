
import { DietType } from "@/types/diet";

// Set to store available diet types
const availableDietTypes = new Set<string>(["all"]);

// Function to add a diet type
export const addDietType = (diet: string): void => {
  availableDietTypes.add(diet);
};

// Function to get available diet types
export const getAvailableDietTypes = (): DietType[] => {
  return Array.from(availableDietTypes) as DietType[];
};

// Function to reset diet types to default
export const resetDietTypes = (): void => {
  availableDietTypes.clear();
  availableDietTypes.add("all");
};

// Function to initialize diet types with a set of defaults
export const initializeDietTypes = (): void => {
  const defaultDietTypes: DietType[] = [
    "all",
    "mediterranean",
    "vegetarian", 
    "vegan",
    "paleo",
    "keto",
    "pescatarian"
  ];
  
  defaultDietTypes.forEach(diet => availableDietTypes.add(diet));
};
