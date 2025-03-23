/**
 * Utility functions to calculate BMR and TDEE
 */

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
 * Calculate TDEE (Total Daily Energy Expenditure) based on BMR and activity level
 */
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: { [key: string]: number } = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };
  
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

/**
 * Helper function to convert height to centimeters based on units
 */
export const getHeightInCm = (height: number | { feet: number | null; inches: number | null }, useMetric: boolean): number => {
  if (useMetric) {
    return height as number;
  } else {
    const heightObj = height as { feet: number | null; inches: number | null };
    return ((heightObj.feet || 0) * 30.48) + ((heightObj.inches || 0) * 2.54);
  }
};

/**
 * Helper function to convert weight to kilograms based on units
 */
export const getWeightInKg = (weight: number, useMetric: boolean): number => {
  if (useMetric) {
    return weight;
  } else {
    return weight / 2.20462;
  }
};
