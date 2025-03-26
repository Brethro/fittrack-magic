
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Utensils, Plus } from "lucide-react";
import { useFoodLog, type FoodLogEntry } from "@/contexts/FoodLogContext";
import FoodLogEntryComponent from "./FoodLogEntry";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FoodLogListProps {
  onEditEntry?: (entry: FoodLogEntry) => void;
}

const FoodLogList = ({ onEditEntry }: FoodLogListProps) => {
  const { currentDate, getDailyFoodLog, deleteFoodEntry, getDailyTotals } = useFoodLog();
  
  // Get food entries for current date
  const dailyEntries = getDailyFoodLog(currentDate);
  const dailyTotals = getDailyTotals(currentDate);
  
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
  const handleEdit = (entry: FoodLogEntry) => {
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
    breakfast: "text-amber-500 border-amber-500/20 bg-amber-500/5",
    lunch: "text-green-500 border-green-500/20 bg-green-500/5",
    dinner: "text-indigo-500 border-indigo-500/20 bg-indigo-500/5",
    snack: "text-purple-500 border-purple-500/20 bg-purple-500/5",
  };
  
  return (
    <Card className="h-full flex flex-col bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{getDateHeader()}</h3>
          <div className="text-sm font-medium">
            {dailyTotals.calories} kcal
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {dailyEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center h-auto">
            <Utensils className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-base font-medium">No foods logged yet</p>
            <p className="text-xs text-muted-foreground max-w-[220px] mt-1 mb-4">
              Use the Quick Add tab to add foods to your daily log
            </p>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Food
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-full">
            {/* Breakfast */}
            {mealGroups.breakfast.length > 0 && (
              <div className="w-full">
                <h4 className={`${mealTypeStyles.breakfast} font-medium px-4 py-2 text-base border-b border-border/20`}>
                  Breakfast
                </h4>
                <div className="w-full">
                  {mealGroups.breakfast.map((entry) => (
                    <FoodLogEntryComponent
                      key={`breakfast-${entry.id}`}
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
              <div className="w-full">
                <h4 className={`${mealTypeStyles.lunch} font-medium px-4 py-2 text-base border-b border-border/20`}>
                  Lunch
                </h4>
                <div className="w-full">
                  {mealGroups.lunch.map((entry) => (
                    <FoodLogEntryComponent
                      key={`lunch-${entry.id}`}
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
              <div className="w-full">
                <h4 className={`${mealTypeStyles.dinner} font-medium px-4 py-2 text-base border-b border-border/20`}>
                  Dinner
                </h4>
                <div className="w-full">
                  {mealGroups.dinner.map((entry) => (
                    <FoodLogEntryComponent
                      key={`dinner-${entry.id}`}
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
              <div className="w-full">
                <h4 className={`${mealTypeStyles.snack} font-medium px-4 py-2 text-base border-b border-border/20`}>
                  Snacks
                </h4>
                <div className="w-full">
                  {mealGroups.snack.map((entry) => (
                    <FoodLogEntryComponent
                      key={`snack-${entry.id}`}
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
      </div>
    </Card>
  );
};

export default FoodLogList;
