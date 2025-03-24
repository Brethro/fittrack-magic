
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useNutritionCalculator } from "@/hooks/useNutritionCalculator";
import { useWeightLog } from "@/hooks/useWeightLog";

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
  isWeightGain?: boolean;
  highSurplusWarning?: boolean;
  isTimelineDriven?: boolean;
  maxSurplusPercentage?: number;
  calculatedDeficitPercentage?: number;
  calculatedSurplusPercentage?: number;
  userSetGoalDate?: boolean; // New property to track if user manually set the date
  goalCustomDate?: Date | null; // Store the original user-set date
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
  userSetGoalDate: false,
  goalCustomDate: null,
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
      try {
        const parsedData = JSON.parse(savedData);
        
        // Convert goalDate string back to Date object if it exists
        if (parsedData.goalDate) {
          parsedData.goalDate = new Date(parsedData.goalDate);
        }
        
        // Convert goalCustomDate string back to Date object if it exists
        if (parsedData.goalCustomDate) {
          parsedData.goalCustomDate = new Date(parsedData.goalCustomDate);
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
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("fitTrackUserData");
        return initialUserData;
      }
    }
    return initialUserData;
  });
  
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

  // Use our custom hooks
  const { recalculateNutrition } = useNutritionCalculator(userData, updateUserData);
  
  const { 
    addWeightLogEntry, 
    updateWeightLogEntry, 
    deleteWeightLogEntry 
  } = useWeightLog(userData.weightLog, updateUserData);

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
