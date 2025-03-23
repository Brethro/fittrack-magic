
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useFoodLog, type FoodLogEntry } from "@/contexts/FoodLogContext";
import { useToast } from "@/hooks/use-toast";

interface RecentFoodsProps {
  onAddFood?: (food: FoodLogEntry) => void;
}

const RecentFoods = ({ onAddFood }: RecentFoodsProps) => {
  const { foodEntries, addFoodEntry } = useFoodLog();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState<string | null>(null);

  // Get the 5 most recent unique food items based on food name
  const getRecentFoods = (): FoodLogEntry[] => {
    const uniqueFoods = new Map<string, FoodLogEntry>();
    
    // Process in reverse to get most recent entries first
    [...foodEntries].reverse().forEach(entry => {
      if (!uniqueFoods.has(entry.foodName.toLowerCase())) {
        uniqueFoods.set(entry.foodName.toLowerCase(), entry);
      }
    });
    
    // Convert map to array and take only the first 5 items
    return Array.from(uniqueFoods.values()).slice(0, 5);
  };

  const recentFoods = getRecentFoods();

  const handleAddFood = (food: FoodLogEntry) => {
    setIsAdding(food.id);
    
    // Create a new entry with current date
    const newEntry: Omit<FoodLogEntry, "id"> = {
      ...food,
      date: new Date(),
      id: "" // This will be set by addFoodEntry
    };
    
    // Add to food log
    addFoodEntry(newEntry);
    
    toast({
      title: "Food added",
      description: `${food.foodName} added to your food log`,
    });
    
    // Reset adding state after a short delay
    setTimeout(() => {
      setIsAdding(null);
      
      if (onAddFood) {
        onAddFood(food);
      }
    }, 500);
  };

  if (recentFoods.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center mb-3">
        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium">Recently Added Foods</h3>
      </div>
      
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="flex space-x-2 pb-1">
          {recentFoods.map((food) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0"
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center h-auto py-1.5 px-3 text-xs"
                onClick={() => handleAddFood(food)}
                disabled={isAdding === food.id}
              >
                <span className="truncate max-w-[150px]">{food.foodName}</span>
                <Plus className="ml-1 h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default RecentFoods;
