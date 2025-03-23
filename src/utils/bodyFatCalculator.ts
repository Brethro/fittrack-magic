
/**
 * Utility functions for body fat calculations
 */

/**
 * Calculates the body fat percentage based on current weight and estimated fat-free mass
 * This calculation accounts for different rates of weight change
 * 
 * @param currentWeight Current weight in kg or lbs
 * @param currentBodyFat Current body fat percentage
 * @param newWeight New weight in same units as currentWeight
 * @param pace Optional pace parameter ("conservative", "moderate", "aggressive")
 * @returns Estimated body fat percentage at the new weight
 */
export const calculateBodyFatPercentage = (
  currentWeight: number,
  currentBodyFat: number,
  newWeight: number,
  pace?: "conservative" | "moderate" | "aggressive" | null
): number => {
  // Calculate fat-free mass (initial estimation)
  const fatFreeMass = currentWeight * (1 - currentBodyFat / 100);
  
  // Determine if this is weight gain or loss
  const isGain = newWeight > currentWeight;
  
  // Calculate weight change
  const weightChange = Math.abs(newWeight - currentWeight);
  
  // Default to moderate if no pace specified
  const effectivePace = pace || "moderate";
  
  // Apply pace-specific adjustments based on research
  if (isGain) {
    // For weight gain: Adjust muscle-to-fat ratio based on pace
    // Conservative = better muscle:fat ratio (more muscle, less fat)
    // Aggressive = worse muscle:fat ratio (less muscle, more fat)
    
    // First, calculate the baseline new fat mass assuming constant FFM
    const baselineFatMass = newWeight - fatFreeMass;
    
    // Apply pace-specific adjustments to FFM based on research
    let adjustedFatFreeMass = fatFreeMass;
    
    // Different pace factors affect muscle gain potential
    switch (effectivePace) {
      case "conservative":
        // Slower pace allows for better muscle:fat ratio
        // Research shows up to 60-70% of weight gain can be muscle with slow approach
        adjustedFatFreeMass = fatFreeMass + (weightChange * 0.6);
        break;
      case "moderate":
        // Moderate pace results in typical muscle:fat ratio
        // Research suggests 40-50% of weight can be muscle with moderate approach
        adjustedFatFreeMass = fatFreeMass + (weightChange * 0.45);
        break;
      case "aggressive":
        // Faster pace typically results in more fat gain
        // Research shows only 20-30% of weight is muscle with aggressive approach
        adjustedFatFreeMass = fatFreeMass + (weightChange * 0.25);
        break;
      default:
        // Use moderate as default
        adjustedFatFreeMass = fatFreeMass + (weightChange * 0.45);
    }
    
    // Calculate new body fat percentage with adjusted FFM
    // Ensure adjustedFatFreeMass doesn't exceed newWeight (impossible scenario)
    adjustedFatFreeMass = Math.min(adjustedFatFreeMass, newWeight);
    const adjustedFatMass = newWeight - adjustedFatFreeMass;
    const newBodyFat = (adjustedFatMass / newWeight) * 100;
    
    return Math.max(newBodyFat, 0);
  } else {
    // For weight loss: Adjust fat-free mass preservation based on pace
    // Conservative = better muscle preservation (less muscle loss)
    // Aggressive = worse muscle preservation (more muscle loss)
    
    // Apply pace-specific adjustments
    let musclePreservationFactor = 0;
    
    switch (effectivePace) {
      case "conservative":
        // Slower pace allows for better muscle preservation
        // Research shows up to 95% of weight loss can be fat with proper approach
        musclePreservationFactor = 0.05; // only 5% of weight loss is muscle
        break;
      case "moderate":
        // Moderate pace results in some muscle loss
        // Research suggests 10-15% of weight loss is muscle with moderate approach
        musclePreservationFactor = 0.12; // 12% of weight loss is muscle
        break;
      case "aggressive":
        // Faster pace typically results in more muscle loss
        // Research shows 20-30% of weight loss can be muscle with aggressive approach
        musclePreservationFactor = 0.25; // 25% of weight loss is muscle
        break;
      default:
        // Use moderate as default
        musclePreservationFactor = 0.12;
    }
    
    // Calculate muscle loss based on the preservation factor
    const muscleLoss = weightChange * musclePreservationFactor;
    
    // Adjust fat-free mass
    const adjustedFatFreeMass = fatFreeMass - muscleLoss;
    
    // Calculate new body fat percentage with adjusted FFM
    const newBodyFat = 100 * (1 - (adjustedFatFreeMass / newWeight));
    
    return Math.max(newBodyFat, 0);
  }
};

/**
 * Calculates the weight needed to reach a target body fat percentage
 * This assumes fat-free mass remains constant
 * 
 * @param currentWeight Current weight in kg or lbs
 * @param currentBodyFat Current body fat percentage
 * @param targetBodyFat Target body fat percentage
 * @returns Weight needed to reach target body fat
 */
export const calculateWeightForTargetBodyFat = (
  currentWeight: number,
  currentBodyFat: number,
  targetBodyFat: number
): number => {
  // Calculate fat-free mass
  const fatFreeMass = currentWeight * (1 - currentBodyFat / 100);
  
  // Calculate weight needed for target body fat
  return fatFreeMass / (1 - targetBodyFat / 100);
};

