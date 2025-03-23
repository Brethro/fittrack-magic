
import { format } from "date-fns";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type FoodLogEntry as FoodLogEntryType } from "@/contexts/FoodLogContext";

interface FoodLogEntryProps {
  entry: FoodLogEntryType;
  onEdit: (entry: FoodLogEntryType) => void;
  onDelete: (id: string) => void;
}

const FoodLogEntry = ({ entry, onEdit, onDelete }: FoodLogEntryProps) => {
  // Ensure default nutrition values if any are missing
  const nutrition = {
    calories: entry.nutrition?.calories || 0,
    protein: entry.nutrition?.protein || 0,
    carbs: entry.nutrition?.carbs || 0,
    fat: entry.nutrition?.fat || 0,
  };
  
  return (
    <div className="w-full py-3 px-3 border-b border-border/20 last:border-0">
      <div className="flex flex-col w-full gap-1">
        {/* Food Name and Actions */}
        <div className="flex justify-between items-start w-full gap-1">
          <h4 className="font-medium text-sm text-foreground break-words overflow-hidden overflow-ellipsis max-w-[80%]">{entry.foodName}</h4>
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
        
        {/* Amount and unit */}
        <div className="text-xs text-muted-foreground text-right">
          {entry.amount} {entry.unit}
        </div>
        
        {/* Nutrition badges */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20">
            {Math.round(nutrition.calories)} kcal
          </Badge>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-blue-500/10 text-blue-500 border-blue-300/20">
            P: {nutrition.protein.toFixed(1)}g
          </Badge>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-amber-500/10 text-amber-500 border-amber-300/20">
            C: {nutrition.carbs.toFixed(1)}g
          </Badge>
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-green-500/10 text-green-500 border-green-300/20">
            F: {nutrition.fat.toFixed(1)}g
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default FoodLogEntry;
