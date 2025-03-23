
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus, Sliders } from "lucide-react";
import { motion } from "framer-motion";
import { useFoodLog, type FoodLogEntry } from "@/contexts/FoodLogContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface RecentFoodsProps {
  onAddFood?: (food: FoodLogEntry) => void;
}

const RecentFoods = ({ onAddFood }: RecentFoodsProps) => {
  const { foodEntries, addFoodEntry } = useFoodLog();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<string | null>(null);
  const [servingSizes, setServingSizes] = useState<Record<string, number>>({});

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

  const handleEditServing = (food: FoodLogEntry) => {
    if (editingFood === food.id) {
      setEditingFood(null);
    } else {
      setEditingFood(food.id);
      // Initialize with current amount if not set
      if (!servingSizes[food.id]) {
        setServingSizes(prev => ({
          ...prev,
          [food.id]: food.amount
        }));
      }
    }
  };

  const handleServingSizeChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setServingSizes(prev => ({
        ...prev,
        [id]: numValue
      }));
    }
  };

  const handleAddFood = (food: FoodLogEntry) => {
    setIsAdding(food.id);
    
    // Create a new entry with current date and possibly updated amount
    const newEntry: Omit<FoodLogEntry, "id"> = {
      ...food,
      date: new Date(),
      amount: servingSizes[food.id] || food.amount
    };
    
    // Add to food log
    addFoodEntry(newEntry);
    
    toast({
      title: "Food added",
      description: `${food.foodName} added to your food log`,
    });
    
    // Reset states after a short delay
    setTimeout(() => {
      setIsAdding(null);
      setEditingFood(null);
      
      if (onAddFood) {
        onAddFood(food);
      }
    }, 500);
  };

  if (recentFoods.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 mt-4 overflow-hidden">
      <div className="flex items-center mb-3">
        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
        <h3 className="text-sm font-medium">Recently Added Foods</h3>
      </div>
      
      <ScrollArea className="w-full pr-3" type="always">
        <div className="flex space-x-2 pb-1 pr-4">
          {recentFoods.map((food) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 min-w-[120px] max-w-[150px]"
            >
              <div className="flex flex-col">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center h-auto py-1.5 px-3 text-xs mb-1 justify-between w-full"
                  onClick={() => handleEditServing(food)}
                  disabled={isAdding === food.id}
                >
                  <span className="truncate max-w-[110px] text-left">{food.foodName}</span>
                  <Sliders className="ml-1 h-3 w-3 flex-shrink-0" />
                </Button>
                
                {editingFood === food.id && (
                  <div className="flex items-center space-x-1 mb-1">
                    <Input
                      type="number"
                      value={servingSizes[food.id] || food.amount}
                      onChange={(e) => handleServingSizeChange(food.id, e.target.value)}
                      className="h-6 w-14 text-xs px-1"
                      min="0"
                      step="any"
                    />
                    <span className="text-xs text-muted-foreground truncate max-w-[50px]">
                      {food.unit}
                    </span>
                  </div>
                )}
                
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center justify-center h-7 py-1 px-2 text-xs w-full"
                  onClick={() => handleAddFood(food)}
                  disabled={isAdding === food.id}
                >
                  Add
                  <Plus className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default RecentFoods;
