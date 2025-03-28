
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useApiConnection } from "@/hooks/useApiConnection";
import ApiStatusIndicators from "@/components/diet/ApiStatusIndicators";
import FoodLogSummary from "@/components/diet/FoodLogSummary";
import FoodLog from "@/components/diet/FoodLog";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { useUserData } from "@/contexts/UserDataContext";
import { AlertTriangle } from "lucide-react";

const DietPage = () => {
  const { apiStatus, usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  const { currentDate, setCurrentDate, getDailyFoodLog } = useFoodLog();
  const { userData } = useUserData();
  const isWeightGain = userData.isWeightGain || false;
  const hasCheckedAPI = useRef(false);
  
  // Check if there are any food entries for the current date
  const dailyEntries = getDailyFoodLog(currentDate);
  const hasFoodEntries = dailyEntries.length > 0;

  // Check USDA API connection once when component mounts
  useEffect(() => {
    if (!hasCheckedAPI.current) {
      hasCheckedAPI.current = true;
      
      // Delay API check slightly to avoid immediate API call on page load
      const timeoutId = setTimeout(() => {
        checkUsdaApiConnection();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [checkUsdaApiConnection]);
  
  // Handler for date changes in the summary
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };
  
  return (
    <div className="container px-4 py-6 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col space-y-4 max-w-4xl mx-auto w-full"
      >
        <h1 className="text-2xl font-bold mb-2 text-center text-gradient-purple">
          Diet Planner
        </h1>

        {/* Goal Type Banner */}
        {userData.isWeightGain !== undefined && (
          <div className={`glass-panel rounded-lg p-2 text-sm text-center ${isWeightGain ? 'border-blue-500/40 bg-blue-950/20' : 'border-purple-500/40 bg-purple-950/20'}`}>
            <p className="font-medium">
              {isWeightGain 
                ? 'Your plan is optimized for muscle gain with minimal fat accumulation.' 
                : 'Your plan is optimized for fat loss while preserving muscle.'}
            </p>
          </div>
        )}

        {/* API Status Indicators */}
        <ApiStatusIndicators 
          apiStatus={apiStatus} 
          usdaApiStatus={usdaApiStatus} 
        />
        
        {/* 1. Daily Summary - at the top */}
        <div className="glass-panel p-4 rounded-lg">
          <FoodLogSummary onDateChange={handleDateChange} />
        </div>
        
        {/* 2. Food Log Section - adjusted height based on content */}
        <div className={`glass-panel p-4 rounded-lg ${hasFoodEntries ? 'h-auto min-h-[600px]' : 'h-auto'}`}>
          <FoodLog />
        </div>
      </motion.div>
    </div>
  );
};

export default DietPage;
