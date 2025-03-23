
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

interface EmptyFoodPreferencesProps {
  includeFreeMeal: boolean;
  setIncludeFreeMeal: (include: boolean) => void;
  generateMealPlan: () => void;
  dailyCalories: number;
}

export function EmptyFoodPreferences({
  includeFreeMeal,
  setIncludeFreeMeal,
  generateMealPlan,
  dailyCalories
}: EmptyFoodPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-medium mb-2">No Foods Available Yet</h2>
          <p className="text-sm text-muted-foreground">
            Your food database is currently empty. Please add foods to get started.
          </p>
        </div>
        
        <div className="border-t pt-5">
          <h3 className="font-medium mb-3 text-center">Free Meal Option</h3>
          <div className="bg-secondary/40 rounded-lg p-4 flex items-start space-x-3">
            <div className="pt-0.5">
              <Checkbox 
                id="free-meal"
                checked={includeFreeMeal}
                onCheckedChange={() => setIncludeFreeMeal(!includeFreeMeal)}
              />
            </div>
            <div>
              <Label
                htmlFor="free-meal"
                className="text-sm font-medium cursor-pointer"
              >
                Include a free meal in your plan
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Reserve up to {Math.round(dailyCalories * 0.2)} calories (20% of your daily total) for a meal of your choice.
              </p>
            </div>
          </div>
          
          <div className="mt-5">
            <Button 
              onClick={generateMealPlan}
              className="w-full"
              disabled={!includeFreeMeal}
            >
              <Utensils className="mr-2 h-4 w-4" />
              Generate Meal Plan with Free Meal
            </Button>
            {!includeFreeMeal && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Enable the free meal option above to generate a meal plan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
