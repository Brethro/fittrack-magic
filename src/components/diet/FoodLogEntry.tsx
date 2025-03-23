
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
  
  // Ensure default nutrition values if any are missing
  const nutrition = {
    calories: entry.nutrition?.calories || 0,
    protein: entry.nutrition?.protein || 0,
    carbs: entry.nutrition?.carbs || 0,
    fat: entry.nutrition?.fat || 0,
    fiber: entry.nutrition?.fiber || 0,
    sugars: entry.nutrition?.sugars || 0,
  };
  
  return (
    <div className="glass-panel p-2.5 rounded-md hover:shadow-md transition-shadow flex justify-between items-start gap-2 w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 w-full">
          <h4 className="font-medium text-sm truncate">{entry.foodName}</h4>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className={`text-xs py-0 px-1.5 h-5 ${mealColors[entry.mealType]}`}>
              {entry.mealType.charAt(0).toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedTime}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-0.5">
          {entry.amount} {entry.unit}
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge variant="secondary" className="text-xs py-0 h-5">
            {Math.round(nutrition.calories)} kcal
          </Badge>
          <Badge variant="secondary" className="text-xs py-0 h-5">
            P: {nutrition.protein.toFixed(1)}g
          </Badge>
          <Badge variant="secondary" className="text-xs py-0 h-5">
            C: {nutrition.carbs.toFixed(1)}g
          </Badge>
          <Badge variant="secondary" className="text-xs py-0 h-5">
            F: {nutrition.fat.toFixed(1)}g
          </Badge>
        </div>
      </div>
      
      <div className="flex items-start gap-1 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" 
          onClick={() => onDelete(entry.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[130px]">
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
    </div>
  );
};

export default FoodLogEntry;
