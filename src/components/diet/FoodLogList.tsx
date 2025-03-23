
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Utensils } from "lucide-react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import FoodLogEntry from "./FoodLogEntry";

interface FoodLogListProps {
  onEditEntry?: (entry: any) => void;
}

const FoodLogList = ({ onEditEntry }: FoodLogListProps) => {
  const { currentDate, getDailyFoodLog, deleteFoodEntry } = useFoodLog();
  
  // Get food entries for current date
  const dailyEntries = getDailyFoodLog(currentDate);
  
  // Group entries by meal type
  const mealGroups = {
    breakfast: dailyEntries.filter(entry => entry.mealType === "breakfast"),
    lunch: dailyEntries.filter(entry => entry.mealType === "lunch"),
    dinner: dailyEntries.filter(entry => entry.mealType === "dinner"),
    snack: dailyEntries.filter(entry => entry.mealType === "snack"),
  };
  
  // Helper function to format date header
  const getDateHeader = () => {
    if (isToday(currentDate)) {
      return "Today";
    } else if (isYesterday(currentDate)) {
      return "Yesterday";
    } else {
      return format(currentDate, "EEEE, MMMM d");
    }
  };
  
  // Handle editing a log entry
  const handleEdit = (entry: any) => {
    if (onEditEntry) {
      onEditEntry(entry);
    }
  };
  
  // Handle deleting a log entry
  const handleDelete = (id: string) => {
    deleteFoodEntry(id);
  };
  
  // Meal type styling
  const mealTypeStyles = {
    breakfast: "text-amber-500",
    lunch: "text-green-500",
    dinner: "text-indigo-500",
    snack: "text-purple-500",
  };
  
  return (
    <div className="h-full flex flex-col border rounded-lg overflow-hidden bg-card">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="text-base font-medium text-left">Food Log: {getDateHeader()}</h3>
      </div>
      
      {dailyEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Utensils className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
          <p className="text-base font-medium">No foods logged yet</p>
          <p className="text-xs text-muted-foreground max-w-[220px] mt-1">
            Use the Quick Add tab to add foods to your daily log
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 w-full">
          <div className="divide-y w-full">
            {/* Breakfast */}
            {mealGroups.breakfast.length > 0 && (
              <div className="p-2 w-full">
                <h4 className={`${mealTypeStyles.breakfast} font-medium px-2 py-1 text-left`}>Breakfast</h4>
                <div className="space-y-2 px-2 mt-1 w-full">
                  {mealGroups.breakfast.map((entry) => (
                    <FoodLogEntry
                      key={entry.id} 
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Lunch */}
            {mealGroups.lunch.length > 0 && (
              <div className="p-2 w-full">
                <h4 className={`${mealTypeStyles.lunch} font-medium px-2 py-1 text-left`}>Lunch</h4>
                <div className="space-y-2 px-2 mt-1 w-full">
                  {mealGroups.lunch.map((entry) => (
                    <FoodLogEntry
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Dinner */}
            {mealGroups.dinner.length > 0 && (
              <div className="p-2 w-full">
                <h4 className={`${mealTypeStyles.dinner} font-medium px-2 py-1 text-left`}>Dinner</h4>
                <div className="space-y-2 px-2 mt-1 w-full">
                  {mealGroups.dinner.map((entry) => (
                    <FoodLogEntry
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Snacks */}
            {mealGroups.snack.length > 0 && (
              <div className="p-2 w-full">
                <h4 className={`${mealTypeStyles.snack} font-medium px-2 py-1 text-left`}>Snacks</h4>
                <div className="space-y-2 px-2 mt-1 w-full">
                  {mealGroups.snack.map((entry) => (
                    <FoodLogEntry
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default FoodLogList;
