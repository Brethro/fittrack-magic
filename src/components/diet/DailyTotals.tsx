
import { RefreshCw, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meal } from "@/types/diet";

interface DailyTotalsProps {
  mealPlan: Meal[];
  generateMealPlan: () => void;
  calorieTarget: number;
  userMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function DailyTotals({ 
  mealPlan, 
  generateMealPlan, 
  calorieTarget,
  userMacros
}: DailyTotalsProps) {
  // Calculate nutrition totals
  const calculateTotals = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    mealPlan.forEach(meal => {
      totalCalories += meal.totalCalories;
      totalProtein += meal.totalProtein;
      totalCarbs += meal.totalCarbs;
      totalFats += meal.totalFats;
    });

    return { 
      totalCalories, 
      totalProtein: parseFloat(totalProtein.toFixed(1)), 
      totalCarbs: parseFloat(totalCarbs.toFixed(1)), 
      totalFats: parseFloat(totalFats.toFixed(1)) 
    };
  };

  const totals = calculateTotals();
  
  // Calculate percentage difference from target calories
  const caloriePercentDiff = ((totals.totalCalories - calorieTarget) / calorieTarget) * 100;
  const isWithinCalorieTarget = Math.abs(caloriePercentDiff) <= 5; // Within 5% of target

  return (
    <div className={`glass-panel rounded-lg p-4 mb-4 ${!isWithinCalorieTarget ? 'border-2 border-orange-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Daily Totals</h2>
        <Button 
          onClick={generateMealPlan} 
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className={`glass-card rounded-lg p-3 text-center ${!isWithinCalorieTarget ? 'bg-orange-500/10' : ''}`}>
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-orange-400" />
            <p className="text-lg font-bold">{totals.totalCalories}</p>
          </div>
          <p className="text-xs text-muted-foreground">Calories</p>
          {!isWithinCalorieTarget && (
            <p className="text-xs text-orange-500 font-medium mt-1">
              {caloriePercentDiff > 0 ? 'Over' : 'Under'} target by {Math.abs(caloriePercentDiff).toFixed(1)}%
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Target: {calorieTarget} calories
          </p>
        </div>
        
        <div className="glass-card rounded-lg p-3 text-center">
          <div className="flex justify-around mb-1">
            <div className="text-blue-400 text-xs font-bold">P: {totals.totalProtein}g</div>
            <div className="text-amber-400 text-xs font-bold">C: {totals.totalCarbs}g</div>
            <div className="text-pink-400 text-xs font-bold">F: {totals.totalFats}g</div>
          </div>
          <div className="flex h-2 mb-1">
            <div className="bg-blue-400 h-full" style={{ width: `${totals.totalProtein*4/totals.totalCalories*100}%` }}></div>
            <div className="bg-amber-400 h-full" style={{ width: `${totals.totalCarbs*4/totals.totalCalories*100}%` }}></div>
            <div className="bg-pink-400 h-full" style={{ width: `${totals.totalFats*9/totals.totalCalories*100}%` }}></div>
          </div>
          <p className="text-xs text-muted-foreground">Macronutrients</p>
          <p className="text-xs text-muted-foreground mt-1">
            Targets: P: {userMacros.protein}g C: {userMacros.carbs}g F: {userMacros.fats}g
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
          <span>Protein</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-amber-400 rounded-full mr-1"></div>
          <span>Carbs</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-pink-400 rounded-full mr-1"></div>
          <span>Fats</span>
        </div>
      </div>
    </div>
  );
}
