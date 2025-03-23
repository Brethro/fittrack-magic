
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
    <div className="glass-panel rounded-lg">
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium">Food Log: {getDateHeader()}</h3>
      </div>
      
      <ScrollArea className="h-[450px] p-4">
        {dailyEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Utensils className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
            <p className="text-lg font-medium">No foods logged yet</p>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Search for foods and add them to your daily log to track your nutrition
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Breakfast */}
            {mealGroups.breakfast.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-500 mb-2">Breakfast</h4>
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
                <h4 className="text-sm font-medium text-green-500 mb-2">Lunch</h4>
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
                <h4 className="text-sm font-medium text-indigo-500 mb-2">Dinner</h4>
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
                <h4 className="text-sm font-medium text-purple-500 mb-2">Snacks</h4>
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
