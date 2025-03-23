
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
  
  // Ensure default nutrition values if any are missing
  const nutrition = {
    calories: entry.nutrition?.calories || 0,
    protein: entry.nutrition?.protein || 0,
    carbs: entry.nutrition?.carbs || 0,
    fat: entry.nutrition?.fat || 0,
  };
  
  return (
    <div className="w-full bg-background/50 border border-border/40 rounded-md p-3 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Food name and time */}
          <div className="flex justify-between items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate pr-2">{entry.foodName}</h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedTime}</span>
          </div>
          
          {/* Amount and unit */}
          <div className="text-xs text-muted-foreground mb-2">
            {entry.amount} {entry.unit}
          </div>
          
          {/* Nutrition badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-primary/10 text-primary border-primary/20">
              {Math.round(nutrition.calories)} kcal
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-blue-500/10 text-blue-500 border-blue-300/20">
              P: {nutrition.protein.toFixed(1)}g
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-amber-500/10 text-amber-500 border-amber-300/20">
              C: {nutrition.carbs.toFixed(1)}g
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-green-500/10 text-green-500 border-green-300/20">
              F: {nutrition.fat.toFixed(1)}g
            </Badge>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground"
            onClick={() => onEdit(entry)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-destructive"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodLogEntry;
