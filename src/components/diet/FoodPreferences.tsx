
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Utensils, ChevronDown, Search } from "lucide-react";
import { FoodCategory, DietType, FoodItem } from "@/types/diet";
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
import { foodBelongsToCategory } from "@/utils/diet/foodCategoryHierarchy";
import { getCategoryDisplayName } from "@/utils/diet/foodCategoryHelpers";
import { cn } from "@/lib/utils";

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
  availableDiets: DietType[];
}

// Group food items by their primary category
const groupFoodItemsByCategory = (items: FoodItem[]): Record<string, FoodItem[]> => {
  const groupedItems: Record<string, FoodItem[]> = {};
  
  items.forEach(item => {
    const category = item.primaryCategory;
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });
  
  return groupedItems;
};

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
  availableDiets,
}: FoodPreferencesProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Initialize categories and subcategories as collapsed
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    foodCategories.reduce((acc, category) => ({ ...acc, [category.name]: false }), {})
  );
  // Track open subcategories
  const [openSubcategories, setOpenSubcategories] = useState<Record<string, boolean>>({});
  
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

  // Toggle all foods in a category or subcategory
  const toggleAllInGroup = (foodIds: string[]) => {
    // Check if all foods are currently selected
    const allSelected = foodIds.every(id => selectedFoods[id] !== false);
    
    // If all are selected, deselect all; otherwise select all
    const newValue = !allSelected;
    
    const newSelectedFoods = { ...selectedFoods };
    foodIds.forEach(id => {
      newSelectedFoods[id] = newValue;
    });
    
    setSelectedFoods(newSelectedFoods);
  };

  // Toggle the open/close state of a main category
  const toggleCategory = (category: string) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };

  // Toggle the open/close state of a subcategory
  const toggleSubcategory = (subcategory: string) => {
    setOpenSubcategories({
      ...openSubcategories,
      [subcategory]: !openSubcategories[subcategory],
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

  // Expand categories/subcategories if they contain matched search results
  useEffect(() => {
    if (!searchQuery) return;
    
    // If using fuzzy search with 2+ characters
    const matchedItems = searchQuery.length >= 2 
      ? fuzzyFindFood(searchQuery, foodCategories)
      : [];
    
    const newOpenCategories = { ...openCategories };
    const newOpenSubcategories = { ...openSubcategories };
    
    if (matchedItems.length > 0) {
      // Create sets of categories and subcategories with matches
      const categoriesWithMatches = new Set<string>();
      const subcategoriesWithMatches = new Set<string>();
      
      matchedItems.forEach(item => {
        // Find which main category contains this item
        const mainCategory = foodCategories.find(cat => 
          cat.items.some(food => food.id === item.id)
        )?.name || "";
        
        if (mainCategory) {
          categoriesWithMatches.add(mainCategory);
        }
        
        // Add the item's primary category as a subcategory with matches
        if (item.primaryCategory) {
          subcategoriesWithMatches.add(item.primaryCategory);
        }
      });
      
      // Open those categories
      categoriesWithMatches.forEach(category => {
        newOpenCategories[category] = true;
      });
      
      // Open those subcategories
      subcategoriesWithMatches.forEach(subcategory => {
        newOpenSubcategories[subcategory] = true;
      });
    } else {
      // Fallback to simpler text-based search
      foodCategories.forEach(category => {
        const hasMatch = category.items.some(food => 
          food.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (hasMatch) {
          newOpenCategories[category.name] = true;
          
          // Also check subcategories
          const groupedItems = groupFoodItemsByCategory(category.items);
          Object.entries(groupedItems).forEach(([subcat, items]) => {
            const hasSubMatch = items.some(food => 
              food.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (hasSubMatch) {
              newOpenSubcategories[subcat] = true;
            }
          });
        }
      });
    }
    
    setOpenCategories(newOpenCategories);
    setOpenSubcategories(newOpenSubcategories);
  }, [searchQuery, foodCategories]);

  // Calculate total number of selected foods for user feedback
  const selectedFoodCount = Object.values(selectedFoods).filter(Boolean).length;

  // Filter food items based on search query and diet compatibility
  const getFilteredItems = (items: FoodItem[]) => {
    // If search query is 2 or more characters, use fuzzy search
    if (searchQuery.length >= 2) {
      // Filter within the current items only
      const matchedItemIds = new Set(
        fuzzyFindFood(searchQuery, [{ name: "", items }]).map(item => item.id)
      );
      
      // Return items that match the search
      const searchFiltered = items.filter(food => matchedItemIds.has(food.id));
      
      // If "all" diet is selected, no need for additional filtering
      if (selectedDiet === "all") return searchFiltered;
      
      // For specific diets, only show compatible foods
      return searchFiltered.filter(food => 
        food.diets?.includes(selectedDiet) || 
        foodBelongsToCategory(food, selectedDiet as any)
      );
    }
    
    // Default behavior for short search queries
    const searchFiltered = !searchQuery 
      ? items 
      : items.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If "all" diet is selected, no need for additional filtering
    if (selectedDiet === "all") return searchFiltered;
    
    // For specific diets, only show compatible foods
    return searchFiltered.filter(food => 
      food.diets?.includes(selectedDiet) || 
      foodBelongsToCategory(food, selectedDiet as any)
    );
  };
  
  // Show a message if there are no food categories to display
  if (foodCategories.length === 0 || foodCategories.every(category => category.items.length === 0)) {
    return (
      <div className="space-y-6">
        <DietSelector 
          selectedDiet={selectedDiet}
          onDietChange={setSelectedDiet}
          availableDiets={availableDiets}
        />
        
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
  
  return (
    <div className="space-y-6">
      <DietSelector 
        selectedDiet={selectedDiet}
        onDietChange={setSelectedDiet}
        availableDiets={availableDiets}
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
            const allCategoryFoodIds = category.items.map(food => food.id);
            const allCategorySelected = allCategoryFoodIds.every(id => selectedFoods[id] !== false);
            const someCategorySelected = allCategoryFoodIds.some(id => selectedFoods[id] !== false);
            
            // Group items by their primary category (subcategories)
            const groupedItems = groupFoodItemsByCategory(category.items);
            
            // Skip rendering this category if all its items are filtered out
            const hasFilteredItems = Object.values(groupedItems).some(subItems => 
              getFilteredItems(subItems).length > 0
            );
            
            if (!hasFilteredItems && searchQuery) {
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
                      onCheckedChange={() => toggleAllInGroup(allCategoryFoodIds)}
                    />
                    <Label
                      htmlFor={`category-${category.name}`}
                      className="text-base font-medium cursor-pointer"
                    >
                      {category.displayName || category.name}
                    </Label>
                  </div>
                  <CollapsibleTrigger>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openCategories[category.name] ? "rotate-180" : "rotate-0"
                        )} 
                      />
                      <span className="sr-only">Toggle {category.displayName || category.name}</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="mt-2 space-y-3">
                  {/* Render each subcategory */}
                  {Object.entries(groupedItems).map(([subcategoryName, subcategoryItems]) => {
                    const filteredSubItems = getFilteredItems(subcategoryItems);
                    
                    // Skip rendering empty subcategories
                    if (filteredSubItems.length === 0) {
                      return null;
                    }
                    
                    const subcategoryFoodIds = subcategoryItems.map(food => food.id);
                    const allSubcategorySelected = subcategoryFoodIds.every(id => selectedFoods[id] !== false);
                    const someSubcategorySelected = subcategoryFoodIds.some(id => selectedFoods[id] !== false);
                    const displayName = getCategoryDisplayName(subcategoryName);
                    
                    return (
                      <Collapsible 
                        key={`${category.name}-${subcategoryName}`}
                        open={openSubcategories[subcategoryName]} 
                        onOpenChange={() => toggleSubcategory(subcategoryName)}
                        className="border rounded-md px-3 py-2 ml-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`subcategory-${subcategoryName}`}
                              checked={allSubcategorySelected}
                              className={someSubcategorySelected && !allSubcategorySelected ? "data-[state=checked]:bg-muted-foreground/50" : ""}
                              onCheckedChange={() => toggleAllInGroup(subcategoryFoodIds)}
                            />
                            <Label
                              htmlFor={`subcategory-${subcategoryName}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {displayName}
                            </Label>
                          </div>
                          <CollapsibleTrigger>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ChevronDown 
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform duration-200",
                                  openSubcategories[subcategoryName] ? "rotate-180" : "rotate-0"
                                )} 
                              />
                              <span className="sr-only">Toggle {displayName}</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="mt-2">
                          <div className="grid grid-cols-1 gap-2">
                            {filteredSubItems.map((food) => (
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
