
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

  // Debug nutriments data
  if (process.env.NODE_ENV === 'development') {
    console.log("Nutriments data:", product.nutriments || {});
  }

  // Enhanced extraction of nutritional information with more fallbacks
  // Check various ways the energy/calories can be stored
  const calories = product.nutriments?.["energy-kcal_100g"] || 
                  product.nutriments?.["energy-kcal"] || 
                  (product.nutriments?.energy_100g ? product.nutriments.energy_100g / 4.184 : 0) ||
                  (product.nutriments?.energy ? product.nutriments.energy / 4.184 : 0) ||
                  // Add more fallbacks for energy
                  (product.nutriments?.["energy-kj_100g"] ? product.nutriments["energy-kj_100g"] / 4.184 : 0) ||
                  (product.nutriments?.["energy-kj"] ? product.nutriments["energy-kj"] / 4.184 : 0);
  
  // Check for protein in different formats
  const protein = product.nutriments?.proteins_100g || 
                 product.nutriments?.proteins || 
                 product.nutriments?.protein_100g ||
                 product.nutriments?.protein || 0;
  
  // Check for carbs in different formats
  const carbs = product.nutriments?.carbohydrates_100g || 
               product.nutriments?.carbohydrates || 
               product.nutriments?.["carbohydrate_100g"] ||
               product.nutriments?.carbohydrate || 0;
  
  // Check for fat in different formats
  const fat = product.nutriments?.fat_100g || 
             product.nutriments?.fat || 
             product.nutriments?.["total-fat_100g"] ||
             product.nutriments?.["total-fat"] || 0;
  
  // Track if we have valid nutritional data
  const hasNutritionData = calories > 0 || protein > 0 || carbs > 0 || fat > 0;
  
  // Generate a name if the product name isn't available
  const productName = product.product_name || product.product_name_en || "Unnamed Product";
  const brand = product.brands || "Unknown Brand";
  
  // Get actual serving size information with fallbacks
  const getServingSize = () => {
    // First, try to use the serving_size field directly
    if (product.serving_size && typeof product.serving_size === 'string' && product.serving_size.trim()) {
      return product.serving_size;
    }
    
    // Next, check for numeric serving size with unit
    if (product.serving_quantity && !isNaN(product.serving_quantity)) {
      const quantity = parseFloat(product.serving_quantity);
      const unit = product.serving_unit || 'g';
      return `${quantity}${unit}`;
    }
    
    // If serving_size_g exists, use it
    if (product.serving_size_g && !isNaN(product.serving_size_g)) {
      return `${product.serving_size_g}g`;
    }
    
    // Fall back to quantity field
    if (product.quantity && typeof product.quantity === 'string' && product.quantity.trim()) {
      return product.quantity;
    }
    
    // Default fallback
    return "100g";
  };
  
  const servingSize = getServingSize();
  
  // Extract numeric serving size for calculations
  const getNumericServingSize = (): number => {
    // If serving_size_g exists, use it directly
    if (product.serving_size_g && !isNaN(product.serving_size_g)) {
      return parseFloat(product.serving_size_g);
    }
    
    // Try to parse numeric part from serving_quantity
    if (product.serving_quantity && !isNaN(product.serving_quantity)) {
      return parseFloat(product.serving_quantity);
    }
    
    // Look for weight in parentheses like "1 scoop (31 g)" or "2 scoops (50g)"
    if (product.serving_size && typeof product.serving_size === 'string') {
      // Try to find a pattern like (31g) or (31 g) or (31)
      const weightInParentheses = product.serving_size.match(/\((\d+(?:\.\d+)?)\s*g?\)/i);
      if (weightInParentheses && weightInParentheses[1]) {
        return parseFloat(weightInParentheses[1]);
      }
      
      // Try to extract just numbers as a fallback
      const match = product.serving_size.match(/(\d+(?:\.\d+)?)/);
      if (match && match[1]) {
        // If the number is followed by ml/mL, don't use it as grams
        if (product.serving_size.toLowerCase().includes('ml') || 
            product.serving_size.toLowerCase().includes('l')) {
          // For liquids, use a rough conversion or default to 100g
          return 100;
        }
        return parseFloat(match[1]);
      }
    }
    
    // Try to extract from quantity field
    if (product.quantity && typeof product.quantity === 'string') {
      // Look for grams in the quantity
      const gramsMatch = product.quantity.match(/(\d+(?:\.\d+)?)\s*g/i);
      if (gramsMatch && gramsMatch[1]) {
        return parseFloat(gramsMatch[1]);
      }
    }
    
    // Default to 100g
    return 100;
  };
  
  // Calculate the scale factor for nutrition values
  const servingSizeInGrams = getNumericServingSize();
  const scaleFactor = servingSizeInGrams / 100;
  
  // Scale nutrition values to the actual serving size
  const caloriesPerServing = Math.round(calories * scaleFactor);
  const proteinPerServing = (protein * scaleFactor).toFixed(1);
  const carbsPerServing = (carbs * scaleFactor).toFixed(1);
  const fatPerServing = (fat * scaleFactor).toFixed(1);
  
  // Log extracted nutrition for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log("Extracted nutrition:", {
      calories,
      protein,
      carbs,
      fat,
      fiber: product.nutriments?.fiber_100g || product.nutriments?.fiber || 0,
      sugars: product.nutriments?.sugars_100g || product.nutriments?.sugars || 0
    });
  }
  
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

  // Log values for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`FoodItem "${productName}": servingSize=${servingSize}, servingSizeInGrams=${servingSizeInGrams}, calories=${calories}, caloriesPerServing=${caloriesPerServing}`);
  }

  return (
    <>
      <div className={`glass-panel p-3 rounded-lg hover:shadow-lg transition-all duration-200 ${highlighted ? 'border-l-2 border-primary' : ''}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 mr-2">
                <h3 className="font-medium text-sm sm:text-base line-clamp-1">{productName}</h3>
                {highlighted && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" fill="currentColor" />}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
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
              <Badge className={`text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground ${!hasNutritionData ? 'opacity-60' : ''}`}>
                {caloriesPerServing > 0 ? `${caloriesPerServing} kcal` : 'No calorie data'}
              </Badge>
              <Badge className={`text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground ${!hasNutritionData ? 'opacity-60' : ''}`}>
                P: {protein > 0 ? `${proteinPerServing}g` : 'n/a'}
              </Badge>
              <Badge className={`text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground ${!hasNutritionData ? 'opacity-60' : ''}`}>
                C: {carbs > 0 ? `${carbsPerServing}g` : 'n/a'}
              </Badge>
              <Badge className={`text-xs px-1.5 py-0 h-5 bg-secondary text-secondary-foreground ${!hasNutritionData ? 'opacity-60' : ''}`}>
                F: {fat > 0 ? `${fatPerServing}g` : 'n/a'}
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
          food={product} // Pass the original product directly
          source="openfoodfacts"
          onClose={() => setShowDetailView(false)}
        />
      )}
    </>
  );
};

export default FoodItem;
