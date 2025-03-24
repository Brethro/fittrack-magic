
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUserData } from "./UserDataContext";
import { format } from "date-fns";

// Food log entry type
export type FoodLogEntry = {
  id: string;
  foodName: string;
  amount: number;
  unit: string;
  date: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugars?: number;
    [key: string]: number | undefined;
  };
  source?: "usda" | "openfoodfacts" | "custom";
  sourceId?: string;
};

// Daily nutritional totals type
export type DailyNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
};

// Food log context type
type FoodLogContextType = {
  foodLog: FoodLogEntry[];
  foodEntries: FoodLogEntry[]; // Add foodEntries to the context type
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  addFoodEntry: (entry: Omit<FoodLogEntry, "id">) => void;
  updateFoodEntry: (entry: FoodLogEntry) => void;
  deleteFoodEntry: (id: string) => void;
  getDailyFoodLog: (date?: Date) => FoodLogEntry[];
  getDailyTotals: (date?: Date) => DailyNutrition;
  getRemainingNutrition: (date?: Date) => DailyNutrition;
};

// Create context
const FoodLogContext = createContext<FoodLogContextType | undefined>(undefined);

// Provider component
export const FoodLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Make sure useUserData is properly wrapped in its provider
  let userData;
  try {
    const userDataContext = useUserData();
    userData = userDataContext.userData;
  } catch (error) {
    console.error("Error using UserData context:", error);
    // Provide default values when UserDataContext is not available
    userData = {
      dailyCalories: 2000,
      macros: {
        protein: 100,
        carbs: 200,
        fats: 65
      }
    };
  }

  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Load food log from localStorage on initial render
  useEffect(() => {
    const savedLog = localStorage.getItem("fitTrackFoodLog");
    if (savedLog) {
      try {
        const parsedLog = JSON.parse(savedLog);
        // Convert date strings back to Date objects
        const logWithDates = parsedLog.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        setFoodLog(logWithDates);
      } catch (error) {
        console.error("Error parsing food log:", error);
        setFoodLog([]);
      }
    }
  }, []);

  // Save food log to localStorage whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("fitTrackFoodLog", JSON.stringify(foodLog));
    }, 300); // Debounce saving to localStorage
    
    return () => clearTimeout(timeoutId);
  }, [foodLog]);

  // Add a new food entry to the log
  const addFoodEntry = useCallback((entry: Omit<FoodLogEntry, "id">) => {
    const newEntry: FoodLogEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    setFoodLog(prev => [...prev, newEntry]);
  }, []);

  // Update an existing food entry
  const updateFoodEntry = useCallback((updatedEntry: FoodLogEntry) => {
    setFoodLog(prev => 
      prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
    );
  }, []);

  // Delete a food entry
  const deleteFoodEntry = useCallback((id: string) => {
    setFoodLog(prev => prev.filter(entry => entry.id !== id));
  }, []);

  // Get food log entries for a specific date
  const getDailyFoodLog = useCallback((date: Date = currentDate) => {
    const dateString = format(date, "yyyy-MM-dd");
    
    return foodLog.filter(entry => {
      const entryDateString = format(new Date(entry.date), "yyyy-MM-dd");
      return entryDateString === dateString;
    });
  }, [foodLog, currentDate]);

  // Calculate nutritional totals for a specific date
  const getDailyTotals = useCallback((date: Date = currentDate): DailyNutrition => {
    const dailyEntries = getDailyFoodLog(date);
    
    const totals: DailyNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugars: 0
    };
    
    dailyEntries.forEach(entry => {
      totals.calories += entry.nutrition.calories || 0;
      totals.protein += entry.nutrition.protein || 0;
      totals.carbs += entry.nutrition.carbs || 0;
      totals.fat += entry.nutrition.fat || 0;
      totals.fiber += entry.nutrition.fiber || 0;
      totals.sugars += entry.nutrition.sugars || 0;
    });
    
    // Round values for better display
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugars: Math.round(totals.sugars * 10) / 10
    };
  }, [getDailyFoodLog, currentDate]);

  // Calculate remaining nutritional values based on user goals
  const getRemainingNutrition = useCallback((date: Date = currentDate): DailyNutrition => {
    const dailyTotals = getDailyTotals(date);
    
    // Use user's nutritional goals if available
    const dailyGoals = {
      calories: userData.dailyCalories || 2000,
      protein: userData.macros.protein || 100,
      carbs: userData.macros.carbs || 200,
      fat: userData.macros.fats || 65,
      fiber: 30, // Default recommended fiber intake
      sugars: 50 // Default recommended sugar limit
    };
    
    return {
      calories: Math.round(Math.max(0, dailyGoals.calories - dailyTotals.calories)),
      protein: Math.round(Math.max(0, dailyGoals.protein - dailyTotals.protein) * 10) / 10,
      carbs: Math.round(Math.max(0, dailyGoals.carbs - dailyTotals.carbs) * 10) / 10,
      fat: Math.round(Math.max(0, dailyGoals.fat - dailyTotals.fat) * 10) / 10,
      fiber: Math.round(Math.max(0, dailyGoals.fiber - dailyTotals.fiber) * 10) / 10,
      sugars: Math.round(Math.max(0, dailyGoals.sugars - dailyTotals.sugars) * 10) / 10
    };
  }, [getDailyTotals, userData, currentDate]);

  // Create value object with memoized functions to prevent unnecessary re-renders
  const contextValue = {
    foodLog,
    foodEntries: foodLog, // Add foodEntries property to the context, pointing to the same foodLog array
    currentDate,
    setCurrentDate,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    getDailyFoodLog,
    getDailyTotals,
    getRemainingNutrition
  };

  return (
    <FoodLogContext.Provider value={contextValue}>
      {children}
    </FoodLogContext.Provider>
  );
};

// Custom hook to use the food log context
export const useFoodLog = () => {
  const context = useContext(FoodLogContext);
  if (context === undefined) {
    throw new Error("useFoodLog must be used within a FoodLogProvider");
  }
  return context;
};
