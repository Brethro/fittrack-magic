
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Dumbbell, LineChart, Info, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/contexts/UserDataContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import UpcomingFeaturesCard from "@/components/UpcomingFeaturesCard";

const HomePage = () => {
  const { userData } = useUserData();
  const hasStarted = userData.age !== null;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();
  const isGuestUser = !user;

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
  };

  return (
    <div className="flex flex-col min-h-[90vh] py-4 overflow-hidden relative">
      {/* Main content */}
      <div className="container px-4 py-8 flex flex-col flex-1 relative z-10">
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
            className="w-[120px] h-[120px] pink-purple-gradient rounded-full flex items-center justify-center purple-glow"
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
              <span className="text-gradient-pink-blue">Weara</span>
              <span className="text-white"> Body</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white/70 max-w-[350px]"
            >
              Achieve your fitness goals - whether building muscle or losing fat - using science-based personalized plans.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 w-full max-w-md"
          >
            <FeatureCard 
              icon={Dumbbell} 
              title="Custom Plans"
              description="Our personalized plans are tailored to your body type, goals, and activity level. We use sophisticated algorithms to create the perfect nutrition and exercise balance for your specific needs."
            />
            
            <FeatureCard 
              icon={BarChart3} 
              title="Track Progress"
              description="Track your progress with comprehensive analytics and data visualization. See your weight trends, body composition changes, and nutritional intake to stay motivated and on track with your goals."
            />
            
            <FeatureCard 
              icon={LineChart} 
              title="Scientific Approach"
              description="Our methodologies are based on peer-reviewed research. We implement formulas like the Mifflin-St Jeor equation for BMR, and account for the Thermic Effect of Food and Non-Exercise Activity Thermogenesis in calorie calculations."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full flex flex-col gap-3"
          >
            <Link to={hasStarted ? "/plan" : "/onboarding"} className="w-full">
              <Button 
                variant="gradient" 
                className="w-full py-6 purple-glow" 
                size="lg"
              >
                {hasStarted ? "View My Plan" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {!hasStarted && (
              <p className="text-xs text-white/60 text-center mt-2">
                Takes just 2 minutes to set up your personalized plan
              </p>
            )}
            
            {/* Subtle account creation option for guest users */}
            {isGuestUser && (
              <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAuthOpen(true)}
                  className="mt-4 text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
                >
                  <UserRound size={14} />
                  <span className="text-xs">Create account to save your data</span>
                </Button>
                
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                    <DialogDescription>
                      Sign up to save your progress and access from any device
                    </DialogDescription>
                  </DialogHeader>
                  <AuthForm onSuccess={handleAuthSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </motion.div>

          {/* Moved Upcoming Features below the action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="w-full max-w-md mt-0" // Removed extra top margin
          >
            <UpcomingFeaturesCard />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Feature card component with clickable dialog
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={cn(
          "card-gradient rounded-xl p-4 flex flex-col items-center justify-center gap-2 card-hover",
          "cursor-pointer transition-all duration-300"
        )}>
          <Icon size={24} className="text-fuchsia-400" />
          <p className="text-sm text-center">{title}</p>
          <Info size={14} className="text-white/60 mt-1" />
        </div>
      </DialogTrigger>
      <DialogContent className="dark-glass border border-white/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon size={18} className="text-fuchsia-400" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="pt-4 text-white/80">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default HomePage;
