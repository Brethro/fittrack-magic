
export type DietType = 
  | "all" 
  | "mediterranean" 
  | "vegetarian" 
  | "vegan" 
  | "paleo" 
  | "keto" 
  | "pescatarian";

export type FoodPrimaryCategory = 
  | "meat"
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
  primaryCategory: FoodPrimaryCategory;
  secondaryCategories?: string[];
  servingSize?: string;
  servingSizeGrams?: number;
  caloriesPerServing?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugars?: number;
  saturatedFat?: number;
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
  diets?: string[];
  servings?: number;
  netCarbs?: number;
}

export interface FoodCategory {
  name: string;
  displayName: string;
  items: FoodItem[];
}

export interface Meal {
  id: string;
  name: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface MealPlan {
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface FoodSearchOptions {
  query: string;
  dietType?: DietType;
  categories?: FoodPrimaryCategory[];
  page?: number;
  pageSize?: number;
}

export interface NutritionGoals {
  dailyCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
}

export interface DietPreferences {
  selectedDiet: DietType;
  excludedCategories: FoodPrimaryCategory[];
  includeFreeMeal: boolean;
}
