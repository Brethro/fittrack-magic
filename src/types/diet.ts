
// Minimal types to satisfy dependencies

export type DietType = 
  | "all"
  | "mediterranean" 
  | "vegetarian" 
  | "vegan" 
  | "japanese" 
  | "korean"
  | "mexican" 
  | "italian" 
  | "paleo" 
  | "keto" 
  | "pescatarian"
  | "low-carb"
  | "high-protein"
  | "carnivore"
  | "whole30"
  | "atkins"
  | "zone";

export type FoodPrimaryCategory = 
  | "meat"
  | "redMeat"
  | "poultry"
  | "fish"
  | "seafood"
  | "dairy"
  | "egg"
  | "grain"
  | "legume"
  | "vegetable"
  | "fruit"
  | "nut"
  | "seed"
  | "oil"
  | "sweetener"
  | "herb"
  | "spice"
  | "processedFood"
  | "other";

export interface FoodItem {
  id: string;
  name: string;
  primaryCategory?: FoodPrimaryCategory;
  secondaryCategories?: string[];
  servingSizeGrams?: number;
  servingSize?: string;
  caloriesPerServing?: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugars?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  addedSugars?: number;
  polyunsaturatedFat?: number;
  monounsaturatedFat?: number;
  diets?: string[];
  netCarbs?: number;
}

export interface FoodCategory {
  name: string;
  displayName?: string;
  description?: string;
  items: FoodItem[];
}

export interface FoodPrimaryCategoryInfo {
  name: FoodPrimaryCategory;
  displayName: string;
  description?: string;
}

export interface Meal {
  id: string;
  name: string;
  foods: any[];
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCalories: number;
}

export interface MealPlan {
  id: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}
