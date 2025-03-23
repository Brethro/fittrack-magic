import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "@/hooks/use-toast";

export type WeightLogEntry = {
  id: string;
  date: Date;
  weight: number;
};

export type UserData = {
  age: number | null;
  weight: number | null;
  height: { feet: number | null; inches: number | null } | number | null;
  activityLevel: string | null;
  bodyFatPercentage: number | null;
  useMetric: boolean;
  goalType: "weight" | "bodyFat" | null;
  goalValue: number | null;
  goalDate: Date | null;
  goalPace: "conservative" | "moderate" | "aggressive" | null;
  tdee: number | null;
  dailyCalories: number | null;
  gender: "male" | "female" | null;
  macros: {
    protein: number | null;
    carbs: number | null;
    fats: number | null;
  };
  weightLog: WeightLogEntry[];
  isWeightGain?: boolean; // Added isWeightGain flag
  highSurplusWarning?: boolean; // Flag to indicate if the surplus is unusually high
  maxSurplusPercentage?: number; // Store the maximum surplus percentage based on pace
  calculatedDeficitPercentage?: number; // Added to store the actual deficit percentage
};

const initialUserData: UserData = {
  age: null,
  weight: null,
  height: { feet: null, inches: null },
  activityLevel: null,
  bodyFatPercentage: null,
  useMetric: false,
  goalType: null,
  goalValue: null,
  goalDate: null,
  goalPace: null,
  tdee: null,
  dailyCalories: null,
  gender: null,
  macros: {
    protein: null,
    carbs: null,
    fats: null,
  },
  weightLog: [],
  maxSurplusPercentage: null,
};

type UserDataContextType = {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  recalculateNutrition: () => void;
  addWeightLogEntry: (entry: Omit<WeightLogEntry, "id">) => void;
  updateWeightLogEntry: (entry: WeightLogEntry) => void;
  deleteWeightLogEntry: (id: string) => void;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    // Load user data from localStorage if available
    const savedData = localStorage.getItem("fitTrackUserData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Convert goalDate string back to Date object if it exists
      if (parsedData.goalDate) {
        parsedData.goalDate = new Date(parsedData.goalDate);
      }
      
      // Convert weight log dates back to Date objects
      if (parsedData.weightLog) {
        parsedData.weightLog = parsedData.weightLog.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
      } else {
        parsedData.weightLog = [];
      }
      
      return parsedData;
    }
    return initialUserData;
  });
  
  // Flag to track initial calculation
  const [hasCalculated, setHasCalculated] = useState(false);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("fitTrackUserData", JSON.stringify(userData));
    }, 300); // Debounce saving to localStorage to prevent excessive writes
    
    return () => clearTimeout(timeoutId);
  }, [userData]);

  const updateUserData = useCallback((data: Partial<UserData>) => {
    console.log("Updating user data with:", data);
    setUserData((prev) => ({ ...prev, ...data }));
  }, []);

  const clearUserData = useCallback(() => {
    setUserData(initialUserData);
    localStorage.removeItem("fitTrackUserData");
  }, []);

  // Weight log functions with useCallback to prevent unnecessary re-renders
  const addWeightLogEntry = useCallback((entry: Omit<WeightLogEntry, "id">) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    setUserData(prev => ({
      ...prev,
      weightLog: [...prev.weightLog, newEntry]
    }));
  }, []);

  const updateWeightLogEntry = useCallback((updatedEntry: WeightLogEntry) => {
    setUserData(prev => ({
      ...prev,
      weightLog: prev.weightLog.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    }));
  }, []);

  const deleteWeightLogEntry = useCallback((id: string) => {
    setUserData(prev => ({
      ...prev,
      weightLog: prev.weightLog.filter(entry => entry.id !== id)
    }));
  }, []);

  // Calculate macro calorie contributions using our utility
  const recalculateNutrition = useCallback(() => {
    console.log("Recalculating nutrition with data:", userData);
    
    if (!userData.age || !userData.weight || !userData.height || !userData.activityLevel) {
      console.log("Not enough data to recalculate");
      return; // Not enough data to recalculate
    }

    // Get necessary data for calculations
    const heightInCm = userData.useMetric 
      ? userData.height as number
      : ((userData.height as any).feet * 30.48) + ((userData.height as any).inches * 2.54);
    
    const weightInKg = userData.useMetric
      ? userData.weight as number
      : (userData.weight as number) / 2.20462;
    
    const age = userData.age as number;
    
    // Calculate BMR using either Mifflin-St Jeor or Katch-McArdle formula
    let bmr;
    
    if (userData.bodyFatPercentage) {
      // Use Katch-McArdle formula when body fat % is available
      const leanBodyMass = weightInKg * (1 - (userData.bodyFatPercentage / 100));
      bmr = 370 + (21.6 * leanBodyMass);
    } else {
      // Use Mifflin-St Jeor Equation when body fat % is not available
      const gender = userData.gender || 'male';
      
      if (gender === 'male') {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
      } else {
        bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
      }
    }
    
    console.log("Calculated BMR:", bmr);
    
    // Apply activity multiplier
    let activityMultiplier;
    switch (userData.activityLevel) {
      case "sedentary": activityMultiplier = 1.2; break;
      case "light": activityMultiplier = 1.375; break;
      case "moderate": activityMultiplier = 1.55; break;
      case "active": activityMultiplier = 1.725; break;
      case "extreme": activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.2;
    }
    
    const tdee = Math.round(bmr * activityMultiplier);
    console.log("Calculated TDEE:", tdee);
    
    // If we don't have goals, just update TDEE and return
    if (!userData.goalType || !userData.goalValue || !userData.goalDate) {
      setUserData(prev => ({
        ...prev,
        tdee
      }));
      console.log("Updated TDEE only (no goals present)");
      return;
    }
    
    // Calculate time until goal date
    const today = new Date();
    const goalDate = new Date(userData.goalDate);
    const daysUntilGoal = Math.max(differenceInCalendarDays(goalDate, today), 1); // At least 1 day
    
    console.log("Days until goal:", daysUntilGoal);
    
    // Determine if this is a weight gain or weight loss goal
    // For weight goal: compare goal weight directly
    // For body fat goal: calculate target weight and compare
    const startWeight = userData.weight as number;
    let targetWeight: number;
    
    if (userData.goalType === "weight") {
      targetWeight = userData.goalValue as number;
    } else {
      // For body fat goals, calculate the target weight
      const currentBodyFat = userData.bodyFatPercentage as number;
      const goalBodyFat = userData.goalValue as number;
      
      // Calculate lean body mass (remains constant)
      const leanBodyMass = startWeight * (1 - (currentBodyFat / 100));
      
      // Calculate target weight based on goal body fat percentage
      targetWeight = leanBodyMass / (1 - (goalBodyFat / 100));
    }
    
    // Determine if this is weight gain or weight loss
    const isWeightGain = targetWeight > startWeight;
    console.log(`Goal detected: ${isWeightGain ? 'Weight Gain' : 'Weight Loss'}`);
    
    // Calculate weight change needed and caloric adjustment
    const weightDifference = Math.abs(targetWeight - startWeight);
    const caloriesPerUnit = userData.useMetric ? 7700 : 3500; // Calories per kg or lb
    const totalCalorieAdjustment = weightDifference * caloriesPerUnit;
    const dailyCalorieAdjustment = totalCalorieAdjustment / daysUntilGoal;
    
    console.log("Weight difference:", weightDifference);
    console.log("Total calorie adjustment needed:", totalCalorieAdjustment);
    console.log("Daily calorie adjustment needed:", dailyCalorieAdjustment);
    
    // For weight gain goals, establish minimum practical surplus values based on pace
    let minDailySurplus = 0;
    let highSurplusWarning = false;
    
    if (isWeightGain) {
      switch (userData.goalPace) {
        case "aggressive": 
          minDailySurplus = 500; 
          break;
        case "moderate": 
          minDailySurplus = 300; 
          break;
        case "conservative": 
          minDailySurplus = 150; 
          break;
        default: 
          minDailySurplus = 200; // default to a modest surplus
      }
      console.log("Minimum daily surplus based on pace:", minDailySurplus);
    }
    
    // Determine appropriate adjustment percentage based on goal type
    let minAdjustPercent, maxAdjustPercent;
    
    if (isWeightGain) {
      // For weight gain, the maximum allowed percentage depends on the pace
      minAdjustPercent = 0.05; // 5% minimum for very small goals
      
      // Set maximum percentage based on pace or use stored maxSurplusPercentage
      if (userData.maxSurplusPercentage) {
        // Use the stored maximum percentage (converted to decimal)
        maxAdjustPercent = userData.maxSurplusPercentage / 100;
        console.log("Using stored max surplus percentage:", userData.maxSurplusPercentage);
      } else if (userData.goalPace === "aggressive") {
        maxAdjustPercent = 0.20; // Exactly 20% for aggressive pace
      } else if (userData.goalPace === "moderate") {
        maxAdjustPercent = 0.15; // 15% for moderate pace
      } else {
        maxAdjustPercent = 0.10; // 10% for conservative pace
      }
      
      console.log("Using max adjustment percentage for weight gain:", maxAdjustPercent * 100, "%");
      
      // Adjust based on body fat percentage and gender for weight gain
      const bodyFatPercentage = userData.bodyFatPercentage || 15; // Default if not available
      const isMale = userData.gender !== 'female';
      
      if (isMale) {
        if (bodyFatPercentage > 20) {
          // Higher body fat - more conservative with surplus
          maxAdjustPercent = Math.min(maxAdjustPercent, 0.20); 
        } else if (bodyFatPercentage < 10) {
          // Lower body fat - can be more aggressive with surplus
          maxAdjustPercent = Math.min(maxAdjustPercent + 0.05, 0.35);
        }
      } else {
        if (bodyFatPercentage > 28) {
          // Higher body fat - more conservative with surplus
          maxAdjustPercent = Math.min(maxAdjustPercent, 0.20);
        } else if (bodyFatPercentage < 18) {
          // Lower body fat - can be more aggressive with surplus
          maxAdjustPercent = Math.min(maxAdjustPercent + 0.05, 0.35);
        }
      }
    } else {
      // FIXED: Weight loss deficit calculations with proper aggressive pace handling
      // Base deficit percentages - increased to ensure we can hit proper percentages
      minAdjustPercent = 0.1; // 10% deficit minimum
      
      // Set the base maximum percentage based on body fat
      const bodyFatPercentage = userData.bodyFatPercentage || 20;
      const isMale = userData.gender !== 'female';
      
      // Determine the base maximum deficit based on body fat
      if (isMale) {
        if (bodyFatPercentage < 10) {
          maxAdjustPercent = 0.20; // Limit to 20% deficit for very low body fat
        } else if (bodyFatPercentage < 12) {
          maxAdjustPercent = 0.22; // Limit to 22% deficit for low body fat
        } else if (bodyFatPercentage < 15) {
          maxAdjustPercent = 0.25; // Standard 25% for moderate body fat
        } else {
          maxAdjustPercent = 0.30; // Allow 30% deficit for higher body fat
        }
      } else {
        if (bodyFatPercentage < 16) {
          maxAdjustPercent = 0.20; // Limit to 20% deficit for very low body fat (women)
        } else if (bodyFatPercentage < 20) {
          maxAdjustPercent = 0.22; // Limit to 22% deficit for low body fat
        } else if (bodyFatPercentage < 25) {
          maxAdjustPercent = 0.25; // Standard 25% for moderate body fat
        } else {
          maxAdjustPercent = 0.30; // Allow 30% deficit for higher body fat
        }
      }
      
      console.log("Base max deficit percentage before pace adjustment:", maxAdjustPercent * 100);
      
      // Now apply the goal pace adjustment correctly
      if (userData.goalPace) {
        if (userData.goalPace === "aggressive") {
          // For aggressive, we add 5% to the base max - up to absolute cap of 35%
          const aggressiveBonus = 0.05; // 5% additional for aggressive
          maxAdjustPercent = Math.min(maxAdjustPercent + aggressiveBonus, 0.35);
          console.log("Applied aggressive pace bonus: +5%, new max:", maxAdjustPercent * 100);
        } else if (userData.goalPace === "conservative") {
          // For conservative, we reduce by 5-10% depending on the base
          const conservativeReduction = maxAdjustPercent >= 0.25 ? 0.10 : 0.05;
          maxAdjustPercent = Math.max(0.15, maxAdjustPercent - conservativeReduction);
          console.log("Applied conservative reduction:", conservativeReduction * 100, 
                      "%, new max:", maxAdjustPercent * 100);
        }
        // Moderate pace uses the base calculation
      }
      
      // Ensure minimum deficit is appropriate based on pace
      if (userData.goalPace === "aggressive") {
        minAdjustPercent = 0.20; // At least 20% for aggressive
      } else if (userData.goalPace === "moderate") {
        minAdjustPercent = 0.15; // At least 15% for moderate
      } else {
        minAdjustPercent = 0.10; // At least 10% for conservative
      }
    }
    
    // Calculate adjustment percentage based on required daily adjustment
    let calculatedAdjustPercent = dailyCalorieAdjustment / tdee;
    
    if (isWeightGain) {
      // For weight gain, apply minimum practical surplus
      const calculatedSurplus = tdee * calculatedAdjustPercent;
      
      console.log("Calculated daily surplus:", calculatedSurplus);
      console.log("Minimum required surplus:", minDailySurplus);
      
      // If calculated surplus is less than minimum, adjust the percentage
      if (calculatedSurplus < minDailySurplus) {
        calculatedAdjustPercent = minDailySurplus / tdee;
        console.log("Adjusting to minimum practical surplus percentage:", calculatedAdjustPercent);
      }
      
      // Handle edge case where goal is extremely close to current weight
      if (weightDifference < 0.5) { // less than 0.5 pounds/kg difference
        console.log("Edge case: very small weight difference detected");
        // Even for tiny goals, ensure some minimal progress
        const modestSurplus = tdee * 0.05; // 5% surplus
        const dailySurplusFloor = Math.min(minDailySurplus, modestSurplus);
        
        calculatedAdjustPercent = dailySurplusFloor / tdee;
        console.log("Adjusted to modest surplus for small goal:", dailySurplusFloor);
      }
    }
    
    // CRITICAL FIX: Hard cap the calculated adjustment to the maximum percentage
    // This ensures we never exceed the maximum percentage for the selected pace
    calculatedAdjustPercent = Math.max(minAdjustPercent, 
                              Math.min(maxAdjustPercent, calculatedAdjustPercent));
    
    console.log(`Calculated ${isWeightGain ? 'surplus' : 'deficit'} percentage:`, calculatedAdjustPercent * 100);
    console.log(`Final adjustment range: ${minAdjustPercent * 100}% to ${maxAdjustPercent * 100}%`);
    
    // Calculate daily calories with the percentage-based adjustment
    let dailyCalories;
    if (isWeightGain) {
      // Calculate the exact maximum calories based on the max percentage
      const maxCalories = Math.floor(tdee * (1 + maxAdjustPercent));
      
      // Calculate based on the adjusted percentage, but never exceed max calories
      dailyCalories = Math.min(
        Math.floor(tdee * (1 + calculatedAdjustPercent)),
        maxCalories
      );
      
      // Final verification to ensure we're not exceeding the maximum percentage
      // This will guarantee we never go above the specified maximum
      const finalSurplusPercentage = ((dailyCalories - tdee) / tdee) * 100;
      
      // If somehow we're still over the max percentage, force it to max
      if (finalSurplusPercentage > maxAdjustPercent * 100) {
        dailyCalories = Math.floor(tdee * (1 + maxAdjustPercent));
        console.log("Applied final correction to ensure exact max percentage:", maxAdjustPercent * 100);
      }
    } else {
      // Weight loss calculation - BUGFIX: Apply correct percentage
      // First calculate calories based on the deficit percentage
      dailyCalories = Math.round(tdee * (1 - calculatedAdjustPercent));
      
      // Then enforce a minimum calorie floor (never go below 1200 calories regardless of deficit)
      dailyCalories = Math.max(1200, dailyCalories);
      
      // If this adjustment pushed us below our calculated percentage, recalculate the actual percentage
      const actualDeficitPercentage = (tdee - dailyCalories) / tdee;
      
      // Debug logging for weight loss calculations
      console.log("Weight loss calculation - debug info:");
      console.log("TDEE:", tdee);
      console.log("Target deficit percent:", calculatedAdjustPercent * 100, "%");
      console.log("Calculated daily calories:", dailyCalories);
      console.log("Actual deficit percentage:", actualDeficitPercentage * 100, "%");
      
      // Store the actual deficit percentage for UI display
      calculatedAdjustPercent = actualDeficitPercentage;
    }

    // Calculate exact surplus percentage for verification
    if (isWeightGain) {
      const exactSurplusPercentage = ((dailyCalories - tdee) / tdee) * 100;
      console.log("Final exact surplus percentage:", exactSurplusPercentage);
      
      // Only show warning if we truly exceed max percentage (should never happen now)
      // Using a small buffer (20.01 instead of 20) to account for potential floating point errors
      const maxPercentageForWarning = userData.maxSurplusPercentage 
        ? userData.maxSurplusPercentage + 0.01 
        : 20.01;
        
      if (exactSurplusPercentage > maxPercentageForWarning) {
        highSurplusWarning = true;
        console.log("High surplus warning triggered:", exactSurplusPercentage);
        
        // If the surplus is extremely high (over 35%), show a toast warning
        if (exactSurplusPercentage > 35) {
          toast({
            title: "High Caloric Surplus",
            description: "This goal requires a very high caloric surplus which may result in significant fat gain.",
            variant: "destructive"
          });
        }
      }
    }
    
    // Calculate macros
    const bodyFatPercentage = userData.bodyFatPercentage || (userData.gender === 'female' ? 25 : 18); // Default estimate
    const leanBodyMass = weightInKg * (1 - (bodyFatPercentage / 100));
    const isMale = userData.gender !== 'female';
    
    // UPDATED: Protein calculation based on goal and lean body mass
    let proteinPerKgLBM;
    
    if (isWeightGain) {
      // UPDATED: For weight gain (muscle building), protein recommendations increased
      if (isMale) {
        if (bodyFatPercentage > 20) {
          proteinPerKgLBM = 2.2; // Increased from 1.8 for higher body fat
        } else if (bodyFatPercentage > 12) {
          proteinPerKgLBM = 2.4; // Increased from 2.0 for moderate body fat
        } else {
          proteinPerKgLBM = 2.6; // Increased from 2.2 for lower body fat
        }
      } else {
        if (bodyFatPercentage > 28) {
          proteinPerKgLBM = 2.2; // Increased from 1.8 for higher body fat
        } else if (bodyFatPercentage > 20) {
          proteinPerKgLBM = 2.4; // Increased from 2.0 for moderate body fat
        } else {
          proteinPerKgLBM = 2.6; // Increased from 2.2 for lower body fat
        }
      }
      
      // For aggressive bulks, provide even more protein
      if (userData.goalPace === "aggressive") {
        proteinPerKgLBM += 0.2; // Additional protein for aggressive bulking
      }
    } else {
      // For weight loss, keep the existing higher protein recommendations
      if (isMale) {
        if (bodyFatPercentage > 25) {
          proteinPerKgLBM = 1.8; // 1.6-2.0 g/kg LBM for high body fat
        } else if (bodyFatPercentage > 15) {
          proteinPerKgLBM = 2.2; // 2.0-2.4 g/kg LBM for moderate body fat
        } else {
          proteinPerKgLBM = 2.4; // 2.2-2.6 g/kg LBM for low body fat
        }
      } else {
        if (bodyFatPercentage > 32) {
          proteinPerKgLBM = 1.8; // 1.6-2.0 g/kg LBM for high body fat
        } else if (bodyFatPercentage > 23) {
          proteinPerKgLBM = 2.2; // 2.0-2.4 g/kg LBM for moderate body fat
        } else {
          proteinPerKgLBM = 2.4; // 2.2-2.6 g/kg LBM for low body fat
        }
      }
    }
    
    const proteinGrams = Math.round(leanBodyMass * proteinPerKgLBM);
    const proteinCalories = proteinGrams * 4;
    
    // Fat calculation (different for weight gain vs loss)
    let fatPercentage;
    if (isWeightGain) {
      fatPercentage = 0.30; // Higher fat for weight gain (hormonal support)
    } else {
      fatPercentage = 0.25; // Lower fat for weight loss
    }
    
    const fatCalories = Math.round(dailyCalories * fatPercentage);
    const fatGrams = Math.round(fatCalories / 9);
    
    // Carbs calculation (remaining calories)
    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4);

    // Calculate estimated time to reach goal based on actual daily surplus/deficit
    const actualDailyCalorieAdjustment = isWeightGain ? 
      (dailyCalories - tdee) : (tdee - dailyCalories);
    
    const estimatedDaysToGoal = Math.ceil(totalCalorieAdjustment / actualDailyCalorieAdjustment);
    
    console.log("Updated nutrition values:", {
      tdee,
      dailyCalories,
      isWeightGain,
      highSurplusWarning,
      actualDailyCalorieAdjustment,
      estimatedDaysToGoal,
      macros: { protein: proteinGrams, carbs: carbGrams, fats: fatGrams },
      calculatedAdjustPercent: calculatedAdjustPercent * 100
    });

    // Update the calculated values
    // Only update if values have actually changed to prevent infinite loops
    const hasChanged = 
      userData.tdee !== tdee ||
      userData.dailyCalories !== dailyCalories ||
      userData.macros.protein !== proteinGrams ||
      userData.macros.carbs !== carbGrams ||
      userData.macros.fats !== fatGrams ||
      userData.isWeightGain !== isWeightGain ||
      userData.highSurplusWarning !== highSurplusWarning;
      
    if (hasChanged) {
      setUserData(prev => ({
        ...prev,
        tdee,
        dailyCalories,
        isWeightGain,
        highSurplusWarning,
        macros: {
          protein: proteinGrams,
          carbs: carbGrams,
          fats: fatGrams,
        },
        // Store the actual calculated percentage for display purposes
        calculatedDeficitPercentage: isWeightGain ? null : calculatedAdjustPercent * 100
      }));
    }
    
    // Set flag to indicate calculation was performed
    setHasCalculated(true);
  }, [userData.age, userData.weight, userData.height, userData.activityLevel, 
      userData.useMetric, userData.bodyFatPercentage, userData.gender, 
      userData.goalType, userData.goalValue, userData.goalDate, userData.goalPace, userData.maxSurplusPercentage, setUserData]);

  // Create a stable context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    userData, 
    updateUserData, 
    clearUserData, 
    recalculateNutrition,
    addWeightLogEntry,
    updateWeightLogEntry,
    deleteWeightLogEntry
  }), [
    userData, 
    updateUserData, 
    clearUserData, 
    recalculateNutrition,
    addWeightLogEntry,
    updateWeightLogEntry,
    deleteWeightLogEntry
  ]);

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
