
import { useMemo } from "react";
import { CalendarDays, Pizza, Salad } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import { calculateMacroCalories } from "@/utils/nutritionCalculator";

interface FoodLogSummaryProps {
  onDateChange: (date: Date) => void;
}

const FoodLogSummary = ({ onDateChange }: FoodLogSummaryProps) => {
  const { currentDate, getDailyTotals, getRemainingNutrition } = useFoodLog();
  const { userData } = useUserData();
  
  // Get daily totals and remaining nutrition
  const dailyTotals = getDailyTotals(currentDate);
  const remaining = getRemainingNutrition(currentDate);
  
  // Calculate percentages for progress bars
  const caloriePercentage = useMemo(() => {
    if (!userData.dailyCalories) return 0;
    return Math.min(100, Math.round((dailyTotals.calories / userData.dailyCalories) * 100));
  }, [dailyTotals.calories, userData.dailyCalories]);
  
  const proteinPercentage = useMemo(() => {
    if (!userData.macros.protein) return 0;
    return Math.min(100, Math.round((dailyTotals.protein / userData.macros.protein) * 100));
  }, [dailyTotals.protein, userData.macros.protein]);
  
  const carbsPercentage = useMemo(() => {
    if (!userData.macros.carbs) return 0;
    return Math.min(100, Math.round((dailyTotals.carbs / userData.macros.carbs) * 100));
  }, [dailyTotals.carbs, userData.macros.carbs]);
  
  const fatPercentage = useMemo(() => {
    if (!userData.macros.fats) return 0;
    return Math.min(100, Math.round((dailyTotals.fat / userData.macros.fats) * 100));
  }, [dailyTotals.fat, userData.macros.fats]);
  
  // Calculate macro distribution
  const macroCalories = useMemo(() => calculateMacroCalories(dailyTotals), [dailyTotals]);
  
  // Format the current date for display
  const formattedDate = format(currentDate, "EEEE, MMMM d, yyyy");
  
  // Change to previous day
  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };
  
  // Change to next day
  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };
  
  // Go to today
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  return (
    <div className="glass-panel p-4 rounded-lg">
      {/* Date selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Daily Summary</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousDay}>
            &lt;
          </Button>
          <Button variant="outline" className="flex items-center gap-1" onClick={goToToday}>
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Today</span>
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            &gt;
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-center mb-4">{formattedDate}</p>
      
      {/* Calories summary */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="text-xl font-bold">
              {dailyTotals.calories} <span className="text-sm font-normal text-muted-foreground">/ {userData.dailyCalories}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-lg font-semibold">{remaining.calories}</p>
          </div>
        </div>
        <Progress 
          value={caloriePercentage} 
          className="h-2 mt-2"
        />
      </div>
      
      {/* Macros grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Protein */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 text-xs font-medium">Protein</span>
            <span className="text-xs">{proteinPercentage}%</span>
          </div>
          <p className="text-sm font-semibold">
            {dailyTotals.protein.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground">/{userData.macros.protein}g</span>
          </p>
          <Progress 
            value={proteinPercentage} 
            className="h-1.5 mt-1 bg-blue-950"
            indicatorClassName="bg-blue-400"
          />
        </div>
        
        {/* Carbs */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-amber-400 text-xs font-medium">Carbs</span>
            <span className="text-xs">{carbsPercentage}%</span>
          </div>
          <p className="text-sm font-semibold">
            {dailyTotals.carbs.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground">/{userData.macros.carbs}g</span>
          </p>
          <Progress 
            value={carbsPercentage} 
            className="h-1.5 mt-1 bg-amber-950"
            indicatorClassName="bg-amber-400"
          />
        </div>
        
        {/* Fats */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-pink-400 text-xs font-medium">Fats</span>
            <span className="text-xs">{fatPercentage}%</span>
          </div>
          <p className="text-sm font-semibold">
            {dailyTotals.fat.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground">/{userData.macros.fats}g</span>
          </p>
          <Progress 
            value={fatPercentage} 
            className="h-1.5 mt-1 bg-pink-950"
            indicatorClassName="bg-pink-400"
          />
        </div>
      </div>
      
      {/* Macro distribution */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm mb-2">Macro Distribution</p>
        <div className="w-full h-4 rounded-full overflow-hidden flex">
          <div 
            className="bg-blue-400" 
            style={{ width: `${(macroCalories.protein / macroCalories.total) * 100}%` }}
          ></div>
          <div 
            className="bg-amber-400" 
            style={{ width: `${(macroCalories.carbs / macroCalories.total) * 100}%` }}
          ></div>
          <div 
            className="bg-pink-400" 
            style={{ width: `${(macroCalories.fat / macroCalories.total) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>P: {Math.round((macroCalories.protein / macroCalories.total) * 100)}%</span>
          <span>C: {Math.round((macroCalories.carbs / macroCalories.total) * 100)}%</span>
          <span>F: {Math.round((macroCalories.fat / macroCalories.total) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default FoodLogSummary;
