
import React, { createContext, useContext, useState, useEffect } from "react";

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
};

type UserDataContextType = {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  recalculateNutrition: () => void;
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
      
      return parsedData;
    }
    return initialUserData;
  });

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("fitTrackUserData", JSON.stringify(userData));
  }, [userData]);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const clearUserData = () => {
    setUserData(initialUserData);
    localStorage.removeItem("fitTrackUserData");
  };

  // New function to recalculate nutrition values based on current user data
  const recalculateNutrition = () => {
    console.log("Recalculating nutrition with data:", userData);
    
    if (!userData.age || !userData.weight || !userData.height || !userData.activityLevel) {
      console.log("Not enough data to recalculate");
      return; // Not enough data to recalculate
    }

    // If we don't have goal information, we can still calculate TDEE but not deficit
    const hasGoals = userData.goalValue !== null && userData.goalDate !== null;
    
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
    if (!hasGoals) {
      setUserData(prev => ({
        ...prev,
        tdee
      }));
      console.log("Updated TDEE only (no goals present)");
      return;
    }
    
    // Determine optimal caloric deficit based on body fat percentage
    let calorieDeficitPercentage;
    const bodyFatPercentage = userData.bodyFatPercentage || 20; // Default if not available
    const isMale = userData.gender !== 'female';
    
    if (isMale) {
      if (bodyFatPercentage > 25) {
        calorieDeficitPercentage = 0.25; // 25% deficit for high body fat
      } else if (bodyFatPercentage > 15) {
        calorieDeficitPercentage = 0.2; // 20% deficit for moderate body fat
      } else {
        calorieDeficitPercentage = 0.15; // 15% deficit for low body fat
      }
    } else {
      if (bodyFatPercentage > 32) {
        calorieDeficitPercentage = 0.25; // 25% deficit for high body fat
      } else if (bodyFatPercentage > 23) {
        calorieDeficitPercentage = 0.2; // 20% deficit for moderate body fat
      } else {
        calorieDeficitPercentage = 0.15; // 15% deficit for low body fat
      }
    }
    
    // Adjust deficit based on goal pace if available
    if (userData.goalPace) {
      switch (userData.goalPace) {
        case "aggressive": 
          calorieDeficitPercentage += 0.05; // Increase deficit by 5%
          break;
        case "moderate": 
          // Keep the calculated default
          break;
        case "conservative": 
          calorieDeficitPercentage -= 0.05; // Decrease deficit by 5%
          break;
      }
    }
    
    console.log("Calorie deficit percentage:", calorieDeficitPercentage);
    
    // Calculate daily calories with the percentage-based deficit
    const dailyCalories = Math.max(Math.round(tdee * (1 - calorieDeficitPercentage)), 1200); // Don't go below 1200 calories
    
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
    <UserDataContext.Provider value={{ userData, updateUserData, clearUserData, recalculateNutrition }}>
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
