
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // Show 5 items per page

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

  const handleAddFood = (food: FoodLogEntry) => {
    setIsAdding(food.id);
    
    // Create a new entry with current date
    const newEntry: Omit<FoodLogEntry, "id"> = {
      ...food,
      date: new Date(),
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
          <h3 className="text-sm font-medium">History</h3>
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
      
      <div className="space-y-2">
        {visibleFoods.map((food) => {
          // Ensure nutrition values are available
          const calories = food.nutrition?.calories || 0;
          const isAdded = isAdding === food.id;
          
          return (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="bg-background/40 backdrop-blur-sm rounded-lg border border-border/30 p-3 hover:bg-background/60 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{food.foodName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {calories > 0 ? `${Math.round(calories)} cal` : 'No calorie data'}, {food.amount} {food.unit}
                    </p>
                  </div>
                  
                  <Button
                    variant={isAdded ? "default" : "outline"}
                    size="icon"
                    className={`h-10 w-10 rounded-full ${isAdded ? "bg-blue-500 text-white" : ""}`}
                    onClick={() => handleAddFood(food)}
                    disabled={isAdded}
                  >
                    {isAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentFoods;
