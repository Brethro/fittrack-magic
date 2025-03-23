
import { format } from "date-fns";
import { Flame, Target, Utensils, ArrowUp, ArrowDown } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";

export function DailyStats() {
  const { userData } = useUserData();
  const isWeightGain = userData.isWeightGain || false;

  // Calculate weekly weight change projection based on caloric adjustment
  const calculateWeeklyWeightChange = () => {
    if (!userData.tdee || !userData.dailyCalories) return null;
    
    const dailyAdjustment = isWeightGain 
      ? userData.dailyCalories - userData.tdee 
      : userData.tdee - userData.dailyCalories;
      
    // 7700 calories per kg of body fat (or 3500 calories per pound)
    const weeklyChange = userData.useMetric 
      ? (dailyAdjustment * 7) / 7700 
      : (dailyAdjustment * 7) / 3500;
    
    return weeklyChange.toFixed(1);
  };

  // Calculate daily caloric adjustment
  const calorieAdjustment = userData.tdee && userData.dailyCalories 
    ? Math.round(isWeightGain ? userData.dailyCalories - userData.tdee : userData.tdee - userData.dailyCalories)
    : 0;
    
  const adjustmentPercentage = userData.tdee 
    ? Math.round((calorieAdjustment / userData.tdee) * 100) 
    : 0;
    
  const weeklyWeightChange = calculateWeeklyWeightChange();

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Daily Stats</h2>
      
      <div className="space-y-3">
        {/* Total Daily Energy panel */}
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
          <div className="text-right">
            <p className="text-xl font-bold">{userData.tdee || 0}</p>
          </div>
        </div>
        
        {/* Daily Target panel - explicitly fix alignment here */}
        <div className="glass-panel rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
              <Utensils className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium">Daily Target</p>
              <p className="text-sm text-muted-foreground">
                {isWeightGain ? (
                  <>
                    {adjustmentPercentage}% surplus ({calorieAdjustment} calories)
                  </>
                ) : (
                  <>
                    {adjustmentPercentage}% deficit ({calorieAdjustment} calories)
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{userData.dailyCalories || 0}</p>
          </div>
        </div>
        
        {/* Projected Gain/Loss panel */}
        <div className="glass-panel rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium">
                {isWeightGain ? "Projected Gain" : "Projected Loss"}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>
                  {weeklyWeightChange} {userData.useMetric ? "kg" : "lbs"}/week
                </span>
                {isWeightGain ? (
                  <ArrowUp className="h-3 w-3 ml-1 text-green-500" />
                ) : (
                  <ArrowDown className="h-3 w-3 ml-1 text-red-500" />
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-medium">
              {userData.goalDate && format(new Date(userData.goalDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyStats;
