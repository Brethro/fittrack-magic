
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meal } from "@/types/diet";
import { DailyTotals } from "./DailyTotals";
import { MealCard } from "./MealCard";
import { Card, CardContent } from "@/components/ui/card";

interface MealPlanDisplayProps {
  mealPlan: Meal[];
  generateMealPlan: () => void;
  regenerateMeal: (mealId: string) => void;
  setActiveTab: (tab: string) => void;
  calorieTarget: number;
  userMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function MealPlanDisplay({ 
  mealPlan, 
  generateMealPlan, 
  regenerateMeal, 
  setActiveTab,
  calorieTarget,
  userMacros
}: MealPlanDisplayProps) {
  if (mealPlan.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CardContent className="pt-6">
          <Utensils className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No meal plan yet</h3>
          <p className="text-muted-foreground mb-4">
            Select your food preferences and generate a meal plan to get started.
          </p>
          <Button onClick={() => setActiveTab("preferences")}>
            Select Food Preferences
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <DailyTotals 
        mealPlan={mealPlan} 
        generateMealPlan={generateMealPlan} 
        calorieTarget={calorieTarget}
        userMacros={userMacros}
      />
      
      <div className="space-y-4">
        {mealPlan.map((meal) => (
          <MealCard 
            key={meal.id} 
            meal={meal} 
            regenerateMeal={regenerateMeal} 
          />
        ))}
      </div>
    </>
  );
}
