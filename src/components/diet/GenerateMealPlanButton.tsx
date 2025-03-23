
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

interface GenerateMealPlanButtonProps {
  generateMealPlan: () => void;
  selectedFoodCount: number;
}

export function GenerateMealPlanButton({ 
  generateMealPlan, 
  selectedFoodCount 
}: GenerateMealPlanButtonProps) {
  return (
    <div className="mt-6">
      <p className="text-sm mb-2">
        <span className={selectedFoodCount < 10 ? "text-destructive font-medium" : "text-muted-foreground"}>
          {selectedFoodCount} foods selected
        </span>
        {selectedFoodCount < 10 && (
          <span className="text-xs ml-2 text-destructive">
            (minimum 10 required)
          </span>
        )}
      </p>
      <Button 
        onClick={generateMealPlan}
        className="w-full"
      >
        <Utensils className="mr-2 h-4 w-4" />
        Generate Meal Plan
      </Button>
    </div>
  );
}
