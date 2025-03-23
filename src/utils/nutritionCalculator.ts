
/**
 * Nutrition Calculator Utility
 * 
 * A collection of pure utility functions for nutrition calculations:
 * - Converting between different serving sizes and units
 * - Calculating macro distributions
 * - Standardizing nutrition values
 */

// Unit conversion constants
export const UNIT_CONVERSIONS = {
  // Weight conversions to grams
  g: 1,
  kg: 1000,
  oz: 28.35,
  lb: 453.592,
  
  // Volume conversions (approximate to ml)
  ml: 1,
  l: 1000,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  "fl oz": 29.57,
  pint: 473.176,
  quart: 946.353,
};

export type NutritionValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugars?: number;
  [key: string]: number | undefined;
};

export type ServingInfo = {
  amount: number;
  unit: string;
};

/**
 * Convert a serving amount to standard units (g or ml)
 */
export const convertToStandardUnit = (amount: number, unit: string): number => {
  const lowerUnit = unit.toLowerCase();
  const conversionFactor = UNIT_CONVERSIONS[lowerUnit as keyof typeof UNIT_CONVERSIONS] || 1;
  return amount * conversionFactor;
};

/**
 * Convert between serving sizes
 */
export const convertServingSize = (
  nutritionValues: NutritionValues,
  currentServing: ServingInfo,
  targetServing: ServingInfo
): NutritionValues => {
  // Convert both servings to standard units
  const currentStandardAmount = convertToStandardUnit(currentServing.amount, currentServing.unit);
  const targetStandardAmount = convertToStandardUnit(targetServing.amount, targetServing.unit);
  
  // Calculate conversion ratio
  const conversionRatio = targetStandardAmount / currentStandardAmount;
  
  // Create new nutrition values
  const result: NutritionValues = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  
  // Apply ratio to all nutrition values
  Object.entries(nutritionValues).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = parseFloat((value * conversionRatio).toFixed(1));
    }
  });
  
  return result;
};

/**
 * Calculate macro percentages based on calories
 */
export const calculateMacroPercentages = (nutritionValues: NutritionValues): {
  protein: number;
  carbs: number;
  fat: number;
} => {
  const proteinCalories = nutritionValues.protein * 4;
  const carbsCalories = nutritionValues.carbs * 4;
  const fatCalories = nutritionValues.fat * 9;
  
  const totalCalories = proteinCalories + carbsCalories + fatCalories;
  
  if (totalCalories === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    carbs: Math.round((carbsCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100),
  };
};

/**
 * Calculate per-macro calories
 */
export const calculateMacroCalories = (nutritionValues: NutritionValues): {
  protein: number;
  carbs: number;
  fat: number;
  total: number;
} => {
  const proteinCalories = Math.round(nutritionValues.protein * 4);
  const carbsCalories = Math.round(nutritionValues.carbs * 4);
  const fatCalories = Math.round(nutritionValues.fat * 9);
  
  return {
    protein: proteinCalories,
    carbs: carbsCalories,
    fat: fatCalories,
    total: proteinCalories + carbsCalories + fatCalories,
  };
};

/**
 * Calculate nutrition values from 100g reference to custom serving
 */
export const calculateNutritionFromBaseServing = (
  baseNutrition: NutritionValues,
  amount: number,
  unit: string
): NutritionValues => {
  // Convert to standard unit (g or ml) for calculation
  const standardAmount = convertToStandardUnit(amount, unit);
  
  // Calculate multiplier based on 100g/ml standard
  const multiplier = standardAmount / 100;
  
  const result: NutritionValues = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  
  // Apply multiplier to all nutrition values
  Object.entries(baseNutrition).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'calories') {
        result[key] = Math.round(value * multiplier);
      } else {
        result[key] = parseFloat((value * multiplier).toFixed(1));
      }
    }
  });
  
  return result;
};

/**
 * Format nutrition value with appropriate precision
 */
export const formatNutritionValue = (value: number, type: string): string => {
  if (type === 'calories') {
    return Math.round(value).toString();
  } else {
    return value.toFixed(1);
  }
};

/**
 * Determine if a unit is a volume measurement
 */
export const isVolumeUnit = (unit: string): boolean => {
  const volumeUnits = ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart'];
  return volumeUnits.includes(unit.toLowerCase());
};

/**
 * Calculate daily nutrient percentage
 * @param nutrientValue Current value of the nutrient
 * @param dailyValue Recommended daily value
 */
export const calculateDailyPercentage = (nutrientValue: number, dailyValue: number): number => {
  if (!dailyValue) return 0;
  return Math.round((nutrientValue / dailyValue) * 100);
};

/**
 * Get common serving size units appropriate for a food type
 */
export const getCommonUnitsForFoodType = (foodCategory: string): string[] => {
  const allUnits = ['g', 'oz'];
  
  // Add volume-based units for liquids
  const liquidCategories = ['beverage', 'drink', 'milk', 'juice', 'water', 'soup', 'sauce'];
  if (liquidCategories.some(category => foodCategory.toLowerCase().includes(category))) {
    return ['ml', 'fl oz', 'cup', 'tbsp'];
  }
  
  // Add typical units for grains/cereals
  const grainCategories = ['cereal', 'grain', 'pasta', 'rice', 'bread'];
  if (grainCategories.some(category => foodCategory.toLowerCase().includes(category))) {
    return [...allUnits, 'cup'];
  }
  
  return allUnits;
};
