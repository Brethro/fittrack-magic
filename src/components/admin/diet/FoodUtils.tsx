
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Simplified version during Open Food Facts API migration
 */
export const useFoodDatabase = () => {
  const { toast } = useToast();
  const [lastParseResults, setLastParseResults] = useState<string[]>([]);

  // Placeholder implementations
  const totalFoodItems = 0;
  const categoriesInitialized = true;

  // Simplified getAllRawFoodData function
  const getAllRawFoodData = () => {
    return [];
  };

  // Placeholder for importPoultryData
  const importPoultryData = () => {
    toast({
      title: "Database Migration",
      description: "Food import is unavailable during Open Food Facts API migration.",
      variant: "destructive", // Changed from "warning" to "destructive"
    });
    
    return {
      success: false,
      message: "Food import is unavailable during Open Food Facts API migration.",
      addedCount: 0,
      updatedCount: 0,
      failedCount: 0,
      failedItems: [],
      dietTypes: []
    };
  };

  return {
    totalFoodItems,
    lastParseResults,
    setLastParseResults,
    getAllRawFoodData,
    importPoultryData,
    categoriesInitialized
  };
};
