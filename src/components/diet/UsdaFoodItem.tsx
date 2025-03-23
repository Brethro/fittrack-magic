import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { type UsdaFoodItem as UsdaFoodItemType, extractNutritionInfo } from "@/utils/usdaApi";
import FoodDetailView from "./FoodDetailView";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { useToast } from "@/hooks/use-toast";

interface UsdaFoodItemProps {
  foodItem: UsdaFoodItemType;
  onSelect?: (foodItem: UsdaFoodItemType) => void;
}

const UsdaFoodItem = ({ foodItem, onSelect }: UsdaFoodItemProps) => {
  const isMobile = useIsMobile();
  const [showDetailView, setShowDetailView] = useState(false);
  const { addFoodEntry } = useFoodLog();
  const { toast } = useToast();
  
  // Extract nutritional information
  const { nutritionValues, servingInfo } = extractNutritionInfo(foodItem);
  
  // Format description and category
  const description = foodItem.description || "Unnamed Food";
  const category = foodItem.foodCategory || "";
  
  // Handle serving size information
  const servingSize = foodItem.servingSize
    ? `${foodItem.servingSize}${foodItem.servingSizeUnit || "g"}`
    : "100g";

  const handleSelectFood = () => {
    setShowDetailView(true);
    
    if (onSelect) {
      onSelect(foodItem);
    } else {
      console.log("Selected USDA food:", foodItem);
    }
  };
  
  const handleSaveFood = (food: any) => {
    console.log("Saving food from detail view:", food);
    
    // Create a new food log entry from the food data
    // We're not calling addFoodEntry here since FoodDetailView already does that
    // This prevents duplicate entries
    
    toast({
      title: "Food added",
      description: `${food.foodName || description} added to your log`
    });
    
    // Close the detail view after saving
    setShowDetailView(false);
  };
  
  return (
    <>
      <div className="glass-panel p-3 rounded-lg hover:shadow-lg transition-all duration-200">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm sm:text-base line-clamp-1">{description}</h3>
              <div className="flex gap-1">
                <Button 
                  size="icon"
                  variant="ghost" 
                  className="h-7 w-7 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
                  onClick={() => setShowDetailView(true)}
                >
                  <Info size={16} />
                </Button>
                
                <Button 
                  size="icon"
                  variant="outline" 
                  className="h-7 w-7 rounded-full text-emerald-500 border-emerald-300/30 hover:bg-emerald-500/10 hover:border-emerald-300/50"
                  onClick={handleSelectFood}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                USDA Database
              </Badge>
              
              {category && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                  {category}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                {Math.round(nutritionValues.calories)} kcal
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                P: {nutritionValues.protein.toFixed(1)}g
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                C: {nutritionValues.carbs.toFixed(1)}g
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                F: {nutritionValues.fat.toFixed(1)}g
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-1.5 text-xs">
              <p>Serving: {servingSize}</p>
              <p className="text-emerald-500 text-xs">Source: USDA</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Food Detail Modal */}
      {showDetailView && (
        <FoodDetailView 
          food={{
            ...foodItem,
            nutrients: foodItem.foodNutrients?.map(n => ({
              name: n.nutrientName,
              amount: n.value,
              unitName: n.unitName
            }))
          }}
          source="usda"
          onClose={() => setShowDetailView(false)}
          onSave={handleSaveFood}
        />
      )}
    </>
  );
};

export default UsdaFoodItem;
