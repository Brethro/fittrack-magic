
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
  tdee: number | null;
  dailyCalories: number | null;
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
  tdee: null,
  dailyCalories: null,
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
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    // Load user data from localStorage if available
    const savedData = localStorage.getItem("fitTrackUserData");
    return savedData ? JSON.parse(savedData) : initialUserData;
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

  return (
    <UserDataContext.Provider value={{ userData, updateUserData, clearUserData }}>
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
