
import { Button } from "@/components/ui/button";
import { Utensils, Loader2 } from "lucide-react";

interface GenerateMealPlanButtonProps {
  generateMealPlan: () => void;
  selectedFoodCount: number;
  isLoading?: boolean;
}

export function GenerateMealPlanButton({ 
  generateMealPlan, 
  selectedFoodCount,
  isLoading = false
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
        disabled={selectedFoodCount < 10 || isLoading}
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Utensils className="mr-2 h-5 w-5" />
        )}
        {isLoading ? "Generating Meal Plan..." : "Generate Meal Plan"}
      </Button>
    </div>
  );
}
