
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

const PlanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, recalculateNutrition } = useUserData();
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);

  useEffect(() => {
    if (!userData.goalValue || !userData.goalDate) {
      toast({
        title: "Missing information",
        description: "Please complete your goals first",
        variant: "destructive",
      });
      navigate("/goals");
    } else {
      // Ensure nutrition values are up-to-date when the plan page is loaded
      recalculateNutrition();
    }
  }, [userData.goalValue, userData.goalDate, userData.goalPace, navigate, toast, recalculateNutrition]);

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
