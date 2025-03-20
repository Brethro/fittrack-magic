
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { ArrowUpRight, Flame, Plus, Target, Utensils } from "lucide-react";

const PlanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useUserData();

  useEffect(() => {
    if (!userData.goalValue || !userData.goalDate) {
      toast({
        title: "Missing information",
        description: "Please complete your goals first",
        variant: "destructive",
      });
      navigate("/goals");
    }
  }, [userData, navigate, toast]);

  // Generate chart data
  const generateChartData = () => {
    if (!userData.weight || !userData.goalValue || !userData.goalDate) {
      return [];
    }

    const today = new Date();
    const goalDate = new Date(userData.goalDate);
    const totalDays = differenceInCalendarDays(goalDate, today);
    
    // Can't generate proper data for past dates
    if (totalDays <= 0) return [];
    
    const startWeight = userData.weight;
    const targetWeight = userData.goalType === "weight" ? userData.goalValue : userData.weight * 0.9; // If body fat goal, estimate 10% weight loss
    const totalWeightLoss = startWeight - targetWeight;
    const dailyLoss = totalWeightLoss / totalDays;
    
    const data = [];
    
    // Add data points (1 point per week, plus start and end)
    for (let i = 0; i <= totalDays; i += Math.max(Math.floor(totalDays / 8), 1)) {
      const currentDate = addDays(today, i);
      const currentWeight = startWeight - (dailyLoss * i);
      
      data.push({
        date: format(currentDate, "MMM d"),
        weight: parseFloat(currentWeight.toFixed(1)),
        tooltipDate: format(currentDate, "MMMM d, yyyy")
      });
    }
    
    // Ensure the last data point is exactly at the goal date
    if (data[data.length - 1].date !== format(goalDate, "MMM d")) {
      data.push({
        date: format(goalDate, "MMM d"),
        weight: parseFloat(targetWeight.toFixed(1)),
        tooltipDate: format(goalDate, "MMMM d, yyyy")
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-2 text-xs">
          <p className="font-medium">{payload[0].payload.tooltipDate}</p>
          <p>
            Weight: {payload[0].value} {userData.useMetric ? "kg" : "lbs"}
          </p>
        </div>
      );
    }
    return null;
  };

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
          
          <section className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="glass-panel rounded-lg p-4 mb-4"
            >
              <h2 className="text-lg font-medium mb-3">Daily Nutrition</h2>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card rounded-lg p-3 text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                  <p className="text-lg font-bold">{userData.dailyCalories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                
                <div className="glass-card rounded-lg p-3 text-center">
                  <span className="text-blue-400 text-sm font-bold block">P</span>
                  <p className="text-lg font-bold">{userData.macros.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                
                <div className="glass-card rounded-lg p-3 text-center">
                  <span className="text-amber-400 text-sm font-bold block">C</span>
                  <p className="text-lg font-bold">{userData.macros.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                
                <div className="glass-card rounded-lg p-3 text-center col-span-3">
                  <span className="text-pink-400 text-sm font-bold block">F</span>
                  <p className="text-lg font-bold">{userData.macros.fats}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="glass-panel rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium">
                  {userData.goalType === "weight" ? "Weight" : "Body Fat"} Progress
                </h2>
                
                <div className="flex gap-2 text-xs">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-violet-500 rounded-full mr-1"></span>
                    <span>Projection</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      domain={['auto', 'auto']}
                      width={30}
                      tickFormatter={(value) => `${value}`}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ fill: '#c4b5fd', r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Start</p>
                  <p className="font-medium">
                    {userData.weight} {userData.useMetric ? "kg" : "lbs"}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Goal</p>
                  <p className="font-medium">
                    {userData.goalType === "weight" 
                      ? `${userData.goalValue} ${userData.useMetric ? "kg" : "lbs"}`
                      : `${userData.goalValue}% body fat`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
          
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2 className="text-lg font-medium mb-3">Daily Stats</h2>
              
              <div className="space-y-3">
                <div className="glass-panel rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">Total Daily Energy</p>
                      <p className="text-sm text-muted-foreground">Maintenance calories</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{userData.tdee}</p>
                </div>
                
                <div className="glass-panel rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      <Utensils className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Daily Target</p>
                      <p className="text-sm text-muted-foreground">For weight loss</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">{userData.dailyCalories}</p>
                </div>
                
                <div className="glass-panel rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Target Date</p>
                      <p className="text-sm text-muted-foreground">Goal achievement</p>
                    </div>
                  </div>
                  <p className="text-base font-medium">
                    {userData.goalDate && format(new Date(userData.goalDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PlanPage;
