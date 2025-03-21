
import { Flame } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";
import { Progress } from "@/components/ui/progress";

export function NutritionPanel() {
  const { userData } = useUserData();

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

  return (
    <div className="glass-panel rounded-lg p-4 mb-4">
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
    </div>
  );
}

export default NutritionPanel;
