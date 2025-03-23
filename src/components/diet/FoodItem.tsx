
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Star, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import FoodDetailView from "./FoodDetailView";
import { useToast } from "@/hooks/use-toast";
import { useFoodLog } from "@/contexts/FoodLogContext";

interface FoodItemProps {
  product: any;
  onSelect?: (product: any) => void;
}

const FoodItem = ({ product, onSelect }: FoodItemProps) => {
  const isMobile = useIsMobile();
  const [showDetailView, setShowDetailView] = useState(false);
  const { toast } = useToast();
  const { addFoodEntry } = useFoodLog();

  // Extract and format nutritional information with better fallbacks
  const calories = product.nutriments?.["energy-kcal_100g"] || 
                  product.nutriments?.["energy-kcal"] || 
                  product.nutriments?.energy_100g || 
                  product.nutriments?.energy || 0;
  
  const protein = product.nutriments?.proteins_100g || 
                 product.nutriments?.proteins || 0;
  
  const carbs = product.nutriments?.carbohydrates_100g || 
               product.nutriments?.carbohydrates || 0;
  
  const fat = product.nutriments?.fat_100g || 
             product.nutriments?.fat || 0;
  
  // Generate a name if the product name isn't available
  const productName = product.product_name || product.product_name_en || "Unnamed Product";
  const brand = product.brands || "Unknown Brand";
  const servingSize = product.serving_size || product.quantity || "100g";
  
  // Format categories into a list of food types - extract main food type
  const mainCategory = product.categories
    ? product.categories
        .split(',')
        .filter((cat: string) => 
          !cat.startsWith('fr:') && 
          !cat.includes('-') && 
          !cat.includes(':') &&
          cat.trim().length > 0
        )[0]
    : '';
  
  // Check if this likely appears to be an exact match to common search terms
  const isLikelyExactMatch = (name: string): boolean => {
    // Common food search terms to highlight
    const exactMatchTerms = [
      'chicken breast',
      'grilled chicken',
      'greek yogurt',
      'apple',
      'banana',
      'orange',
      'rice',
      'brown rice',
      'white rice',
      'oatmeal',
      'oats',
      'egg',
      'eggs',
      'steak',
      'beef',
      'salmon',
      'tuna',
      'broccoli',
      'spinach',
      'kale',
      'avocado',
      'sweet potato',
      'potato',
    ];
    
    const nameLower = name.toLowerCase();
    
    // Check if the product name exactly matches or starts with any of the terms
    return exactMatchTerms.some(term => 
      nameLower === term || 
      nameLower.startsWith(`${term} `) ||
      nameLower.includes(` ${term}`)
    );
  };
  
  const highlighted = isLikelyExactMatch(productName);

  const handleSelectFood = () => {
    setShowDetailView(true);
    
    if (onSelect) {
      onSelect(product);
    } else {
      console.log("Selected product:", product);
    }
  };
  
  const handleSaveFood = (food: any) => {
    console.log("Saving food from detail view:", food);
    
    // Add food to the food log
    if (food) {
      addFoodEntry({
        foodName: food.foodName,
        amount: food.amount,
        unit: food.unit,
        date: food.date,
        mealType: food.mealType,
        nutrition: food.nutrition,
        source: food.source || "openfoodfacts",
        sourceId: food.sourceId || product.code || product.id
      });
      
      toast({
        title: "Food added",
        description: `${food.foodName} added to your food log`
      });
    }
  };

  return (
    <>
      <div className={`glass-panel p-3 rounded-lg hover:shadow-lg transition-all duration-200 ${highlighted ? 'border-l-2 border-primary' : ''}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm sm:text-base line-clamp-1">{productName}</h3>
                {highlighted && <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />}
              </div>
              
              <div className="flex gap-1">
                <Button 
                  size="icon"
                  variant="ghost" 
                  className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={() => setShowDetailView(true)}
                >
                  <Info size={16} />
                </Button>
                
                <Button 
                  size="icon"
                  variant="outline" 
                  className="h-7 w-7 rounded-full text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  onClick={handleSelectFood}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">{brand}</p>
              
              {mainCategory && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20">
                  {mainCategory}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                {Math.round(calories)} kcal
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                P: {protein.toFixed(1)}g
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                C: {carbs.toFixed(1)}g
              </Badge>
              <Badge className="text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                F: {fat.toFixed(1)}g
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs">Serving: {servingSize}</p>
              
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={productName} 
                  className="w-6 h-6 object-contain rounded-md bg-white/5"
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Food Detail Modal */}
      {showDetailView && (
        <FoodDetailView 
          food={product}
          source="openfoodfacts"
          onClose={() => setShowDetailView(false)}
          onSave={handleSaveFood}
        />
      )}
    </>
  );
};

export default FoodItem;
