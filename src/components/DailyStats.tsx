
import { format } from "date-fns";
import { Flame, Target, Utensils } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";

export function DailyStats() {
  const { userData } = useUserData();

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

  // Calculate daily caloric deficit
  const calorieDeficit = userData.tdee ? userData.tdee - userData.dailyCalories : 0;
  const deficitPercentage = userData.tdee ? Math.round((calorieDeficit / userData.tdee) * 100) : 0;
  const weeklyWeightLoss = calculateWeeklyWeightLoss();

  return (
    <div>
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
    </div>
  );
}

export default DailyStats;
