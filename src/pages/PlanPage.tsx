
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { WeightLogList } from "@/components/WeightLogList";
import WeightLogDialog from "@/components/WeightLogDialog";
import NutritionPanel from "@/components/NutritionPanel";
import WeightChart from "@/components/WeightChart";
import DailyStats from "@/components/DailyStats";
import { calculateBodyFatPercentage } from "@/utils/bodyFatCalculator";

const PlanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, recalculateNutrition } = useUserData();
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [estimatedGoalBodyFat, setEstimatedGoalBodyFat] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Always recalculate nutrition when the page loads to ensure accuracy
  useEffect(() => {
    if (!userData.goalValue || !userData.goalDate) {
      toast({
        title: "Missing information",
        description: "Please complete your goals first",
        variant: "destructive",
      });
      navigate("/goals");
      return;
    }
    
    // Force recalculation every time to ensure accuracy
    recalculateNutrition();
    
    // Calculate estimated body fat at goal weight if we have current body fat
    if (userData.bodyFatPercentage && userData.weight && userData.goalValue) {
      // Using the basic Navy Method formula relationship
      // This assumes fat-free mass stays constant
      const currentWeight = userData.weight;
      const currentBodyFat = userData.bodyFatPercentage;
      const goalWeight = userData.goalValue;
      
      // Calculate fat-free mass (remains constant)
      const fatFreeMass = currentWeight * (1 - currentBodyFat / 100);
      
      // Calculate new body fat percentage at goal weight
      const newBodyFat = 100 * (1 - (fatFreeMass / goalWeight));
      
      // Round to 1 decimal place
      setEstimatedGoalBodyFat(Math.max(Math.round(newBodyFat * 10) / 10, 0));
    } else {
      setEstimatedGoalBodyFat(null);
    }
    
    setInitialized(true);
  }, [userData.goalValue, userData.goalDate, userData.bodyFatPercentage, userData.weight, navigate, toast, recalculateNutrition]);

  if (!userData.dailyCalories || !userData.macros.protein) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p>Please complete your goals setup first</p>
          <button 
            onClick={() => navigate("/goals")}
            className="mt-4 px-4 py-2 bg-primary rounded-md text-white"
          >
            Go to Goals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-6 text-gradient-purple">
            Your Plan
          </h1>
          
          <section className="space-y-4 mb-8">
            {/* Nutrition panel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <NutritionPanel />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <WeightChart />
              
              {/* Display estimated body fat at goal weight if available */}
              {estimatedGoalBodyFat !== null && (
                <div className="mt-2 text-sm text-muted-foreground text-center">
                  Estimated body fat at goal weight: <span className="text-primary font-medium">{estimatedGoalBodyFat}%</span>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="glass-panel rounded-lg p-4"
            >
              <WeightLogList />
            </motion.div>
          </section>
          
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <DailyStats />
            </motion.div>
          </section>
        </motion.div>
      </AnimatePresence>
      
      <WeightLogDialog
        open={weightDialogOpen}
        onOpenChange={setWeightDialogOpen}
      />
    </div>
  );
}

export default PlanPage;
