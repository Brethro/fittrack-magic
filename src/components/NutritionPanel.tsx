import { Flame, InfoIcon, AlertTriangle, HelpCircle } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { calculateMacroCalories } from "@/utils/nutritionCalculator";

export function NutritionPanel() {
  const { userData } = useUserData();
  const isWeightGain = userData.isWeightGain || false;
  const highSurplusWarning = userData.highSurplusWarning || false;

  // Calculate macro calorie contributions using our utility
  const macroCalories = calculateMacroCalories({
    calories: userData.dailyCalories || 0,
    protein: userData.macros.protein || 0,
    carbs: userData.macros.carbs || 0,
    fat: userData.macros.fats || 0
  });
  
  const totalCalories = userData.dailyCalories || 0;
  const tdee = userData.tdee || 0;
  const surplusAmount = isWeightGain ? totalCalories - tdee : 0;
  const deficitAmount = !isWeightGain ? tdee - totalCalories : 0;
  
  // Calculate the exact surplus/deficit percentage with 2 decimal precision for display
  const exactPercentage = isWeightGain 
    ? ((surplusAmount / tdee) * 100) 
    : ((deficitAmount / tdee) * 100);
  
  // Display logic: if it's between 19.5% and 20%, show it as 20%
  // This ensures values very close to 20% (like 19.99%) display as 20%
  let displayPercent;
  if (exactPercentage >= 19.5 && exactPercentage < 20.01) {
    displayPercent = 20;
  } else if (exactPercentage >= 24.5 && exactPercentage < 25.01) {
    displayPercent = 25;
  } else {
    displayPercent = Math.floor(exactPercentage);
  }

  // Determine what deficit percentage is being applied based on goal pace
  const getPaceDeficitPercentage = () => {
    if (!userData.goalPace) return null;
    
    switch (userData.goalPace) {
      case "aggressive": return 25;
      case "moderate": return 20;
      case "conservative": return 15;
      default: return 20;
    }
  };
  
  const pacePercentage = getPaceDeficitPercentage();

  return (
    <div className="glass-panel rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Daily Nutrition</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-primary">
              <InfoIcon className="w-4 h-4" /> 
              <span>About your plan</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-medium">How we calculated your nutrition</h4>
              
              {isWeightGain ? (
                // Weight Gain Explanation - Updated with higher protein recommendations
                <>
                  <p className="text-sm text-muted-foreground">
                    Your daily calories are calculated based on your TDEE (Total Daily Energy Expenditure) with a {displayPercent}% surplus 
                    to help you gain muscle with minimal fat accumulation by your target date.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The protein amount ({userData.macros.protein}g) is designed to maximize muscle protein synthesis—approximately {userData.bodyFatPercentage ? 
                    `${(userData.macros.protein / ((userData.weight || 70) * (1 - (userData.bodyFatPercentage / 100)) / (userData.useMetric ? 1 : 2.2))).toFixed(1)}g per kg` : '2.2-2.6g per kg'} of 
                    lean body mass, which research shows is optimal for muscle growth.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Higher carbohydrates provide energy for intense training sessions and recovery, while fats are set at 30% of total calories to support hormonal health during muscle building.
                  </p>
                </>
              ) : (
                // Weight Loss Explanation with clarified deficit percentage
                <>
                  <p className="text-sm text-muted-foreground">
                    Your daily calories are calculated based on your TDEE (Total Daily Energy Expenditure) with a {displayPercent}% deficit 
                    ({userData.goalPace === "aggressive" ? "maximum" : ""} safe deficit for your body composition).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The high protein amount ({userData.macros.protein}g) is specifically 
                    designed to preserve lean muscle mass during weight loss—approximately {userData.bodyFatPercentage ? 
                    `${(userData.macros.protein / ((userData.weight || 70) * (1 - (userData.bodyFatPercentage / 100)) / (userData.useMetric ? 1 : 2.2))).toFixed(1)}g per kg` : '2.0-2.4g per kg'} of 
                    lean body mass.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fats are set at 25% of total calories for hormone production, with remaining calories allocated to carbs for energy.
                  </p>
                  
                  <div className="pt-2 mt-2 border-t">
                    <p className="text-xs text-muted-foreground font-medium">Safe deficit limits:</p>
                    <ul className="text-xs text-muted-foreground ml-4 list-disc space-y-1 mt-1">
                      <li>Conservative: 15% deficit</li>
                      <li>Moderate: 20% deficit</li>
                      <li>Aggressive: 25% deficit</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-1">
                      These limits are adjusted based on your body fat percentage to ensure safety.
                    </p>
                  </div>
                </>
              )}
              
              <div className="pt-2 border-t mt-2">
                <p className="text-xs text-muted-foreground">
                  We use the {userData.bodyFatPercentage ? 'Katch-McArdle' : 'Mifflin-St Jeor'} equation 
                  to calculate your BMR, then apply activity multipliers. The macro balance is optimized for your 
                  {isWeightGain ? ' muscle building goals, with enhanced protein for optimal muscle growth and sufficient carbohydrates for training energy and recovery.' : ' goal of preserving muscle during fat loss, which research shows requires higher protein intake than maintenance.'}
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {isWeightGain && highSurplusWarning && displayPercent > 20 && (
        <Alert variant="warning" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your {displayPercent}% caloric surplus ({surplusAmount} calories above maintenance) is high and may lead to increased fat gain. Consider a longer timeframe for optimal muscle-to-fat ratio.
          </AlertDescription>
        </Alert>
      )}
      
      {!isWeightGain && userData.goalPace === "aggressive" && userData.bodyFatPercentage && userData.bodyFatPercentage < 12 && (
        <Alert variant="warning" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            With your low body fat of {userData.bodyFatPercentage}%, we've limited your deficit to 25% of TDEE. Larger deficits could risk muscle loss and metabolic slowdown.
          </AlertDescription>
        </Alert>
      )}
      
      {!isWeightGain && (
        <Alert variant="default" className="mb-3 bg-primary/5 border-primary/20">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Understanding your calorie target</AlertTitle>
          <AlertDescription>
            Based on your selected pace ({userData.goalPace}), we've applied a {pacePercentage}% deficit to your TDEE. This creates a {deficitAmount} calorie daily deficit, which is {userData.goalPace === "aggressive" ? "at the maximum" : "within"} safe range for your body composition.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Calories (full width) */}
      <div className="glass-card rounded-lg p-3 text-center mb-3">
        <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
        <p className="text-lg font-bold">{userData.dailyCalories}</p>
        <p className="text-xs text-muted-foreground">
          Calories
          {isWeightGain ? ` (${displayPercent}% Surplus)` : ` (${displayPercent}% Deficit)`}
        </p>
      </div>
      
      {/* Macros (three columns) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <div className="glass-card rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-blue-400 text-sm font-bold">Protein</span>
            <span className="text-xs">{(macroCalories.protein / macroCalories.total * 100).toFixed(0)}%</span>
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
            <span className="text-xs">{(macroCalories.carbs / macroCalories.total * 100).toFixed(0)}%</span>
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
            <span className="text-xs">{(macroCalories.fat / macroCalories.total * 100).toFixed(0)}%</span>
          </div>
          <p className="text-lg font-bold">{userData.macros.fats}g</p>
          <Progress 
            value={Math.round(macroCalories.fat / totalCalories * 100)} 
            className="h-1.5 mt-1 bg-pink-950"
            indicatorClassName="bg-pink-400"
          />
          <p className="text-xs text-right mt-1">{macroCalories.fat} cal</p>
        </div>
      </div>
    </div>
  );
}

export default NutritionPanel;
