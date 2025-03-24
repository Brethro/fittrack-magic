
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApiConnection } from "@/hooks/useApiConnection";
import ApiStatusIndicators from "@/components/diet/ApiStatusIndicators";
import FoodLogSummary from "@/components/diet/FoodLogSummary";
import FoodLog from "@/components/diet/FoodLog";
import { useFoodLog } from "@/contexts/FoodLogContext";
import SearchSection from "@/components/diet/SearchSection";
import { useUserData } from "@/contexts/UserDataContext";
import { AlertTriangle, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/diet/SearchCommand";

const DietPage = () => {
  const { apiStatus, usdaApiStatus, checkUsdaApiConnection } = useApiConnection();
  const { currentDate, setCurrentDate } = useFoodLog();
  const { userData } = useUserData();
  const isWeightGain = userData.isWeightGain || false;
  const [searchOpen, setSearchOpen] = useState(false);

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
        
        {/* 2. Food Log Section - in the middle */}
        <div className="glass-panel p-4 rounded-lg h-[500px]">
          <FoodLog />
        </div>
        
        {/* Floating action button for quick search */}
        <div className="fixed bottom-6 right-6 z-10">
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Global search command */}
        <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      </motion.div>
    </div>
  );
};

export default DietPage;
