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
      
      // Set maximum percentage based on pace
      if (userData.goalPace === "aggressive") {
        maxAdjustPercent = 0.35; // 35% for aggressive pace
      } else if (userData.goalPace === "moderate") {
        maxAdjustPercent = 0.25; // 25% for moderate pace
      } else {
        maxAdjustPercent = 0.15; // 15% for conservative pace
      }
      
      console.log("Using max adjustment percentage for weight gain:", maxAdjustPercent);
      
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
      // Keep existing weight loss logic
      minAdjustPercent = 0.1; // 10% deficit minimum
      maxAdjustPercent = 0.25; // 25% deficit maximum
      
      // Adjust based on body fat percentage and gender for weight loss
      const bodyFatPercentage = userData.bodyFatPercentage || 20; // Default if not available
      const isMale = userData.gender !== 'female';
      
      if (isMale) {
        if (bodyFatPercentage > 25) {
          maxAdjustPercent = 0.30; // Allow 30% deficit for high body fat
        } else if (bodyFatPercentage < 12) {
          maxAdjustPercent = 0.20; // Limit to 20% deficit for low body fat
        }
      } else {
        if (bodyFatPercentage > 32) {
          maxAdjustPercent = 0.30; // Allow 30% deficit for high body fat
        } else if (bodyFatPercentage < 18) {
          maxAdjustPercent = 0.20; // Limit to 20% deficit for low body fat
        }
      }
    }
    
    // Adjust based on goal pace if available
    if (userData.goalPace && !isWeightGain) {
      // Only apply this adjustment to weight loss, for weight gain we use minDailySurplus
      switch (userData.goalPace) {
        case "aggressive": 
          minAdjustPercent += 0.05; // Increase minimum adjustment
          maxAdjustPercent += 0.05; // Increase maximum adjustment
          break;
        case "moderate": 
          // Keep the calculated default
          break;
        case "conservative": 
          minAdjustPercent -= 0.05; // Decrease minimum adjustment
          maxAdjustPercent -= 0.05; // Decrease maximum adjustment
          break;
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
    
    // Ensure the adjustment stays within safe bounds
    calculatedAdjustPercent = Math.max(minAdjustPercent, 
                               Math.min(maxAdjustPercent, calculatedAdjustPercent));
    
    console.log(`Calculated ${isWeightGain ? 'surplus' : 'deficit'} percentage:`, calculatedAdjustPercent);
    console.log(`Final adjustment range: ${minAdjustPercent} to ${maxAdjustPercent}`);
    
    // Calculate daily calories with the percentage-based adjustment
    const dailyCalories = isWeightGain 
      ? Math.round(tdee * (1 + calculatedAdjustPercent))
      : Math.max(Math.round(tdee * (1 - calculatedAdjustPercent)), 1200); // Don't go below 1200 calories for weight loss
    
    // Check if this is a high surplus (over 21%)
    // Changed from 20% to 21% to fix the rounding issue
    if (isWeightGain) {
      // Use floor to handle rounding - this ensures 20.9% won't trigger warning
      const surplusPercentage = Math.floor((dailyCalories - tdee) / tdee * 100);
      if (surplusPercentage >= 21) {
        highSurplusWarning = true;
        console.log("High surplus warning triggered:", surplusPercentage);
        
        // If the surplus is extremely high (over 35%), show a toast warning
        if (surplusPercentage > 35) {
          toast({
            title: "High Caloric Surplus",
            description: "This goal requires a very high caloric surplus which may result in significant fat gain.",
            variant: "destructive"  // Change from "warning" to "destructive"
          });
        }
      }
    }
    
    // Calculate macros
    const bodyFatPercentage = userData.bodyFatPercentage || (userData.gender === 'female' ? 25 : 18); // Default estimate
    const leanBodyMass = weightInKg * (1 - (bodyFatPercentage / 100));
    const isMale = userData.gender !== 'female';
    
    // Protein calculation based on goal and lean body mass
    let proteinPerKgLBM;
    
    if (isWeightGain) {
      // For weight gain (muscle building), protein recommendations are different
      if (isMale) {
        if (bodyFatPercentage > 20) {
          proteinPerKgLBM = 1.8; // Lower protein for higher body fat
        } else if (bodyFatPercentage > 12) {
          proteinPerKgLBM = 2.0; // Moderate protein for moderate body fat
        } else {
          proteinPerKgLBM = 2.2; // Higher protein for lower body fat
        }
      } else {
        if (bodyFatPercentage > 28) {
          proteinPerKgLBM = 1.8; // Lower protein for higher body fat
        } else if (bodyFatPercentage > 20) {
          proteinPerKgLBM = 2.0; // Moderate protein for moderate body fat
        } else {
          proteinPerKgLBM = 2.2; // Higher protein for lower body fat
        }
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
      macros: { protein: proteinGrams, carbs: carbGrams, fats: fatGrams }
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
        }
      }));
    }
    
    // Set flag to indicate calculation was performed
    setHasCalculated(true);
  }, [userData.age, userData.weight, userData.height, userData.activityLevel, 
      userData.useMetric, userData.bodyFatPercentage, userData.gender, 
      userData.goalType, userData.goalValue, userData.goalDate, userData.goalPace, setUserData]);

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
