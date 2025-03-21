
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Utensils, ChevronDown, ChevronUp } from "lucide-react";
import { FoodCategory } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

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
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    foodCategories.reduce((acc, category) => ({ ...acc, [category.name]: true }), {})
  );
  
  const toggleFoodSelection = (foodId: string) => {
    setSelectedFoods({
      ...selectedFoods,
      [foodId]: !selectedFoods[foodId],
    });
  };

  // Toggle all foods in a category
  const toggleAllInCategory = (category: string, foodIds: string[]) => {
    // Check if all foods in category are currently selected
    const allSelected = foodIds.every(id => selectedFoods[id] !== false);
    
    // If all are selected, deselect all; otherwise select all
    const newValue = !allSelected;
    
    const newSelectedFoods = { ...selectedFoods };
    foodIds.forEach(id => {
      newSelectedFoods[id] = newValue;
    });
    
    setSelectedFoods(newSelectedFoods);
  };

  // Toggle the open/close state of a category
  const toggleCategory = (category: string) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };

  // Calculate total number of selected foods for user feedback
  const selectedFoodCount = Object.values(selectedFoods).filter(Boolean).length;

  return (
    <div className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Select Your Preferred Foods</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Check all the foods you enjoy eating. We'll use these to create your personalized meal plan.
        <br />
        <span className="text-xs italic">(All foods are selected by default for testing)</span>
      </p>
      
      <div className="space-y-4">
        {foodCategories.map((category) => {
          const categoryFoodIds = category.items.map(food => food.id);
          const allCategorySelected = categoryFoodIds.every(id => selectedFoods[id] !== false);
          const someCategorySelected = categoryFoodIds.some(id => selectedFoods[id] !== false);
          
          return (
            <Collapsible 
              key={category.name}
              open={openCategories[category.name]} 
              onOpenChange={() => toggleCategory(category.name)}
              className="border rounded-md px-4 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.name}`}
                    checked={allCategorySelected}
                    className={someCategorySelected && !allCategorySelected ? "data-[state=checked]:bg-muted-foreground/50" : ""}
                    onCheckedChange={() => toggleAllInCategory(category.name, categoryFoodIds)}
                  />
                  <Label
                    htmlFor={`category-${category.name}`}
                    className="text-base font-medium cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {openCategories[category.name] ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />}
                    <span className="sr-only">Toggle {category.name}</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.items.map((food) => (
                    <div key={food.id} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/30">
                      <Checkbox 
                        id={food.id}
                        checked={selectedFoods[food.id] !== false} 
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
              </CollapsibleContent>
            </Collapsible>
          );
        })}
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
    </div>
  );
}
