
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { FoodCategory, FoodItem, DietType } from "@/types/diet";
import { cn } from "@/lib/utils";
import { FoodSubcategoryList } from "./FoodSubcategoryList";
import { groupFoodItemsByCategory } from "./helpers/foodGroupingHelpers";
import { getFilteredItems } from "./helpers/foodFilterHelpers";

interface FoodCategoryListProps {
  foodCategories: FoodCategory[];
  selectedFoods: Record<string, boolean>;
  toggleFoodSelection: (foodId: string) => void;
  toggleAllInGroup: (foodIds: string[]) => void;
  searchQuery: string;
  selectedDiet: DietType;
  openCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  openSubcategories: Record<string, boolean>;
  toggleSubcategory: (subcategory: string) => void;
  openFeedbackDialog: (food: FoodItem, event: React.MouseEvent) => void;
  openNutritionDialog: (food: FoodItem) => void;
}

export function FoodCategoryList({
  foodCategories,
  selectedFoods,
  toggleFoodSelection,
  toggleAllInGroup,
  searchQuery,
  selectedDiet,
  openCategories,
  toggleCategory,
  openSubcategories,
  toggleSubcategory,
  openFeedbackDialog,
  openNutritionDialog
}: FoodCategoryListProps) {
  return (
    <div className="space-y-4">
      {foodCategories.map((category) => {
        const allCategoryFoodIds = category.items.map(food => food.id);
        const allCategorySelected = allCategoryFoodIds.every(id => selectedFoods[id] !== false);
        const someCategorySelected = allCategoryFoodIds.some(id => selectedFoods[id] !== false);
        
        // Group items by their primary category (subcategories)
        const groupedItems = groupFoodItemsByCategory(category.items);
        
        // Skip rendering this category if all its items are filtered out
        const hasFilteredItems = Object.values(groupedItems).some(subItems => 
          getFilteredItems(subItems, searchQuery, selectedDiet).length > 0
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
            <div className="flex items-center gap-2">
              {/* Checkbox completely separated from the title area */}
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleAllInGroup(allCategoryFoodIds);
                }}
                className="flex items-center justify-center cursor-pointer p-1"
                aria-label={`Select all in ${category.displayName || category.name}`}
              >
                <Checkbox 
                  id={`category-${category.name}`}
                  checked={allCategorySelected}
                  className={someCategorySelected && !allCategorySelected ? "data-[state=checked]:bg-muted-foreground/50" : ""}
                  // Empty function since parent div handles the click
                  onCheckedChange={() => {}}
                />
              </div>
              
              {/* CollapsibleTrigger covers ONLY the text area */}
              <CollapsibleTrigger className="flex-1 flex items-center justify-between text-left">
                <Label
                  className="text-base font-medium cursor-pointer flex-1"
                >
                  {category.displayName || category.name}
                </Label>
                
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    openCategories[category.name] ? "rotate-180" : "rotate-0"
                  )} 
                />
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2 space-y-3">
              {/* Render each subcategory */}
              {Object.entries(groupedItems).map(([subcategoryName, subcategoryItems]) => (
                <FoodSubcategoryList
                  key={`${category.name}-${subcategoryName}`}
                  categoryName={category.name}
                  subcategoryName={subcategoryName}
                  subcategoryItems={subcategoryItems}
                  selectedFoods={selectedFoods}
                  toggleFoodSelection={toggleFoodSelection}
                  toggleAllInGroup={toggleAllInGroup}
                  searchQuery={searchQuery}
                  selectedDiet={selectedDiet}
                  openSubcategories={openSubcategories}
                  toggleSubcategory={toggleSubcategory}
                  openFeedbackDialog={openFeedbackDialog}
                  openNutritionDialog={openNutritionDialog}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
