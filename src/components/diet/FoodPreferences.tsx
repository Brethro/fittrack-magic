import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Utensils, ChevronDown, ChevronUp, Search, MessageSquare, FileText } from "lucide-react";
import { FoodCategory, DietType, FoodItem, FoodPrimaryCategory } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { DietSelector } from "./DietSelector";
import { FoodFeedbackDialog } from "./FoodFeedbackDialog";
import { FoodNutritionDialog } from "./FoodNutritionDialog";
import { fuzzyFindFood } from "@/utils/diet/fuzzyMatchUtils";
import { FoodListItem } from "./FoodListItem";

interface FoodPreferencesProps {
  foodCategories: FoodCategory[];
  selectedFoods: Record<string, boolean>;
  setSelectedFoods: (foods: Record<string, boolean>) => void;
  selectedDiet: DietType;
  setSelectedDiet: (diet: DietType) => void;
  includeFreeMeal: boolean;
  setIncludeFreeMeal: (include: boolean) => void;
  generateMealPlan: () => void;
  dailyCalories: number;
}

export function FoodPreferences({
  foodCategories,
  selectedFoods,
  setSelectedFoods,
  selectedDiet,
  setSelectedDiet,
  includeFreeMeal,
  setIncludeFreeMeal,
  generateMealPlan,
  dailyCalories,
}: FoodPreferencesProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Initialize all categories as collapsed
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    foodCategories.reduce((acc, category) => ({ ...acc, [category.name]: false }), {})
  );
  
  // State for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFoodForFeedback, setSelectedFoodForFeedback] = useState<FoodItem | null>(null);
  
  // State for nutrition dialog
  const [nutritionDialogOpen, setNutritionDialogOpen] = useState(false);
  const [selectedFoodForNutrition, setSelectedFoodForNutrition] = useState<FoodItem | null>(null);
  
  // Toggle food selection
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

  // Open feedback dialog for a specific food
  const openFeedbackDialog = (food: FoodItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedFoodForFeedback(food);
    setFeedbackDialogOpen(true);
  };

  // Open nutrition dialog for a specific food
  const openNutritionDialog = (food: FoodItem) => {
    setSelectedFoodForNutrition(food);
    setNutritionDialogOpen(true);
  };

  // Expand a category if it contains matched search results
  useEffect(() => {
    if (!searchQuery) return;
    
    // New: If using fuzzy search
    const matchedItems = searchQuery.length >= 2 
      ? fuzzyFindFood(searchQuery, foodCategories)
      : [];
    
    const newOpenCategories = { ...openCategories };
    
    if (matchedItems.length > 0) {
      // Get all categories with matching items
      const categoriesWithMatches = new Set(
        matchedItems.map(item => item.primaryCategory as FoodPrimaryCategory)
      );
      
      // Open those categories
      foodCategories.forEach(category => {
        if (categoriesWithMatches.has(category.name as FoodPrimaryCategory)) {
          newOpenCategories[category.name] = true;
        }
      });
    } else {
      // Fallback to the old method if no fuzzy matches
      foodCategories.forEach(category => {
        const hasMatch = category.items.some(food => 
          food.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (hasMatch) {
          newOpenCategories[category.name] = true;
        }
      });
    }
    
    setOpenCategories(newOpenCategories);
  }, [searchQuery, foodCategories]);

  // Calculate total number of selected foods for user feedback
  const selectedFoodCount = Object.values(selectedFoods).filter(Boolean).length;

  // Filter food items based on search query and diet compatibility
  const getFilteredItems = (items) => {
    // If search query is 2 or more characters, use fuzzy search
    if (searchQuery.length >= 2) {
      // Filter within the current category's items only
      const matchedItemIds = new Set(
        fuzzyFindFood(searchQuery, [{ name: "", items }]).map(item => item.id)
      );
      
      // Return items that match the search
      const searchFiltered = items.filter(food => matchedItemIds.has(food.id));
      
      // If "all" diet is selected, no need for additional filtering
      if (selectedDiet === "all") return searchFiltered;
      
      // For specific diets, only show compatible foods
      return searchFiltered.filter(food => !food.diets || food.diets.includes(selectedDiet));
    }
    
    // Default behavior for short search queries
    const searchFiltered = !searchQuery 
      ? items 
      : items.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If "all" diet is selected, no need for additional filtering
    if (selectedDiet === "all") return searchFiltered;
    
    // For specific diets, only show compatible foods
    return searchFiltered.filter(food => !food.diets || food.diets.includes(selectedDiet));
  };
  
  return (
    <div className="space-y-6">
      <DietSelector 
        selectedDiet={selectedDiet}
        onDietChange={setSelectedDiet}
      />
      
      <div className="glass-panel rounded-lg p-4">
        <h2 className="text-lg font-medium mb-3">Select Your Preferred Foods</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Check all the foods you enjoy eating. We'll use these to create your personalized meal plan.
          <span className="block mt-1 text-xs italic">Click on any food to see detailed nutrition information.</span>
        </p>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search foods..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          {foodCategories.map((category) => {
            const categoryFoodIds = category.items.map(food => food.id);
            const allCategorySelected = categoryFoodIds.every(id => selectedFoods[id] !== false);
            const someCategorySelected = categoryFoodIds.some(id => selectedFoods[id] !== false);
            const filteredItems = getFilteredItems(category.items);
            
            // Skip rendering this category if all its items are filtered out
            if (filteredItems.length === 0) {
              return null;
            }
            
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
                  <div className="grid grid-cols-1 gap-2">
                    {filteredItems.map((food) => (
                      <FoodListItem
                        key={food.id}
                        food={food}
                        isChecked={selectedFoods[food.id] !== false}
                        onToggleSelection={() => toggleFoodSelection(food.id)}
                        onOpenNutritionDialog={() => openNutritionDialog(food)}
                        onOpenFeedbackDialog={(e) => openFeedbackDialog(food, e)}
                        isHighlighted={searchQuery && food.name.toLowerCase().includes(searchQuery.toLowerCase())}
                      />
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
      
      {/* Feedback Dialog */}
      <FoodFeedbackDialog 
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        foodItem={selectedFoodForFeedback}
        foodCategories={foodCategories}
      />

      {/* Nutrition Dialog */}
      <FoodNutritionDialog
        open={nutritionDialogOpen}
        onClose={() => setNutritionDialogOpen(false)}
        food={selectedFoodForNutrition}
      />
    </div>
  );
}
