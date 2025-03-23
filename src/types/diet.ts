
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

export interface FoodItem {
  id: string;
  name: string;
  primaryCategory?: string;
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
}

export interface FoodCategory {
  name: string;
  displayName?: string;
  description?: string;
  items: FoodItem[];
}

export interface FoodPrimaryCategory {
  name: string;
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
