
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Star, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FoodItemProps {
  product: any;
  onSelect?: (product: any) => void;
}

const FoodItem = ({ product, onSelect }: FoodItemProps) => {
  const isMobile = useIsMobile();

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
    if (onSelect) {
      onSelect(product);
    } else {
      console.log("Selected product:", product);
    }
  };

  return (
    <div className={`glass-panel p-4 rounded-lg hover:shadow-lg transition-all duration-200 ${highlighted ? 'border-l-2 border-primary' : ''}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-md sm:text-lg">{productName}</h3>
              {highlighted && <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />}
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="icon"
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                onClick={handleSelectFood}
              >
                <Info size={18} />
              </Button>
              
              <Button 
                size="icon"
                variant="outline" 
                className="h-8 w-8 rounded-full text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                onClick={handleSelectFood}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs sm:text-sm text-muted-foreground">{brand}</p>
            
            {mainCategory && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {mainCategory}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-secondary text-secondary-foreground">
              {Math.round(calories)} kcal
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              P: {protein.toFixed(1)}g
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              C: {carbs.toFixed(1)}g
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              F: {fat.toFixed(1)}g
            </Badge>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs sm:text-sm">Serving: {servingSize}</p>
            
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={productName} 
                className="w-8 h-8 object-contain rounded-md bg-white/5"
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
  );
};

export default FoodItem;
