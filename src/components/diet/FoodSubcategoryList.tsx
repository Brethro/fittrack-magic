
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { FoodItem, DietType } from "@/types/diet";
import { cn } from "@/lib/utils";
import { FoodListItem } from "./FoodListItem";
import { getCategoryDisplayName } from "@/utils/diet/foodCategoryHelpers";
import { getFilteredItems } from "./helpers/foodFilterHelpers";

interface FoodSubcategoryListProps {
  categoryName: string;
  subcategoryName: string;
  subcategoryItems: FoodItem[];
  selectedFoods: Record<string, boolean>;
  toggleFoodSelection: (foodId: string) => void;
  toggleAllInGroup: (foodIds: string[]) => void;
  searchQuery: string;
  selectedDiet: DietType;
  openSubcategories: Record<string, boolean>;
  toggleSubcategory: (subcategory: string) => void;
  openFeedbackDialog: (food: FoodItem, event: React.MouseEvent) => void;
  openNutritionDialog: (food: FoodItem) => void;
}

export function FoodSubcategoryList({
  categoryName,
  subcategoryName,
  subcategoryItems,
  selectedFoods,
  toggleFoodSelection,
  toggleAllInGroup,
  searchQuery,
  selectedDiet,
  openSubcategories,
  toggleSubcategory,
  openFeedbackDialog,
  openNutritionDialog
}: FoodSubcategoryListProps) {
  const filteredSubItems = getFilteredItems(subcategoryItems, searchQuery, selectedDiet);
  
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
      open={openSubcategories[subcategoryName]} 
      onOpenChange={() => toggleSubcategory(subcategoryName)}
      className="border rounded-md px-3 py-2 ml-2"
    >
      <div className="flex items-center gap-2">
        {/* Checkbox completely separated from the title area */}
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleAllInGroup(subcategoryFoodIds);
          }}
          className="flex items-center justify-center cursor-pointer p-1"
          aria-label={`Select all in ${displayName}`}
        >
          <Checkbox 
            id={`subcategory-${subcategoryName}`}
            checked={allSubcategorySelected}
            className={someSubcategorySelected && !allSubcategorySelected ? "data-[state=checked]:bg-muted-foreground/50" : ""}
            // Empty function since parent div handles the click
            onCheckedChange={() => {}}
          />
        </div>
        
        {/* CollapsibleTrigger covers ONLY the text area */}
        <CollapsibleTrigger className="flex-1 flex items-center justify-between text-left">
          <Label
            className="text-sm font-medium cursor-pointer flex-1"
          >
            {displayName}
          </Label>
          
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              openSubcategories[subcategoryName] ? "rotate-180" : "rotate-0"
            )} 
          />
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
}
