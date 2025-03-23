
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Dumbbell, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/contexts/UserDataContext";

const HomePage = () => {
  const { userData } = useUserData();
  const hasStarted = userData.age !== null;

  return (
    <div className="flex flex-col bg-background overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="container px-4 py-12 flex flex-col flex-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center items-center text-center gap-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-[120px] h-[120px] bg-gradient-to-br from-purple-500/80 to-violet-600/80 rounded-full flex items-center justify-center glass-card"
          >
            <LineChart size={60} className="text-white" />
          </motion.div>
          
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl font-bold mb-3"
            >
              <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">Weara</span>
              <span className="text-white"> Body</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-muted-foreground max-w-[350px]"
            >
              Achieve your fat loss goals without sacrificing muscle, using science-based personalized plans.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 w-full max-w-md"
          >
            <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <Dumbbell size={24} className="text-purple-400" />
              <p className="text-sm text-center">Custom Plans</p>
            </div>
            
            <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <BarChart3 size={24} className="text-purple-400" />
              <p className="text-sm text-center">Track Progress</p>
            </div>
            
            <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2">
              <LineChart size={24} className="text-purple-400" />
              <p className="text-sm text-center">Scientific Approach</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full flex flex-col gap-3"
          >
            <Link to={hasStarted ? "/plan" : "/onboarding"}>
              <Button className="w-full py-6 bg-gradient-purple hover:opacity-90 neo-btn" size="lg">
                {hasStarted ? "View My Plan" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {!hasStarted && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Takes just 2 minutes to set up your personalized plan
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
