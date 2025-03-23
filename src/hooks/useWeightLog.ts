
import { useCallback } from "react";
import { WeightLogEntry } from "@/contexts/UserDataContext";

export const useWeightLog = (
  weightLog: WeightLogEntry[],
  updateUserData: (data: { weightLog: WeightLogEntry[] }) => void
) => {
  const addWeightLogEntry = useCallback((entry: Omit<WeightLogEntry, "id">) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    updateUserData({
      weightLog: [...weightLog, newEntry]
    });
  }, [weightLog, updateUserData]);

  const updateWeightLogEntry = useCallback((updatedEntry: WeightLogEntry) => {
    updateUserData({
      weightLog: weightLog.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    });
  }, [weightLog, updateUserData]);

  const deleteWeightLogEntry = useCallback((id: string) => {
    updateUserData({
      weightLog: weightLog.filter(entry => entry.id !== id)
    });
  }, [weightLog, updateUserData]);

  return {
    addWeightLogEntry,
    updateWeightLogEntry,
    deleteWeightLogEntry
  };
};
