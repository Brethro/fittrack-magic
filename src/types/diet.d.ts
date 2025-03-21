
// Food primary category for explicit categorization
export type FoodPrimaryCategory = 
  | "meat"      // Parent category
  | "redMeat"   // Child of meat
  | "poultry"   // Child of meat
  | "fish"      // Child of meat
  | "seafood"   // Child of meat
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

export type FoodItem = {
  id: string;
  name: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  caloriesPerServing?: number;
  fiber?: number;  // Added fiber content
  sugars?: number; // Added sugars content
  servingSize: string;
  servingSizeGrams: number;
  diets?: string[]; // Diet compatibility tags
  primaryCategory: FoodPrimaryCategory; // Explicit primary category
  secondaryCategories?: FoodPrimaryCategory[]; // Optional secondary categories
};

export type FoodCategory = {
  name: string;
  items: FoodItem[];
};

export type MealFood = {
  id: string;
  name: string;
  servings: number;
  servingSizeGrams: number;
  servingSize: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  fiber?: number;  // Added fiber content
  sugars?: number; // Added sugars content
};

export type Meal = {
  id: string;
  name: string;
  foods: MealFood[];
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCalories: number;
  totalFiber?: number;    // Added total fiber
  totalSugars?: number;   // Added total sugars 
  netCarbs?: number;      // Added net carbs (carbs - fiber)
};

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
  | "pescatarian";
