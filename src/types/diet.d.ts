
export type FoodItem = {
  id: string;
  name: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  caloriesPerServing?: number;
  servingSize: string;
  servingSizeGrams: number;
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
};

export type Meal = {
  id: string;
  name: string;
  foods: MealFood[];
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalCalories: number;
};
