
import React from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus, Utensils } from "lucide-react";
import { type FoodLogEntry as FoodLogEntryType } from "@/contexts/FoodLogContext";
import { motion, AnimatePresence } from "framer-motion";
import FoodLogEntryComponent from "./FoodLogEntry";

interface FoodLogListProps {
  onEditEntry?: (entry: FoodLogEntryType) => void;
  onAddFoodClick?: () => void;
}

const FoodLogList = ({ onEditEntry, onAddFoodClick }: FoodLogListProps) => {
  const { getDailyFoodLog, currentDate, getDailyTotals } = useFoodLog();
  
  // Get daily entries and sort by mealType
  const dailyEntries = getDailyFoodLog(currentDate);
  const dailyTotals = getDailyTotals(currentDate);
  
  // Group entries by meal type
  const mealGroups = {
    breakfast: dailyEntries.filter(entry => entry.mealType === "breakfast"),
    lunch: dailyEntries.filter(entry => entry.mealType === "lunch"),
    dinner: dailyEntries.filter(entry => entry.mealType === "dinner"),
    snack: dailyEntries.filter(entry => entry.mealType === "snack"),
  };
  
  // Check if there are any food entries
  const hasFoodEntries = dailyEntries.length > 0;
  
  if (!hasFoodEntries) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="text-muted-foreground text-8xl mb-4">
          <Utensils className="h-20 w-20 mx-auto opacity-20" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No foods logged yet</h3>
        <p className="text-muted-foreground mb-6">
          Use the Quick Add tab to add foods to your daily log
        </p>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 rounded-full px-6 border-2"
          onClick={onAddFoodClick}
        >
          <Plus className="h-5 w-5" />
          <span>Add Food</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentDate, "EEEE, MMMM d")}
        </h2>
        <div className="text-sm">
          <span className="font-medium">{Math.round(dailyTotals.calories)}</span>
          <span className="text-muted-foreground ml-1">kcal</span>
        </div>
      </div>
      
      {/* Breakfast section */}
      {mealGroups.breakfast.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase">Breakfast</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {mealGroups.breakfast.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodLogEntryComponent entry={entry} onEdit={() => onEditEntry?.(entry)} onDelete={() => {}} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      
      {/* Lunch section */}
      {mealGroups.lunch.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase">Lunch</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {mealGroups.lunch.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodLogEntryComponent entry={entry} onEdit={() => onEditEntry?.(entry)} onDelete={() => {}} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      
      {/* Dinner section */}
      {mealGroups.dinner.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase">Dinner</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {mealGroups.dinner.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodLogEntryComponent entry={entry} onEdit={() => onEditEntry?.(entry)} onDelete={() => {}} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      
      {/* Snack section */}
      {mealGroups.snack.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase">Snacks</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {mealGroups.snack.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodLogEntryComponent entry={entry} onEdit={() => onEditEntry?.(entry)} onDelete={() => {}} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      
      {/* Add button at the bottom of entries */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 rounded-full px-6 border-2"
          onClick={onAddFoodClick}
        >
          <Plus className="h-5 w-5" />
          <span>Add More</span>
        </Button>
      </div>
    </div>
  );
};

export default FoodLogList;
