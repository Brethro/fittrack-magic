
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Plus, Sliders, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // Show 3 items per page

  // Get unique food items based on food name
  const getRecentFoods = (): FoodLogEntry[] => {
    const uniqueFoods = new Map<string, FoodLogEntry>();
    
    // Process in reverse to get most recent entries first
    [...foodEntries].reverse().forEach(entry => {
      if (!uniqueFoods.has(entry.foodName.toLowerCase())) {
        uniqueFoods.set(entry.foodName.toLowerCase(), entry);
      }
    });
    
    // Convert map to array
    return Array.from(uniqueFoods.values());
  };

  const recentFoods = getRecentFoods();
  const pageCount = Math.ceil(recentFoods.length / itemsPerPage);
  
  // Get currently visible foods based on pagination
  const visibleFoods = recentFoods.slice(
    currentPage * itemsPerPage, 
    currentPage * itemsPerPage + itemsPerPage
  );

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

  const nextPage = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (recentFoods.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <h3 className="text-sm font-medium">Recently Added Foods</h3>
        </div>
        
        {pageCount > 1 && (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentPage + 1}/{pageCount}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={nextPage}
              disabled={currentPage === pageCount - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {visibleFoods.map((food) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <Button
              variant="outline"
              size="sm"
              className="flex items-center h-auto py-1.5 px-3 text-xs mb-1 justify-between w-full"
              onClick={() => handleEditServing(food)}
              disabled={isAdding === food.id}
            >
              <span className="truncate max-w-[calc(100%-20px)] text-left">{food.foodName}</span>
              <Sliders className="ml-1 h-3 w-3 flex-shrink-0" />
            </Button>
            
            {editingFood === food.id && (
              <div className="flex items-center space-x-1 mb-1">
                <Input
                  type="number"
                  value={servingSizes[food.id] || food.amount}
                  onChange={(e) => handleServingSizeChange(food.id, e.target.value)}
                  className="h-6 text-xs px-1"
                  min="0"
                  step="any"
                />
                <span className="text-xs text-muted-foreground truncate">
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
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default RecentFoods;
