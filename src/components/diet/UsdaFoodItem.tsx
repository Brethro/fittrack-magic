
import { Button } from "@/components/ui/button";
import { Info, Database } from "lucide-react";
import { type UsdaFoodItem as UsdaFoodItemType, extractNutritionInfo } from "@/utils/usdaApi";

interface UsdaFoodItemProps {
  foodItem: UsdaFoodItemType;
}

const UsdaFoodItem = ({ foodItem }: UsdaFoodItemProps) => {
  // Extract nutritional information
  const nutrition = extractNutritionInfo(foodItem);
  
  // Format description and category
  const description = foodItem.description || "Unnamed Food";
  const category = foodItem.foodCategory || "";
  const brand = foodItem.brandName || "USDA Database";
  
  // Handle serving size information
  const servingSize = foodItem.servingSize
    ? `${foodItem.servingSize}${foodItem.servingSizeUnit || "g"}`
    : "100g";
    
  // Format ingredients if available
  const ingredients = foodItem.ingredients
    ? foodItem.ingredients.substring(0, 120) + 
      (foodItem.ingredients.length > 120 ? "..." : "")
    : "";

  const handleSelectFood = () => {
    // For now, just log the selection 
    console.log("Selected USDA food:", foodItem);
    // TODO: Implement food detail view or add to meal
  };

  return (
    <div className="glass-panel p-4 rounded-lg border-l-4 border-emerald-500">
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{description}</h3>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-sm text-muted-foreground">{brand}</p>
            
            {category && (
              <span className="text-xs bg-emerald-500/10 text-emerald-600 rounded-full px-2 py-0.5">
                {category}
              </span>
            )}
          </div>
          
          {ingredients && (
            <p className="text-xs text-muted-foreground mt-1">{ingredients}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="bg-accent/30 rounded-full px-2 py-1">
              {Math.round(nutrition.calories)} kcal
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              P: {nutrition.protein.toFixed(1)}g
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              C: {nutrition.carbs.toFixed(1)}g
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              F: {nutrition.fat.toFixed(1)}g
            </span>
          </div>
          
          <p className="text-xs mt-1">Serving: {servingSize}</p>
          <p className="text-xs mt-1 text-emerald-600 font-medium">Source: USDA FoodData Central</p>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="ml-2 flex-shrink-0"
          onClick={handleSelectFood}
        >
          <Info size={16} />
          <span className="sr-only">View Details</span>
        </Button>
      </div>
    </div>
  );
};

export default UsdaFoodItem;
