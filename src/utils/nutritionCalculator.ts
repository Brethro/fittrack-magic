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
