
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Utensils } from "lucide-react";
import { FoodCategory } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";

interface FoodPreferencesProps {
  foodCategories: FoodCategory[];
  selectedFoods: Record<string, boolean>;
  setSelectedFoods: (foods: Record<string, boolean>) => void;
  includeFreeMeal: boolean;
  setIncludeFreeMeal: (include: boolean) => void;
  generateMealPlan: () => void;
  dailyCalories: number;
}

export function FoodPreferences({
  foodCategories,
  selectedFoods,
  setSelectedFoods,
  includeFreeMeal,
  setIncludeFreeMeal,
  generateMealPlan,
  dailyCalories,
}: FoodPreferencesProps) {
  const { toast } = useToast();
  
  const toggleFoodSelection = (foodId: string) => {
    setSelectedFoods({
      ...selectedFoods,
      [foodId]: !selectedFoods[foodId],
    });
  };

  return (
    <div className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Select Your Preferred Foods</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Check all the foods you enjoy eating. We'll use these to create your personalized meal plan.
        <br />
        <span className="text-xs italic">(All foods are selected by default for testing)</span>
      </p>
      
      <div className="space-y-6">
        {foodCategories.map((category) => (
          <div key={category.name} className="space-y-2">
            <h3 className="font-medium">{category.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((food) => (
                <div key={food.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={food.id}
                    checked={selectedFoods[food.id] !== false} // Default to true unless explicitly set to false
                    onCheckedChange={() => toggleFoodSelection(food.id)}
                  />
                  <div className="grid gap-1">
                    <Label
                      htmlFor={food.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {food.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {food.caloriesPerServing} cal | P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {food.servingSize}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="font-medium mb-2">Free Meal Option</h3>
        <div className="flex items-start space-x-2 mb-3">
          <Checkbox 
            id="free-meal"
            checked={includeFreeMeal}
            onCheckedChange={() => setIncludeFreeMeal(!includeFreeMeal)}
          />
          <div>
            <Label
              htmlFor="free-meal"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include a free meal
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Reserve up to {Math.round(dailyCalories * 0.2)} calories (20% of your daily total) for a meal of your choice.
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={generateMealPlan}
        className="w-full mt-6"
      >
        <Utensils className="mr-2 h-4 w-4" />
        Generate Meal Plan
      </Button>
    </div>
  );
}
