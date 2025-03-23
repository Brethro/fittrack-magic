
import { Checkbox } from "@/components/ui/checkbox";
import { FoodItem } from "@/types/diet";
import { Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodListItemProps {
  food: FoodItem;
  isChecked: boolean;
  onToggleSelection: () => void;
  onOpenNutritionDialog: () => void;
  onOpenFeedbackDialog: (event: React.MouseEvent) => void;
  isHighlighted?: boolean;
  isDisabled?: boolean;
  showSearchIcon?: boolean;
}

export function FoodListItem({
  food,
  isChecked,
  onToggleSelection,
  onOpenNutritionDialog,
  onOpenFeedbackDialog,
  isHighlighted = false,
  isDisabled = false,
  showSearchIcon = false
}: FoodListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-2 rounded-md p-2 cursor-pointer hover:bg-muted/50 transition-colors",
        isHighlighted && "bg-yellow-100/50 dark:bg-yellow-900/20",
        isDisabled && "opacity-70 cursor-not-allowed"
      )}
      onClick={() => {
        if (!isDisabled) {
          onOpenNutritionDialog();
        }
      }}
    >
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if (!isDisabled) {
            onToggleSelection();
          }
        }} 
        className="p-1"
      >
        <Checkbox 
          checked={isChecked}
          onCheckedChange={() => {}}
          disabled={isDisabled}
        />
      </div>
      <div className="flex flex-1 items-center">
        <span className="text-sm font-medium">
          {food.name}
          {showSearchIcon && <Search className="inline-block ml-1 h-3 w-3 text-muted-foreground" />}
        </span>
        <div className="ml-auto flex items-center space-x-1">
          <button
            type="button"
            onClick={(e) => {
              if (!isDisabled) {
                onOpenFeedbackDialog(e);
              }
            }}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground"
            title="Report issue with this food"
            disabled={isDisabled}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
