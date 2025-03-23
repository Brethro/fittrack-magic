
// Basic diet types used throughout the application
export type DietType = 
  | "all" 
  | "mediterranean" 
  | "vegetarian" 
  | "vegan" 
  | "paleo" 
  | "keto" 
  | "pescatarian"
  | "japanese"
  | "korean"
  | "mexican"
  | "italian"
  | "low-carb"
  | "high-protein"
  | "carnivore"
  | "whole30"
  | "atkins"
  | "zone";

// Primary food categories
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

// Food item interface
export interface FoodItem {
  id: string;
  name: string;
  primaryCategory: FoodPrimaryCategory;
  secondaryCategories?: FoodPrimaryCategory[];
  servingSizeGrams?: number;
  servingSize?: string;
  caloriesPerServing?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugars?: number;
  addedSugars?: number;
  saturatedFat?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  zinc?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  diets?: DietType[];
  servings?: number;
  netCarbs?: number;
  calories?: number;
}

// Food category interface
export interface FoodCategory {
  name: string;
  displayName: string;
  items: FoodItem[];
}

// Meal interface
export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

// Meal plan interface
export interface MealPlan {
  id: string;
  name: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}
