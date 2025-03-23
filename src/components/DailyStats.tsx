
import { format } from "date-fns";
import { Flame, Target, Utensils, ArrowUp, ArrowDown } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    
  // Calculate percentage with exact precision for display
  const exactAdjustmentPercentage = userData.tdee 
    ? (calorieAdjustment / userData.tdee) * 100 
    : 0;
    
  // Format display logic: if it's between 19.5% and 20%, show it as 20%
  let adjustmentPercentage;
  if (exactAdjustmentPercentage >= 19.5 && exactAdjustmentPercentage < 20.01) {
    adjustmentPercentage = "20.0";
  } else {
    adjustmentPercentage = exactAdjustmentPercentage.toFixed(1);
  }
    
  const weeklyWeightChange = calculateWeeklyWeightChange();

  return (
    <div className="w-full">
      <h2 className="text-lg font-medium mb-3">Daily Stats</h2>
      
      <div className="space-y-3">
        {/* Total Daily Energy panel */}
        <Card className="glass-panel p-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">Total Daily Energy</p>
                <p className="text-sm text-muted-foreground">Maintenance calories</p>
              </div>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="text-xl font-bold">{userData.tdee || 0}</p>
            </div>
          </div>
        </Card>
        
        {/* Daily Target panel */}
        <Card className="glass-panel p-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
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
            <div className="text-right min-w-[80px]">
              <p className="text-xl font-bold">{userData.dailyCalories || 0}</p>
            </div>
          </div>
        </Card>
        
        {/* Projected Gain/Loss panel */}
        <Card className="glass-panel p-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
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
            <div className="text-right min-w-[80px]">
              <p className="text-base font-medium">
                {userData.goalDate && format(new Date(userData.goalDate), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DailyStats;
