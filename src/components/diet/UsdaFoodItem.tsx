
import { Button } from "@/components/ui/button";
import { Info, Database, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { type UsdaFoodItem as UsdaFoodItemType, extractNutritionInfo } from "@/utils/usdaApi";

interface UsdaFoodItemProps {
  foodItem: UsdaFoodItemType;
  onSelect?: (foodItem: UsdaFoodItemType) => void;
}

const UsdaFoodItem = ({ foodItem, onSelect }: UsdaFoodItemProps) => {
  const isMobile = useIsMobile();
  
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
    if (onSelect) {
      onSelect(foodItem);
    } else {
      console.log("Selected USDA food:", foodItem);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-lg border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-md sm:text-lg">{description}</h3>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-xs sm:text-sm text-muted-foreground">{brand}</p>
            
            {category && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-300/20 hover:bg-emerald-500/20">
                {category}
              </Badge>
            )}
          </div>
          
          {ingredients && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ingredients}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              {Math.round(nutrition.calories)} kcal
            </Badge>
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              P: {nutrition.protein.toFixed(1)}g
            </Badge>
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              C: {nutrition.carbs.toFixed(1)}g
            </Badge>
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              F: {nutrition.fat.toFixed(1)}g
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs sm:text-sm">Serving: {servingSize}</p>
            <p className="text-xs sm:text-sm text-emerald-500 font-medium">USDA FoodData Central</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            size={isMobile ? "icon" : "sm"}
            variant="ghost" 
            className="rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
            onClick={handleSelectFood}
          >
            <Info size={18} />
            {!isMobile && <span className="ml-1">Info</span>}
          </Button>
          
          <Button 
            size={isMobile ? "icon" : "sm"}
            variant="outline" 
            className="rounded-full text-emerald-500 border-emerald-300/30 hover:bg-emerald-500/10 hover:border-emerald-300/50"
            onClick={handleSelectFood}
          >
            <Plus size={18} />
            {!isMobile && <span className="ml-1">Add</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsdaFoodItem;
