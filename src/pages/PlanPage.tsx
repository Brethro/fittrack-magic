import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { WeightLogList } from "@/components/WeightLogList";
import WeightLogDialog from "@/components/WeightLogDialog";
import NutritionPanel from "@/components/NutritionPanel";
import WeightChart from "@/components/WeightChart";
import { calculateBodyFatPercentage } from "@/utils/bodyFatCalculator";

const PlanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, recalculateNutrition } = useUserData();
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [estimatedGoalBodyFat, setEstimatedGoalBodyFat] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Check if necessary user data is available - improved validation
  const hasRequiredUserData = userData && 
    userData.age !== null && 
    userData.weight !== null && 
    userData.height !== null && 
    userData.activityLevel !== null;

  const hasRequiredGoalData = userData &&
    userData.goalValue !== null && 
    userData.goalDate !== null && 
    userData.goalType !== null;

  // Always recalculate nutrition when the page loads to ensure accuracy
  useEffect(() => {
    console.log("PlanPage useEffect - userData:", userData);
    console.log("hasRequiredUserData:", hasRequiredUserData);
    console.log("hasRequiredGoalData:", hasRequiredGoalData);
    
    if (!hasRequiredUserData) {
      // If we're missing any essential user data, redirect to profile
      console.log("Missing required user data, redirecting to onboarding");
      toast({
        title: "Missing information",
        description: "Please complete your profile first",
        variant: "destructive",
      });
      navigate("/onboarding");
      return;
    }
    
    if (!hasRequiredGoalData) {
      console.log("Missing required goal data, redirecting to goals");
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
  }, [userData, hasRequiredUserData, hasRequiredGoalData, navigate, toast, recalculateNutrition]);

  // If data is incomplete, show a friendly message and redirect button
  if (!hasRequiredUserData) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="text-center glass-panel p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3 text-gradient-purple">Missing Profile Data</h2>
          <p className="mb-4 text-muted-foreground">Please complete your profile information first</p>
          <button 
            onClick={() => navigate("/onboarding")}
            className="px-4 py-2 bg-gradient-purple rounded-md text-white neo-btn"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  if (!hasRequiredGoalData) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="text-center glass-panel p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3 text-gradient-purple">Missing Goals</h2>
          <p className="mb-4 text-muted-foreground">Please complete your goals setup first</p>
          <button 
            onClick={() => navigate("/goals")}
            className="px-4 py-2 bg-gradient-purple rounded-md text-white neo-btn"
          >
            Set Goals
          </button>
        </div>
      </div>
    );
  }

  if (!userData.dailyCalories || !userData.macros.protein) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-[80vh]">
        <div className="text-center glass-panel p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3 text-gradient-purple">Calculation in Progress</h2>
          <p className="mb-4 text-muted-foreground">Please wait while we calculate your nutrition plan</p>
          <button 
            onClick={() => recalculateNutrition()}
            className="px-4 py-2 bg-gradient-purple rounded-md text-white neo-btn"
          >
            Recalculate Now
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
