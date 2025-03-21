
import { RefreshCw, Flame, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meal } from "@/types/diet";
import { Card, CardContent } from "@/components/ui/card";

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
  
  // IMPROVED: Calculate percentage difference from target calories
  const caloriePercentDiff = ((totals.totalCalories - calorieTarget) / calorieTarget) * 100;
  const isWithinCalorieTarget = Math.abs(caloriePercentDiff) <= 4; // Stricter 4% tolerance
  const isUnderTarget = caloriePercentDiff < -4; // Under by more than 4%
  const isOverTarget = caloriePercentDiff > 4; // Over by more than 4%
  const isCriticallyOverTarget = caloriePercentDiff > 10; // Over by more than 10%
  const isCriticallyUnderTarget = caloriePercentDiff < -10; // Under by more than 10%
  
  // Calculate protein percentage from target
  const proteinPercentDiff = ((totals.totalProtein - userMacros.protein) / userMacros.protein) * 100;
  const isWithinProteinTarget = Math.abs(proteinPercentDiff) <= 4; // Stricter 4% tolerance
  const isProteinUnderTarget = proteinPercentDiff < -4; // Under by more than 4%
  const isProteinOverTarget = proteinPercentDiff > 4; // Over by more than 4%
  const isProteinCritical = proteinPercentDiff < -10; // Under by more than 10% (critical)
  
  // Determine if there's any critical issue
  const hasCriticalIssue = isProteinCritical || isCriticallyUnderTarget || isCriticallyOverTarget;
  
  // Calculate how many meals are within target range
  const getMealsWithinRange = () => {
    if (mealPlan.length === 0) return 0;
    
    // Count meals within 5% of their proportional target
    const mealsCount = mealPlan.filter(meal => meal.name !== "Free Meal").length;
    if (mealsCount === 0) return 0;
    
    const targetPerMeal = calorieTarget / mealsCount;
    
    return mealPlan
      .filter(meal => meal.name !== "Free Meal") // Exclude free meal
      .filter(meal => {
        const mealDiff = Math.abs((meal.totalCalories - targetPerMeal) / targetPerMeal);
        return mealDiff <= 0.05; // Within 5% of target
      })
      .length;
  };
  
  const mealsWithinTarget = getMealsWithinRange();
  const totalRegularMeals = mealPlan.filter(meal => meal.name !== "Free Meal").length;
  const allMealsWithinTarget = mealsWithinTarget === totalRegularMeals && totalRegularMeals > 0;

  return (
    <div className={`glass-panel rounded-lg p-4 mb-4 ${hasCriticalIssue ? 'border-2 border-orange-500' : !isWithinCalorieTarget || !isWithinProteinTarget ? 'border border-yellow-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Daily Totals</h2>
        <Button 
          onClick={generateMealPlan} 
          variant="outline" 
          size="sm"
          className={hasCriticalIssue ? "bg-orange-500/20 border-orange-500 hover:bg-orange-500/30" : ""}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Calories Card */}
        <Card className={`p-3 text-center ${isCriticallyUnderTarget ? 'bg-orange-500/10 border-orange-500' : isCriticallyOverTarget ? 'bg-orange-500/10 border-orange-500' : isUnderTarget ? 'bg-yellow-500/10 border-yellow-500' : isOverTarget ? 'bg-yellow-500/10 border-yellow-500' : ''}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className={`w-5 h-5 ${isCriticallyUnderTarget || isCriticallyOverTarget ? 'text-orange-500' : isUnderTarget || isOverTarget ? 'text-yellow-500' : 'text-orange-400'}`} />
            <p className={`text-2xl font-bold ${isCriticallyUnderTarget || isCriticallyOverTarget ? 'text-orange-500' : isUnderTarget || isOverTarget ? 'text-yellow-500' : ''}`}>{totals.totalCalories}</p>
          </div>
          <p className="text-xs text-muted-foreground">Calories</p>
          {!isWithinCalorieTarget && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <AlertCircle className={`h-3 w-3 ${isCriticallyUnderTarget || isCriticallyOverTarget ? 'text-orange-500' : 'text-yellow-500'}`} />
              <p className={`text-xs font-medium ${isCriticallyUnderTarget || isCriticallyOverTarget ? 'text-orange-500' : 'text-yellow-500'}`}>
                {caloriePercentDiff > 0 ? 'Over' : 'Under'} target by {Math.abs(caloriePercentDiff).toFixed(1)}%
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Target: {calorieTarget} calories
          </p>
          
          {/* NEW: Meal distribution indicator */}
          {!allMealsWithinTarget && totalRegularMeals > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {mealsWithinTarget}/{totalRegularMeals} meals within target range
            </p>
          )}
        </Card>
        
        {/* Macros Card */}
        <Card className="p-3">
          <p className="text-xs text-center font-medium mb-1">Macronutrients</p>
          
          {/* Protein */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
              <span className="text-xs">Protein</span>
            </div>
            <div className="text-xs font-medium">
              <span className={`${isProteinCritical ? 'text-red-500 font-bold' : isProteinUnderTarget ? 'text-orange-500 font-bold' : isProteinOverTarget ? 'text-yellow-600 font-bold' : 'text-blue-500'}`}>
                {totals.totalProtein}g
              </span>
              <span className="text-xs text-muted-foreground ml-1">/ {userMacros.protein}g</span>
            </div>
          </div>
          
          {/* Protein Warning */}
          {!isWithinProteinTarget && (
            <div className="flex items-center gap-1 mb-1 ml-3">
              <AlertCircle className={`h-3 w-3 ${isProteinCritical ? 'text-red-500' : isProteinUnderTarget ? 'text-orange-500' : 'text-yellow-600'}`} />
              <p className={`text-xs font-medium ${isProteinCritical ? 'text-red-500' : isProteinUnderTarget ? 'text-orange-500' : 'text-yellow-600'}`}>
                {proteinPercentDiff < 0 ? 'Under' : 'Over'} by {Math.abs(proteinPercentDiff).toFixed(1)}%
              </p>
            </div>
          )}
          
          {/* Carbs */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-1"></div>
              <span className="text-xs">Carbs</span>
            </div>
            <div className="text-xs font-medium">
              <span className="text-amber-500">{totals.totalCarbs}g</span>
              <span className="text-xs text-muted-foreground ml-1">/ {userMacros.carbs}g</span>
            </div>
          </div>
          
          {/* Fats */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-pink-400 rounded-full mr-1"></div>
              <span className="text-xs">Fats</span>
            </div>
            <div className="text-xs font-medium">
              <span className="text-pink-500">{totals.totalFats}g</span>
              <span className="text-xs text-muted-foreground ml-1">/ {userMacros.fats}g</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="flex h-2 mt-2">
            <div className="bg-blue-400 h-full" style={{ width: `${totals.totalProtein*4/totals.totalCalories*100}%` }}></div>
            <div className="bg-amber-400 h-full" style={{ width: `${totals.totalCarbs*4/totals.totalCalories*100}%` }}></div>
            <div className="bg-pink-400 h-full" style={{ width: `${totals.totalFats*9/totals.totalCalories*100}%` }}></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
