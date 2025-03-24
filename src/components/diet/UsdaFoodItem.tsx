
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
  
  // Extract the proper serving size value in grams - IMPROVED to handle cases like "1 scoop (31g)"
  const getServingSizeInGrams = (): number => {
    // If serving size information is available from USDA
    if (servingInfo && servingInfo.size) {
      // Check if the size is actually in grams (common for USDA)
      return servingInfo.size;
    }
    
    // If there's a household serving size description, try to extract weight from it
    if (foodItem.householdServingFullText) {
      // Try to extract weight in parentheses, e.g., "1 scoop (31 g)"
      const weightMatch = foodItem.householdServingFullText.match(/\((\d+(?:\.\d+)?)\s*g?\)/i);
      if (weightMatch && weightMatch[1]) {
        return parseFloat(weightMatch[1]);
      }
    }
    
    // If we have serving size and unit from the USDA data
    if (foodItem.servingSize && foodItem.servingSizeUnit) {
      // If already in grams, return directly
      if (foodItem.servingSizeUnit.toLowerCase() === 'g') {
        return foodItem.servingSize;
      }
      
      // Convert other units if needed (simplified)
      if (foodItem.servingSizeUnit.toLowerCase() === 'ml') {
        return foodItem.servingSize; // Assuming 1ml ~= 1g for simplicity
      }
    }
    
    // Default to 100g if no serving size information is available
    return 100;
  };
  
  // Handle serving size information - use extracted serving info with proper formatting
  const servingSizeInGrams = getServingSizeInGrams();
  
  // Format the display string for serving size
  const servingSize = foodItem.householdServingFullText || 
                     (servingInfo.size && servingInfo.unit
                       ? `${servingInfo.size}${servingInfo.unit}`
                       : `${servingSizeInGrams}g`);

  const handleSelectFood = () => {
    setShowDetailView(true);
    
    if (onSelect) {
      onSelect(foodItem);
    } else {
      console.log("Selected USDA food:", foodItem);
    }
  };
  
  // Calculate per-serving nutrition values based on the actual serving size
  const scaleFactor = servingSizeInGrams / 100;
  const caloriesPerServing = Math.round(nutritionValues.calories * scaleFactor);
  const proteinPerServing = (nutritionValues.protein * scaleFactor).toFixed(1);
  const carbsPerServing = (nutritionValues.carbs * scaleFactor).toFixed(1);
  const fatPerServing = (nutritionValues.fat * scaleFactor).toFixed(1);
  
  // Log values for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`UsdaFoodItem "${description}": servingSize=${servingSize}, servingSizeInGrams=${servingSizeInGrams}, calories=${nutritionValues.calories}, caloriesPerServing=${caloriesPerServing}`);
  }
  
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
                {caloriesPerServing} kcal
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                P: {proteinPerServing}g
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                C: {carbsPerServing}g
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                F: {fatPerServing}g
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
          food={foodItem}  // Pass the original foodItem directly without transformations
          source="usda"
          onClose={() => setShowDetailView(false)}
        />
      )}
    </>
  );
};

export default UsdaFoodItem;
