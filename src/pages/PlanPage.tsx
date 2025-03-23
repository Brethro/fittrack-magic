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
      // Using our updated body fat calculator that accounts for pace
      const currentWeight = userData.weight;
      const currentBodyFat = userData.bodyFatPercentage;
      const goalWeight = userData.goalValue;
      
      // Get the surplus percentage for more accurate body fat prediction
      // Higher surplus = higher body fat gain
      const tdee = userData.tdee || 0;
      const dailyCalories = userData.dailyCalories || 0;
      const actualSurplusPercentage = userData.isWeightGain && tdee > 0 ? 
        ((dailyCalories - tdee) / tdee) * 100 : 0;
      
      // IMPROVED: Adjust the body fat prediction based on the actual surplus percentage
      // Use more optimistic muscle-to-fat ratio for trained individuals
      let surplusMultiplier = 1.0;
      if (userData.isWeightGain) {
        // More optimistic multipliers for reasonable surplus ranges
        if (actualSurplusPercentage > 30) {
          surplusMultiplier = 1.3; // Reduced from 1.5 to be less pessimistic
        } else if (actualSurplusPercentage > 25) {
          surplusMultiplier = 1.2; // Reduced from 1.3
        } else if (actualSurplusPercentage > 20) {
          surplusMultiplier = 1.1; // Reduced from 1.15
        }
      }
      
      // Calculate with the pace-aware function, adjusting for surplus
      const baseBfChange = calculateBodyFatPercentage(
        currentWeight, 
        currentBodyFat, 
        goalWeight,
        userData.goalPace // Pass the pace to get more accurate estimation
      );
      
      // Apply the surplus multiplier to the body fat change (above the base rate)
      // but only for weight gain scenarios where we'd add body fat
      let newBodyFat: number;
      if (userData.isWeightGain && baseBfChange > currentBodyFat) {
        const baseBfDifference = baseBfChange - currentBodyFat;
        const adjustedBfDifference = baseBfDifference * surplusMultiplier;
        newBodyFat = currentBodyFat + adjustedBfDifference;
      } else {
        newBodyFat = baseBfChange;
      }
      
      // Round to 1 decimal place
      setEstimatedGoalBodyFat(Math.max(Math.round(newBodyFat * 10) / 10, 0));
    } else {
      setEstimatedGoalBodyFat(null);
    }
    
    setInitialized(true);
  }, [userData.goalValue, userData.goalDate, userData.bodyFatPercentage, userData.weight, userData.goalPace, userData.tdee, userData.dailyCalories, userData.isWeightGain, navigate, toast, recalculateNutrition]);

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
                  {userData.isWeightGain && userData.tdee && userData.dailyCalories && 
                   ((userData.dailyCalories - userData.tdee) / userData.tdee) * 100 > 20 && (
                    <span className="text-amber-400 ml-1">(higher due to aggressive surplus)</span>
                  )}
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
