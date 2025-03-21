
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meal } from "@/types/diet";

interface MealCardProps {
  meal: Meal;
  regenerateMeal: (mealId: string) => void;
}

export function MealCard({ meal, regenerateMeal }: MealCardProps) {
  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">{meal.name}</h3>
        {meal.id !== "free-meal" && (
          <Button 
            onClick={() => regenerateMeal(meal.id)} 
            variant="ghost" 
            size="sm"
            className="h-8 px-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2 mb-3">
        {meal.foods.map((food) => (
          <div key={food.id} className="flex justify-between items-center p-2 rounded-md bg-accent/20">
            <div>
              <p className="text-sm font-medium">{food.name}</p>
              <p className="text-xs text-muted-foreground">
                {food.servings === 1 
                  ? `${food.servingSize}`
                  : `${food.servings.toFixed(1)} × ${food.servingSize} (${Math.round(food.servings * food.servingSizeGrams)}g)`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">{food.calories} cal</p>
              <p className="text-xs text-muted-foreground">
                P: {food.protein}g C: {food.carbs}g F: {food.fats}g
              </p>
              {food.fiber || food.sugars ? (
                <p className="text-xs text-muted-foreground">
                  {food.fiber ? `Fiber: ${food.fiber}g` : ""}
                  {food.fiber && food.sugars ? " • " : ""}
                  {food.sugars ? `Sugars: ${food.sugars}g` : ""}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-sm pt-2 border-t">
        <span>Total</span>
        <span>{meal.totalCalories} calories</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Macros</span>
        <span>P: {meal.totalProtein}g C: {meal.totalCarbs}g F: {meal.totalFats}g</span>
      </div>
      {meal.totalFiber || meal.totalSugars || meal.netCarbs ? (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Details</span>
          <span>
            {meal.netCarbs !== undefined ? `Net Carbs: ${meal.netCarbs}g` : ""}
            {meal.totalFiber ? ` • Fiber: ${meal.totalFiber}g` : ""}
            {meal.totalSugars ? ` • Sugars: ${meal.totalSugars}g` : ""}
          </span>
        </div>
      ) : null}
      {meal.totalSodium ? (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Sodium</span>
          <span>{meal.totalSodium}mg</span>
        </div>
      ) : null}
    </div>
  );
}
