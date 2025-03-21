
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare } from "lucide-react";
import { FoodItem } from "@/types/diet";

interface FoodListItemProps {
  food: FoodItem;
  isChecked: boolean;
  onToggleSelection: () => void;
  onOpenNutritionDialog: () => void;
  onOpenFeedbackDialog: (e: React.MouseEvent) => void;
  isHighlighted: boolean;
}

export function FoodListItem({
  food,
  isChecked,
  onToggleSelection,
  onOpenNutritionDialog,
  onOpenFeedbackDialog,
  isHighlighted
}: FoodListItemProps) {
  return (
    <div 
      className={`p-3 rounded hover:bg-muted/50 transition-colors cursor-pointer ${
        isHighlighted ? "bg-muted/40" : ""
      }`}
      onClick={onOpenNutritionDialog}
    >
      <div className="flex items-start">
        <Checkbox 
          id={food.id}
          checked={isChecked} 
          onCheckedChange={onToggleSelection}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <Label
              htmlFor={food.id}
              className="text-sm font-medium cursor-pointer flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {food.name}
              <FileText className="h-3 w-3 ml-1 text-muted-foreground" />
            </Label>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 -mr-1"
              onClick={onOpenFeedbackDialog}
              title="Suggest different category"
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Calories and Macros Display */}
          <div className="mt-2 flex items-start">
            <div className="min-w-[60px] text-md font-semibold">
              {food.caloriesPerServing} <span className="text-xs text-muted-foreground">cal</span>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap justify-start gap-4">
                <MacroIndicator type="P" value={food.protein || 0} color="bg-blue-500" />
                <MacroIndicator type="C" value={food.carbs || 0} color="bg-amber-500" />
                <MacroIndicator type="F" value={food.fats || 0} color="bg-pink-500" />
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            {food.servingSize}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MacroIndicatorProps {
  type: string;
  value: number;
  color: string;
}

function MacroIndicator({ type, value, color }: MacroIndicatorProps) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-sm font-medium">{type}:</span>
      <span className="text-sm">{value}g</span>
    </div>
  );
}
