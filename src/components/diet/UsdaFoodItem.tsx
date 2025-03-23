
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { type UsdaFoodItem as UsdaFoodItemType, extractNutritionInfo } from "@/utils/usdaApi";
import FoodDetailView from "./FoodDetailView";

interface UsdaFoodItemProps {
  foodItem: UsdaFoodItemType;
  onSelect?: (foodItem: UsdaFoodItemType) => void;
}

const UsdaFoodItem = ({ foodItem, onSelect }: UsdaFoodItemProps) => {
  const isMobile = useIsMobile();
  const [showDetailView, setShowDetailView] = useState(false);
  
  // Extract nutritional information
  const nutrition = extractNutritionInfo(foodItem);
  
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
    // Here you would implement saving to user's food log or diary
  };

  return (
    <>
      <div className="glass-panel p-4 rounded-lg hover:shadow-lg transition-all duration-200">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-md sm:text-lg">{description}</h3>
              <div className="flex gap-2">
                <Button 
                  size="icon"
                  variant="ghost" 
                  className="h-8 w-8 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
                  onClick={() => setShowDetailView(true)}
                >
                  <Info size={18} />
                </Button>
                
                <Button 
                  size="icon"
                  variant="outline" 
                  className="h-8 w-8 rounded-full text-emerald-500 border-emerald-300/30 hover:bg-emerald-500/10 hover:border-emerald-300/50"
                  onClick={handleSelectFood}
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                USDA Database
              </Badge>
              
              {category && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                  {category}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-secondary text-secondary-foreground">
                {Math.round(nutrition.calories)} kcal
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground">
                P: {nutrition.protein.toFixed(1)}g
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground">
                C: {nutrition.carbs.toFixed(1)}g
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground">
                F: {nutrition.fat.toFixed(1)}g
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
              <p>Serving: {servingSize}</p>
              <p className="text-emerald-500">Source: USDA FoodData Central</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Food Detail Modal */}
      {showDetailView && (
        <FoodDetailView 
          food={foodItem}
          source="usda"
          onClose={() => setShowDetailView(false)}
          onSave={handleSaveFood}
        />
      )}
    </>
  );
};

export default UsdaFoodItem;
