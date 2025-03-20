
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { ArrowUpRight, Flame, Plus, Target, Utensils } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const PlanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, recalculateNutrition } = useUserData();

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

  // Calculate weekly weight loss projection based on caloric deficit
  const calculateWeeklyWeightLoss = () => {
    if (!userData.tdee || !userData.dailyCalories) return null;
    
    const dailyDeficit = userData.tdee - userData.dailyCalories;
    // 7700 calories per kg of body fat (or 3500 calories per pound)
    const weeklyLoss = userData.useMetric 
      ? (dailyDeficit * 7) / 7700 
      : (dailyDeficit * 7) / 3500;
    
    return weeklyLoss.toFixed(1);
  };

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
    
    // Use calculated weekly weight loss for more accurate projection
    const weeklyLoss = calculateWeeklyWeightLoss();
    const dailyLoss = weeklyLoss ? parseFloat(weeklyLoss) / 7 : (startWeight - targetWeight) / totalDays;
    
    console.log("Generating chart data with: ", {
      startWeight,
      targetWeight,
      totalDays,
      dailyLoss,
      goalDate: format(goalDate, "yyyy-MM-dd")
    });
    
    const data = [];
    
    // Add data points (one per week, plus start and end)
    const maxPoints = 8; // Maximum number of points to display
    const interval = Math.max(Math.floor(totalDays / (maxPoints - 1)), 1);
    
    // Start with today
    data.push({
      date: format(today, "MMM d"),
      weight: parseFloat(startWeight.toFixed(1)),
      tooltipDate: format(today, "MMMM d, yyyy")
    });
    
    // Calculate how much weight should be lost each interval to reach the goal exactly on the goal date
    const weightLossPerInterval = ((startWeight - targetWeight) / Math.ceil(totalDays / interval)) * interval;
    
    // Add intermediate points with consistent weight loss
    let currentWeight = startWeight;
    for (let i = interval; i < totalDays; i += interval) {
      const currentDate = addDays(today, i);
      
      // Ensure we don't go below target weight
      currentWeight = Math.max(startWeight - ((i / totalDays) * (startWeight - targetWeight)), targetWeight);
      
      data.push({
        date: format(currentDate, "MMM d"),
        weight: parseFloat(currentWeight.toFixed(1)),
        tooltipDate: format(currentDate, "MMMM d, yyyy")
      });
    }
    
    // Always add the goal date as the final point
    // But only if it's not already the last point in our data
    const lastPoint = data[data.length - 1];
    if (format(goalDate, "MMM d") !== lastPoint.date) {
      data.push({
        date: format(goalDate, "MMM d"),
        weight: parseFloat(targetWeight.toFixed(1)),
        tooltipDate: format(goalDate, "MMMM d, yyyy")
      });
    } else {
      // Make sure the last point has exactly the target weight
      data[data.length - 1] = {
        ...lastPoint,
        weight: parseFloat(targetWeight.toFixed(1))
      };
    }
    
    console.log("Generated chart data:", data);
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

  // Calculate macro calorie contributions
  const calculateMacroCalories = () => {
    if (!userData.macros.protein || !userData.macros.carbs || !userData.macros.fats) {
      return { protein: 0, carbs: 0, fats: 0 };
    }

    return {
      protein: userData.macros.protein * 4, // 4 calories per gram of protein
      carbs: userData.macros.carbs * 4,     // 4 calories per gram of carbs
      fats: userData.macros.fats * 9,       // 9 calories per gram of fat
    };
  };

  const macroCalories = calculateMacroCalories();
  const totalCalories = userData.dailyCalories || 0;

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

  // Calculate daily caloric deficit
  const calorieDeficit = userData.tdee ? userData.tdee - userData.dailyCalories : 0;
  const deficitPercentage = userData.tdee ? Math.round((calorieDeficit / userData.tdee) * 100) : 0;
  const weeklyWeightLoss = calculateWeeklyWeightLoss();

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
              
              {/* Calories (full width) */}
              <div className="glass-card rounded-lg p-3 text-center mb-3">
                <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <p className="text-lg font-bold">{userData.dailyCalories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              
              {/* Macros (three columns) */}
              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="glass-card rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 text-sm font-bold">Protein</span>
                    <span className="text-xs">{Math.round(macroCalories.protein / totalCalories * 100)}%</span>
                  </div>
                  <p className="text-lg font-bold">{userData.macros.protein}g</p>
                  <Progress 
                    value={Math.round(macroCalories.protein / totalCalories * 100)} 
                    className="h-1.5 mt-1 bg-blue-950"
                    indicatorClassName="bg-blue-400"
                  />
                  <p className="text-xs text-right mt-1">{macroCalories.protein} cal</p>
                </div>
                
                {/* Carbs */}
                <div className="glass-card rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-400 text-sm font-bold">Carbs</span>
                    <span className="text-xs">{Math.round(macroCalories.carbs / totalCalories * 100)}%</span>
                  </div>
                  <p className="text-lg font-bold">{userData.macros.carbs}g</p>
                  <Progress 
                    value={Math.round(macroCalories.carbs / totalCalories * 100)} 
                    className="h-1.5 mt-1 bg-amber-950"
                    indicatorClassName="bg-amber-400"
                  />
                  <p className="text-xs text-right mt-1">{macroCalories.carbs} cal</p>
                </div>
                
                {/* Fats */}
                <div className="glass-card rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-pink-400 text-sm font-bold">Fats</span>
                    <span className="text-xs">{Math.round(macroCalories.fats / totalCalories * 100)}%</span>
                  </div>
                  <p className="text-lg font-bold">{userData.macros.fats}g</p>
                  <Progress 
                    value={Math.round(macroCalories.fats / totalCalories * 100)} 
                    className="h-1.5 mt-1 bg-pink-950"
                    indicatorClassName="bg-pink-400"
                  />
                  <p className="text-xs text-right mt-1">{macroCalories.fats} cal</p>
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
                    data={generateChartData()}
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
                      <p className="text-sm text-muted-foreground">
                        {deficitPercentage}% deficit ({calorieDeficit} calories)
                      </p>
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
                      <p className="font-medium">Projected Loss</p>
                      <p className="text-sm text-muted-foreground">
                        {weeklyWeightLoss} {userData.useMetric ? "kg" : "lbs"}/week
                      </p>
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
