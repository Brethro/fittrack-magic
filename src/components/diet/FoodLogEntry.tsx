
import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type FoodLogEntry as FoodLogEntryType } from "@/contexts/FoodLogContext";

interface FoodLogEntryProps {
  entry: FoodLogEntryType;
  onEdit: (entry: FoodLogEntryType) => void;
  onDelete: (id: string) => void;
}

const FoodLogEntry = ({ entry, onEdit, onDelete }: FoodLogEntryProps) => {
  // Format time for display
  const formattedTime = format(new Date(entry.date), "h:mm a");
  
  // Color mapping for meal types
  const mealColors: Record<string, string> = {
    breakfast: "bg-amber-500/10 text-amber-500 border-amber-300/20",
    lunch: "bg-green-500/10 text-green-500 border-green-300/20",
    dinner: "bg-indigo-500/10 text-indigo-500 border-indigo-300/20",
    snack: "bg-purple-500/10 text-purple-500 border-purple-300/20",
  };
  
  return (
    <div className="glass-panel p-3 rounded-lg hover:shadow-md transition-shadow flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm sm:text-base">{entry.foodName}</h4>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={mealColors[entry.mealType]}>
              {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
        </div>
        
        <div className="text-sm font-light mt-1">
          {entry.amount} {entry.unit}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className="bg-secondary text-secondary-foreground">
            {Math.round(entry.nutrition.calories)} kcal
          </Badge>
          <Badge className="bg-secondary text-secondary-foreground">
            P: {entry.nutrition.protein.toFixed(1)}g
          </Badge>
          <Badge className="bg-secondary text-secondary-foreground">
            C: {entry.nutrition.carbs.toFixed(1)}g
          </Badge>
          <Badge className="bg-secondary text-secondary-foreground">
            F: {entry.nutrition.fat.toFixed(1)}g
          </Badge>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(entry)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer text-destructive" 
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FoodLogEntry;
