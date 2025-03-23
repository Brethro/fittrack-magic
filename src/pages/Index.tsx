
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Dumbbell, LineChart, Info } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const { userData } = useUserData();
  const hasStarted = userData.age !== null;

  return (
    <div className="flex flex-col bg-background relative min-h-full">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="container px-4 py-12 flex flex-col min-h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center items-center text-center gap-8 mb-8"
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
        
        {/* Separator and disclaimer */}
        <Separator className="mt-4 mb-4 opacity-30" />
        
        <div className="w-full py-2 relative z-10">
          <p className="text-xs text-muted-foreground/80 text-center mx-auto max-w-[90%]">
            This application is intended as a fitness tracking tool only and not as a substitute for professional medical or nutritional advice. Consult healthcare professionals before starting any fitness or nutrition program.
          </p>
        </div>
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
          "glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2",
          "cursor-pointer hover:bg-accent/10 transition-colors"
        )}>
          <Icon size={24} className="text-purple-400" />
          <p className="text-sm text-center">{title}</p>
          <Info size={14} className="text-muted-foreground mt-1" />
        </div>
      </DialogTrigger>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon size={18} className="text-purple-400" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="pt-4 text-foreground/80">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Index;
