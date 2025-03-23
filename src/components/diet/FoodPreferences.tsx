
import { useState, useEffect } from "react";
import { FoodCategory, DietType, FoodItem } from "@/types/diet";
import { useToast } from "@/components/ui/use-toast";
import { FoodFeedbackDialog } from "./FoodFeedbackDialog";
import { FoodNutritionDialog } from "./FoodNutritionDialog";
import { fuzzyFindFood } from "@/utils/diet/fuzzyMatchUtils";
import { FoodSearchBar } from "./FoodSearchBar";
import { FoodCategoryList } from "./FoodCategoryList";
import { FreeMealOption } from "./FreeMealOption";
import { GenerateMealPlanButton } from "./GenerateMealPlanButton";
import { EmptyFoodPreferences } from "./EmptyFoodPreferences";

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
  availableDiets?: DietType[];
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
          const groupedItems = category.items.reduce((acc, item) => {
            const category = item.primaryCategory;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(item);
            return acc;
          }, {} as Record<string, FoodItem[]>);
          
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

  // Show a message if there are no food categories to display
  if (foodCategories.length === 0 || foodCategories.every(category => category.items.length === 0)) {
    return (
      <EmptyFoodPreferences
        includeFreeMeal={includeFreeMeal}
        setIncludeFreeMeal={setIncludeFreeMeal}
        generateMealPlan={generateMealPlan}
        dailyCalories={dailyCalories}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-lg p-4">
        <h2 className="text-lg font-medium mb-3">Select Your Preferred Foods</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Check all the foods you enjoy eating. We'll use these to create your personalized meal plan.
          <span className="block mt-1 text-xs italic">Click on any food to see detailed nutrition information.</span>
        </p>
        
        <FoodSearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <FoodCategoryList
          foodCategories={foodCategories}
          selectedFoods={selectedFoods}
          toggleFoodSelection={toggleFoodSelection}
          toggleAllInGroup={toggleAllInGroup}
          searchQuery={searchQuery}
          selectedDiet={selectedDiet}
          openCategories={openCategories}
          toggleCategory={toggleCategory}
          openSubcategories={openSubcategories}
          toggleSubcategory={toggleSubcategory}
          openFeedbackDialog={openFeedbackDialog}
          openNutritionDialog={openNutritionDialog}
        />

        <FreeMealOption
          includeFreeMeal={includeFreeMeal}
          setIncludeFreeMeal={setIncludeFreeMeal}
          dailyCalories={dailyCalories}
        />
      
        <GenerateMealPlanButton
          generateMealPlan={generateMealPlan}
          selectedFoodCount={selectedFoodCount}
        />
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
