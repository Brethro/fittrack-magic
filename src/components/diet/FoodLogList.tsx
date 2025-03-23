
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
  
  return (
    <div className="glass-panel rounded-lg flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-medium">Food Log: {getDateHeader()}</h3>
      </div>
      
      <ScrollArea className="flex-1">
        {dailyEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
            <Utensils className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-base font-medium">No foods logged yet</p>
            <p className="text-xs text-muted-foreground max-w-[220px] mt-1">
              Search for foods and add them to your daily log to track your nutrition
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Breakfast */}
            {mealGroups.breakfast.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-amber-500 mb-2">Breakfast</h4>
                <div className="space-y-2">
                  {mealGroups.breakfast.map(entry => (
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
              <div>
                <h4 className="text-xs font-medium text-green-500 mb-2">Lunch</h4>
                <div className="space-y-2">
                  {mealGroups.lunch.map(entry => (
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
              <div>
                <h4 className="text-xs font-medium text-indigo-500 mb-2">Dinner</h4>
                <div className="space-y-2">
                  {mealGroups.dinner.map(entry => (
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
              <div>
                <h4 className="text-xs font-medium text-purple-500 mb-2">Snacks</h4>
                <div className="space-y-2">
                  {mealGroups.snack.map(entry => (
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
        )}
      </ScrollArea>
    </div>
  );
};

export default FoodLogList;
