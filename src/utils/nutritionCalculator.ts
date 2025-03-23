
/**
 * Calculates the Basal Metabolic Rate (BMR) using either the Mifflin-St Jeor or 
 * Katch-McArdle formula depending on available data
 */
export const calculateBMR = (data: {
  weight: number; // weight in kg
  height: number; // height in cm
  age: number;
  gender: 'male' | 'female';
  bodyFatPercentage?: number | null;
}): number => {
  const { weight, height, age, gender, bodyFatPercentage } = data;
  
  // Use Katch-McArdle formula when body fat percentage is available
  if (bodyFatPercentage) {
    // Calculate lean body mass
    const leanBodyMass = weight * (1 - (bodyFatPercentage / 100));
    // Katch-McArdle Formula
    return 370 + (21.6 * leanBodyMass);
  }
  
  // Otherwise use Mifflin-St Jeor Equation based on gender
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

/**
 * Calculates the caloric contribution of each macronutrient
 * based on their gram values.
 * - Protein: 4 calories per gram
 * - Carbohydrates: 4 calories per gram
 * - Fat: 9 calories per gram
 */
export const calculateMacroCalories = (macros: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): {
  protein: number;
  carbs: number;
  fat: number;
  total: number;
} => {
  // Calculate calories from each macro
  const proteinCalories = macros.protein * 4;
  const carbCalories = macros.carbs * 4;
  const fatCalories = macros.fat * 9;
  
  // Calculate total calories from macros
  const totalFromMacros = proteinCalories + carbCalories + fatCalories;
  
  // Use the higher value between provided calories and calculated total
  // This ensures we don't show a misleading total if the macros don't exactly match
  const total = Math.max(macros.calories, totalFromMacros);
  
  return {
    protein: proteinCalories,
    carbs: carbCalories,
    fat: fatCalories,
    total
  };
};
