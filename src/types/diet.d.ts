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
  // Basic Macronutrients
  protein?: number; // in grams
  carbs?: number; // in grams
  fats?: number; // in grams
  caloriesPerServing?: number;
  
  // Detailed Carbohydrate Breakdown
  fiber?: number; // in grams
  sugars?: number; // in grams
  addedSugars?: number; // in grams
  
  // Detailed Fat Breakdown
  saturatedFat?: number; // in grams
  transFat?: number; // in grams
  polyunsaturatedFat?: number; // in grams
  monounsaturatedFat?: number; // in grams
  omega3?: number; // in grams
  omega6?: number; // in grams
  
  // Cholesterol and Sodium
  cholesterol?: number; // in mg
  sodium?: number; // in mg
  
  // Vitamins
  vitaminA?: number; // in mcg
  vitaminC?: number; // in mg
  vitaminD?: number; // in mcg
  vitaminE?: number; // in mg
  vitaminK?: number; // in mcg
  
  // B Vitamins
  vitaminB1?: number; // Thiamin, in mg
  vitaminB2?: number; // Riboflavin, in mg
  vitaminB3?: number; // Niacin, in mg
  vitaminB5?: number; // Pantothenic Acid, in mg
  vitaminB6?: number; // in mg
  vitaminB9?: number; // Folate, in mcg
  vitaminB12?: number; // in mcg
  
  // Minerals
  calcium?: number; // in mg
  iron?: number; // in mg
  potassium?: number; // in mg
  magnesium?: number; // in mg
  zinc?: number; // in mg
  
  // Serving Information
  servingSize: string;
  servingSizeGrams: number;
  servingsPerContainer?: number;
  
  // Categorization and Diet Compatibility
  diets?: string[]; // Diet compatibility tags
  primaryCategory: FoodPrimaryCategory; // Explicit primary category
  secondaryCategories?: FoodPrimaryCategory[]; // Optional secondary categories
};

export type FoodCategory = {
  name: string;
  items: FoodItem[];
  displayName?: string; // Human-readable display name for the category
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
  fiber?: number;
  sugars?: number;
  
  // Optional detailed nutrition info (if available and needed for display)
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  addedSugars?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
};

export type Meal = {
  id: string;
  name: string;
  foods: MealFood[];
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCalories: number;
  totalFiber?: number;
  totalSugars?: number;
  netCarbs?: number; // carbs - fiber
  
  // Additional nutrition totals
  totalSaturatedFat?: number;
  totalTransFat?: number;
  totalCholesterol?: number;
  totalSodium?: number;
  totalVitaminA?: number;
  totalVitaminC?: number;
  totalVitaminD?: number;
  totalCalcium?: number;
  totalIron?: number;
  totalPotassium?: number;
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
