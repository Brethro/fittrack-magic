
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useApiConnection } from "@/hooks/useApiConnection";
import ApiStatusIndicators from "@/components/diet/ApiStatusIndicators";
import FoodLogSummary from "@/components/diet/FoodLogSummary";
import FoodLog from "@/components/diet/FoodLog";
import { useFoodLog } from "@/contexts/FoodLogContext";
import SearchSection from "@/components/diet/SearchSection";

const DietPage = () => {
  const { apiStatus, usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  const { currentDate, setCurrentDate } = useFoodLog();

  // Check USDA API connection when selected
  useEffect(() => {
    checkUsdaApiConnection();
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

        {/* API Status Indicators */}
        <ApiStatusIndicators 
          apiStatus={apiStatus} 
          usdaApiStatus={usdaApiStatus} 
        />
        
        {/* 1. Daily Summary - at the top */}
        <div className="glass-panel p-4 rounded-lg">
          <FoodLogSummary onDateChange={handleDateChange} />
        </div>
        
        {/* 2. Food Search Section - in the middle */}
        <SearchSection usdaApiStatus={usdaApiStatus} />

        {/* 3. Food Log Section - at the bottom */}
        <div className="glass-panel p-4 rounded-lg h-[500px]">
          <FoodLog />
        </div>
      </motion.div>
    </div>
  );
};

export default DietPage;
