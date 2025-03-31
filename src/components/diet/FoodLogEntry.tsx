
import { format } from "date-fns";
import { Trash2, Edit, Apple, Pizza, Coffee, Egg } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type FoodLogEntry as FoodLogEntryType } from "@/contexts/FoodLogContext";

interface FoodLogEntryProps {
  entry: FoodLogEntryType;
  onEdit: (entry: FoodLogEntryType) => void;
  onDelete: (id: string) => void;
}

// Food category icons based on common categories
const getFoodIcon = (foodName: string) => {
  const name = foodName.toLowerCase();
  
  if (name.includes("apple") || 
      name.includes("banana") || 
      name.includes("fruit") || 
      name.includes("berry") ||
      name.includes("orange")) {
    return <Apple className="h-5 w-5 text-green-500" />;
  }
  
  if (name.includes("pizza") || 
      name.includes("burger") || 
      name.includes("fries") ||
      name.includes("sandwich") ||
      name.includes("fast food")) {
    return <Pizza className="h-5 w-5 text-amber-500" />;
  }
  
  if (name.includes("coffee") || 
      name.includes("tea") || 
      name.includes("drink") ||
      name.includes("juice") ||
      name.includes("water") ||
      name.includes("milk") ||
      name.includes("smoothie")) {
    return <Coffee className="h-5 w-5 text-blue-500" />;
  }
  
  // Default icon
  return <Egg className="h-5 w-5 text-purple-500" />;
};

const FoodLogEntry = ({ entry, onEdit, onDelete }: FoodLogEntryProps) => {
  // Ensure default nutrition values if any are missing
  const nutrition = {
    calories: entry.nutrition?.calories || 0,
    protein: entry.nutrition?.protein || 0,
    carbs: entry.nutrition?.carbs || 0,
    fat: entry.nutrition?.fat || 0,
  };
  
  // Handler for the delete button
  const handleDelete = () => {
    onDelete(entry.id);
  };
  
  return (
    <div className="w-full py-3 px-3 border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-center w-full gap-3">
        {/* Food Icon */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/30">
          {getFoodIcon(entry.foodName)}
        </div>
        
        {/* Food Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm text-foreground truncate max-w-[70%]">{entry.foodName}</h4>
            <span className="text-sm font-medium">{Math.round(nutrition.calories)} kcal</span>
          </div>
          
          {/* Macro nutrients and serving size */}
          <div className="flex justify-between items-center mt-1">
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <span>P: {nutrition.protein.toFixed(1)}g</span>
              <span>C: {nutrition.carbs.toFixed(1)}g</span>
              <span>F: {nutrition.fat.toFixed(1)}g</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {entry.amount} {entry.unit}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex shrink-0 gap-1 ml-1">
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
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodLogEntry;
