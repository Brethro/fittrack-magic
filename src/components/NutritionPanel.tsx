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

function MacroBreakdown({ macroCalories, totalCalories, macros }: {
  macroCalories: { protein: number; carbs: number; fat: number; total: number };
  totalCalories: number;
  macros: { protein: number | null; carbs: number | null; fats: number | null };
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Protein */}
      <div className="glass-card rounded-lg p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-blue-400 text-sm font-bold">Protein</span>
          <span className="text-xs">{(macroCalories.protein / macroCalories.total * 100).toFixed(0)}%</span>
        </div>
        <p className="text-lg font-bold">{macros.protein}g</p>
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
        <p className="text-lg font-bold">{macros.carbs}g</p>
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
        <p className="text-lg font-bold">{macros.fats}g</p>
        <Progress
          value={Math.round(macroCalories.fat / totalCalories * 100)}
          className="h-1.5 mt-1 bg-pink-950"
          indicatorClassName="bg-pink-400"
        />
        <p className="text-xs text-right mt-1">{macroCalories.fat} cal</p>
      </div>
    </div>
  );
}

function CalorieSummary({ totalCalories, tdee, isWeightGain, exactPercentage }: {
  totalCalories: number;
  tdee: number;
  isWeightGain: boolean;
  exactPercentage: string;
}) {
  // FIXED: Use a consistent display for the surplus/deficit percentage
  return (
    <div className="glass-card rounded-lg p-3 text-center mb-3">
      <Flame className="w-5 h-5 mx-auto mb-1 text-orange-400" />
      <p className="text-lg font-bold">{totalCalories}</p>
      <p className="text-xs text-muted-foreground">
        Calories
        {isWeightGain ? ` (${exactPercentage}% Surplus)` : ` (${exactPercentage}% Deficit)`}
      </p>
    </div>
  );
}

function PlanExplanation({ userData, displayPercent, deficitWasLimited }: {
  userData: any;
  displayPercent: number;
  deficitWasLimited: boolean;
}) {
  const isWeightGain = userData.isWeightGain || false;

  const getMaxAllowedDeficit = () => {
    if (!userData.bodyFatPercentage) return 25; // Default max

    if (userData.bodyFatPercentage < 10) {
      return 20; // Cap at 20% for very low body fat
    } else if (userData.bodyFatPercentage < 12) {
      return 22; // Slightly higher for low body fat
    } else if (userData.bodyFatPercentage < 15) {
      return 25; // Standard 25% for normal body fat
    } else {
      return 30; // Higher for higher body fat
    }
  };

  const getTargetDeficitPercentage = () => {
    if (!userData.goalPace) return 20; // Default

    let baseDeficit;
    switch (userData.goalPace) {
      case "aggressive": baseDeficit = 25; break;
      case "moderate": baseDeficit = 20; break;
      case "conservative": baseDeficit = 15; break;
      default: baseDeficit = 20;
    }

    const maxAllowed = getMaxAllowedDeficit();
    return Math.min(baseDeficit, maxAllowed);
  };

  const targetDeficitPercentage = getTargetDeficitPercentage();
  const maxAllowedDeficitBasic = getMaxAllowedDeficit();

  const aggressiveBonusApplied = userData.goalPace === "aggressive" && !isWeightGain
    ? Math.min(5, 35 - maxAllowedDeficitBasic)
    : 0;

  const finalMaxDeficit = maxAllowedDeficitBasic + aggressiveBonusApplied;

  const getStandardSurplusForPace = () => {
    if (!userData.goalPace) return 10;

    switch (userData.goalPace) {
      case "aggressive": return 20;
      case "moderate": return 15;
      case "conservative": return 10;
      default: return 10;
    }
  };

  const standardSurplus = getStandardSurplusForPace();
  const tdee = userData.tdee || 0;
  const dailyCalories = userData.dailyCalories || 0;
  const surplusAmount = isWeightGain ? dailyCalories - tdee : 0;
  const deficitAmount = !isWeightGain ? tdee - dailyCalories : 0;
  const isTimelineDriven = userData.isTimelineDriven || false;
  const highSurplusWarning = userData.highSurplusWarning || false;

  return (
    <>
      {isWeightGain && isTimelineDriven && displayPercent > standardSurplus && (
        <Alert variant="warning" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your {displayPercent}% caloric surplus exceeds the standard {standardSurplus}% for {userData.goalPace} pace.
            This higher surplus is needed to reach your goal weight by your target date, but may lead to more fat gain.
            Consider extending your timeline for better muscle-to-fat ratio.
          </AlertDescription>
        </Alert>
      )}

      {isWeightGain && highSurplusWarning && !isTimelineDriven && displayPercent > 20 && (
        <Alert variant="warning" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your {displayPercent}% caloric surplus ({surplusAmount} calories above maintenance) is high and may lead to increased fat gain. Consider a longer timeframe for optimal muscle-to-fat ratio.
          </AlertDescription>
        </Alert>
      )}

      {!isWeightGain && userData.bodyFatPercentage && userData.bodyFatPercentage < 12 && (
        <Alert variant="warning" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            With your low body fat of {userData.bodyFatPercentage}%, we've limited your maximum deficit to {maxAllowedDeficitBasic}% of TDEE.
            {userData.goalPace === "aggressive" && aggressiveBonusApplied > 0 &&
              ` When selecting aggressive pace, an additional ${aggressiveBonusApplied}% is added (total ${finalMaxDeficit}%).`}
          </AlertDescription>
        </Alert>
      )}

      {!isWeightGain && (
        <Alert variant="default" className="mb-3 bg-primary/5 border-primary/20">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Understanding your calorie target</AlertTitle>
          <AlertDescription>
            Based on your selected pace ({userData.goalPace}), we've applied a {targetDeficitPercentage}% target deficit to your TDEE.
            Your actual deficit is {displayPercent}%, creating a {deficitAmount} calorie daily deficit.
            {displayPercent < targetDeficitPercentage ?
              ` For your low body fat percentage, we've applied safety limits to protect muscle mass.` :
              ` This is within the safe range for your body composition.`}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

function AboutYourPlan({ userData, macroCalories, isWeightGain }: {
  userData: any;
  macroCalories: any;
  isWeightGain: boolean;
}) {
  return (
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
            <>
              <p className="text-sm text-muted-foreground">
                Your daily calories are calculated based on your TDEE (Total Daily Energy Expenditure) with a {Number(userData.calculatedDeficitPercentage).toFixed(1)}% surplus
                to help you gain muscle with minimal fat accumulation by your target date.
              </p>
              <p className="text-sm text-muted-foreground">
                The protein amount ({userData.macros.protein}g) is designed to maximize muscle protein synthesis—approximately {userData.bodyFatPercentage ?
                `${(userData.macros.protein / ((userData.weight || 70) * (1 - (userData.bodyFatPercentage / 100)) / (userData.useMetric ? 1 : 2.2))).toFixed(1)}g per kg` : '2.4-2.8g per kg'} of
                lean body mass, which recent research shows is optimal for muscle growth.
              </p>
              <p className="text-sm text-muted-foreground">
                Carbohydrates provide energy for intense training sessions and recovery, while fats are set at 25% of total calories to support hormonal health during muscle building.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Your daily calories are calculated based on your TDEE (Total Daily Energy Expenditure) with a {Number(userData.calculatedDeficitPercentage).toFixed(1)}% deficit
                (safe deficit for your body composition).
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
                  <li>Aggressive: 25% deficit (up to 30% for higher body fat)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-1">
                  These limits are adjusted based on your body fat percentage to ensure safety.
                </p>
                {userData.bodyFatPercentage && userData.bodyFatPercentage < 15 && (
                  <p className="text-xs text-amber-400 mt-1">
                    Your body fat ({userData.bodyFatPercentage}%) requires reduced deficit to protect muscle mass.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="pt-2 border-t mt-2">
            <p className="text-xs text-muted-foreground">
              We use the {userData.bodyFatPercentage ? 'Katch-McArdle' : 'Mifflin-St Jeor'} equation
              to calculate your BMR, then apply activity multipliers. The macro balance is optimized for your
              {isWeightGain ? ' muscle building goals, with enhanced protein intake (2.4-2.8g/kg of lean body mass) based on recent research showing higher protein intakes are more effective for maximizing muscle protein synthesis.' : ' goal of preserving muscle during fat loss, which research shows requires higher protein intake than maintenance.'}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NutritionPanel() {
  const { userData } = useUserData();
  const isWeightGain = userData.isWeightGain || false;

  const macroCalories = calculateMacroCalories({
    calories: userData.dailyCalories || 0,
    protein: userData.macros.protein || 0,
    carbs: userData.macros.carbs || 0,
    fat: userData.macros.fats || 0
  });

  const totalCalories = userData.dailyCalories || 0;
  const tdee = userData.tdee || 0;
  
  // FIXED: Calculate and display the correct percentage
  let exactPercentage: string;
  
  if (isWeightGain) {
    if (userData.calculatedSurplusPercentage !== undefined) {
      exactPercentage = userData.calculatedSurplusPercentage.toFixed(1);
      // For aggressive pace with non-timeline driven, show exactly 20%
      if (userData.goalPace === 'aggressive' && !userData.isTimelineDriven && 
          parseFloat(exactPercentage) >= 19.5 && parseFloat(exactPercentage) <= 20.5) {
        exactPercentage = '20.0';
      }
    } else {
      const surplusAmount = totalCalories - tdee;
      let surplusPercentage = (surplusAmount / tdee) * 100;
      exactPercentage = surplusPercentage.toFixed(1);
      
      // For aggressive pace, if around 20%, display exactly 20%
      if (userData.goalPace === 'aggressive' && !userData.isTimelineDriven &&
          surplusPercentage >= 19.5 && surplusPercentage <= 20.5) {
        exactPercentage = '20.0';
      }
    }
  } else {
    exactPercentage = userData.calculatedDeficitPercentage !== undefined ? 
      userData.calculatedDeficitPercentage.toFixed(1) : 
      ((tdee - totalCalories) / tdee * 100).toFixed(1);
  }

  // For display as an integer
  const displayPercent = Math.round(parseFloat(exactPercentage));

  const getMaxAllowedDeficit = () => {
    if (!userData.bodyFatPercentage) return 25;

    if (userData.bodyFatPercentage < 10) {
      return 20;
    } else if (userData.bodyFatPercentage < 12) {
      return 22;
    } else if (userData.bodyFatPercentage < 15) {
      return 25;
    } else {
      return 30;
    }
  };

  const getTargetDeficitPercentage = () => {
    if (!userData.goalPace) return 20;

    let baseDeficit;
    switch (userData.goalPace) {
      case "aggressive": baseDeficit = 25; break;
      case "moderate": baseDeficit = 20; break;
      case "conservative": baseDeficit = 15; break;
      default: baseDeficit = 20;
    }

    const maxAllowed = getMaxAllowedDeficit();
    return Math.min(baseDeficit, maxAllowed);
  };

  const targetDeficitPercentage = getTargetDeficitPercentage();
  const maxAllowedDeficitBasic = getMaxAllowedDeficit();

  const deficitWasLimited = !isWeightGain &&
    userData.bodyFatPercentage &&
    userData.bodyFatPercentage < 12 &&
    userData.goalPace === "aggressive";

  const aggressiveBonusApplied = userData.goalPace === "aggressive" && !isWeightGain
    ? Math.min(5, 35 - maxAllowedDeficitBasic)
    : 0;

  const finalMaxDeficit = maxAllowedDeficitBasic + aggressiveBonusApplied;

  const getStandardSurplusForPace = () => {
    if (!userData.goalPace) return 10;

    switch (userData.goalPace) {
      case "aggressive": return 20;
      case "moderate": return 15;
      case "conservative": return 10;
      default: return 10;
    }
  };

  const standardSurplus = getStandardSurplusForPace();
  const isTimelineDriven = userData.isTimelineDriven || false;
  const highSurplusWarning = userData.highSurplusWarning || false;

  return (
    <div className="glass-panel rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Daily Nutrition</h2>
        <AboutYourPlan userData={userData} macroCalories={macroCalories} isWeightGain={isWeightGain} />
      </div>

      <PlanExplanation
        userData={userData}
        displayPercent={displayPercent}
        deficitWasLimited={deficitWasLimited}
      />

      <CalorieSummary
        totalCalories={totalCalories}
        tdee={tdee}
        isWeightGain={isWeightGain}
        exactPercentage={exactPercentage}
      />

      <MacroBreakdown
        macroCalories={macroCalories}
        totalCalories={totalCalories}
        macros={userData.macros}
      />
    </div>
  );
}

export default NutritionPanel;
