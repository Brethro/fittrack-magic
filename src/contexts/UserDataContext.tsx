
import React, { createContext, useContext, useState, useEffect } from "react";
import { differenceInCalendarDays } from "date-fns";

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

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("fitTrackUserData", JSON.stringify(userData));
  }, [userData]);

  const updateUserData = (data: Partial<UserData>) => {
    console.log("Updating user data with:", data);
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const clearUserData = () => {
    setUserData(initialUserData);
    localStorage.removeItem("fitTrackUserData");
  };

  // Weight log functions
  const addWeightLogEntry = (entry: Omit<WeightLogEntry, "id">) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    setUserData(prev => ({
      ...prev,
      weightLog: [...prev.weightLog, newEntry]
    }));
  };

  const updateWeightLogEntry = (updatedEntry: WeightLogEntry) => {
    setUserData(prev => ({
      ...prev,
      weightLog: prev.weightLog.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    }));
  };

  const deleteWeightLogEntry = (id: string) => {
    setUserData(prev => ({
      ...prev,
      weightLog: prev.weightLog.filter(entry => entry.id !== id)
    }));
  };

  // Function to recalculate nutrition values based on current user data
  const recalculateNutrition = () => {
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
    
    // NEW: Calculate time until goal date to adjust deficit
    const today = new Date();
    const goalDate = new Date(userData.goalDate);
    const daysUntilGoal = Math.max(differenceInCalendarDays(goalDate, today), 1); // At least 1 day
    
    console.log("Days until goal:", daysUntilGoal);
    
    // Calculate weight loss needed
    const startWeight = userData.weight;
    const targetWeight = userData.goalType === "weight" ? 
      userData.goalValue : 
      startWeight * (1 - ((userData.bodyFatPercentage! - userData.goalValue!) / 100));
    
    const weightToLose = startWeight - targetWeight;
    
    // Calculate required caloric deficit
    // 1 kg of fat = 7700 calories, 1 lb of fat = 3500 calories
    const caloriesPerUnit = userData.useMetric ? 7700 : 3500;
    const totalCaloriesDeficit = weightToLose * caloriesPerUnit;
    const dailyDeficit = totalCaloriesDeficit / daysUntilGoal;
    
    console.log("Weight to lose:", weightToLose);
    console.log("Total caloric deficit needed:", totalCaloriesDeficit);
    console.log("Daily deficit needed:", dailyDeficit);
    
    // Determine minimum and maximum safe deficits as percentages of TDEE
    let minDeficitPercent = 0.1; // 10% deficit minimum
    let maxDeficitPercent = 0.25; // 25% deficit maximum
    
    // Adjust based on body fat percentage
    const bodyFatPercentage = userData.bodyFatPercentage || 20; // Default if not available
    const isMale = userData.gender !== 'female';
    
    if (isMale) {
      if (bodyFatPercentage > 25) {
        maxDeficitPercent = 0.30; // Allow 30% deficit for high body fat
      } else if (bodyFatPercentage < 12) {
        maxDeficitPercent = 0.20; // Limit to 20% deficit for low body fat
      }
    } else {
      if (bodyFatPercentage > 32) {
        maxDeficitPercent = 0.30; // Allow 30% deficit for high body fat
      } else if (bodyFatPercentage < 18) {
        maxDeficitPercent = 0.20; // Limit to 20% deficit for low body fat
      }
    }
    
    // Adjust deficit based on goal pace if available
    if (userData.goalPace) {
      switch (userData.goalPace) {
        case "aggressive": 
          minDeficitPercent += 0.05; // Increase minimum deficit
          maxDeficitPercent += 0.05; // Increase maximum deficit
          break;
        case "moderate": 
          // Keep the calculated default
          break;
        case "conservative": 
          minDeficitPercent -= 0.05; // Decrease minimum deficit
          maxDeficitPercent -= 0.05; // Decrease maximum deficit
          break;
      }
    }
    
    // Calculate deficit percentage based on required daily deficit
    let calculatedDeficitPercent = dailyDeficit / tdee;
    
    // Ensure the deficit stays within safe bounds
    calculatedDeficitPercent = Math.max(minDeficitPercent, 
                               Math.min(maxDeficitPercent, calculatedDeficitPercent));
    
    console.log("Calculated deficit percentage:", calculatedDeficitPercent);
    
    // Calculate daily calories with the percentage-based deficit
    const dailyCalories = Math.max(Math.round(tdee * (1 - calculatedDeficitPercent)), 1200); // Don't go below 1200 calories
    
    // Calculate macros
    const leanBodyMass = weightInKg * (1 - (bodyFatPercentage / 100));
    
    // Protein calculation based on body fat percentage and lean body mass
    let proteinPerKgLBM;
    
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
    
    const proteinGrams = Math.round(leanBodyMass * proteinPerKgLBM);
    const proteinCalories = proteinGrams * 4;
    
    // Fat calculation (25% of total calories)
    const fatCalories = Math.round(dailyCalories * 0.25);
    const fatGrams = Math.round(fatCalories / 9);
    
    // Carbs calculation (remaining calories)
    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4);

    console.log("Updated nutrition values:", {
      tdee,
      dailyCalories,
      macros: { protein: proteinGrams, carbs: carbGrams, fats: fatGrams }
    });

    // Update the calculated values
    setUserData(prev => ({
      ...prev,
      tdee,
      dailyCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbGrams,
        fats: fatGrams,
      }
    }));
  };

  return (
    <UserDataContext.Provider value={{ 
      userData, 
      updateUserData, 
      clearUserData, 
      recalculateNutrition,
      addWeightLogEntry,
      updateWeightLogEntry,
      deleteWeightLogEntry
    }}>
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
