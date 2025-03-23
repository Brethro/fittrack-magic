
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Star, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FoodItemProps {
  product: any;
  onSelect?: (product: any) => void;
}

const FoodItem = ({ product, onSelect }: FoodItemProps) => {
  const navigate = useNavigate();
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
    
  // Get all categories for display
  const categories = product.categories
    ? product.categories
        .split(',')
        .filter((cat: string) => 
          !cat.startsWith('fr:') && 
          !cat.includes('-') && 
          !cat.includes(':') &&
          cat.trim().length > 0
        )
        .slice(0, 3)
        .join(', ')
    : '';
  
  // Add nutrient scores if available
  const nutriscoreGrade = product.nutriscore_grade 
    ? `Nutriscore: ${product.nutriscore_grade.toUpperCase()}`
    : '';
  
  const novaGroup = product.nova_group
    ? `NOVA: ${product.nova_group}`
    : '';
  
  // Format ingredients for better readability
  const ingredients = product.ingredients_text 
    ? product.ingredients_text.substring(0, 120) + (product.ingredients_text.length > 120 ? '...' : '')
    : '';

  const handleSelectFood = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      console.log("Selected product:", product);
    }
  };

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

  return (
    <div className={`glass-panel p-4 rounded-lg hover:shadow-lg transition-all duration-200 ${highlighted ? 'border-l-4 border-primary' : 'border-l border-primary/30'}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-md sm:text-lg">{productName}</h3>
            {highlighted && <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-xs sm:text-sm text-muted-foreground">{brand}</p>
            
            {mainCategory && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                {mainCategory}
              </Badge>
            )}
          </div>
          
          {categories && categories !== mainCategory && (
            <p className="text-xs italic text-primary/70">{categories}</p>
          )}
          
          {ingredients && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ingredients}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              {Math.round(calories)} kcal
            </Badge>
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              P: {protein.toFixed(1)}g
            </Badge>
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              C: {carbs.toFixed(1)}g
            </Badge>
            <Badge className="bg-secondary/80 text-secondary-foreground hover:bg-secondary/70">
              F: {fat.toFixed(1)}g
            </Badge>
          </div>
          
          {(nutriscoreGrade || novaGroup) && (
            <div className="flex gap-2 mt-1 text-xs">
              {nutriscoreGrade && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-300/20 hover:bg-green-500/20">
                  {nutriscoreGrade}
                </Badge>
              )}
              {novaGroup && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-300/20 hover:bg-blue-500/20">
                  {novaGroup}
                </Badge>
              )}
            </div>
          )}
          
          <p className="text-xs sm:text-sm mt-1">Serving: {servingSize}</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={productName} 
              className="w-16 h-16 object-contain rounded-md bg-white/5 p-1 shadow-sm border border-white/10"
              onError={(e) => {
                // Hide broken images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 mt-auto">
            <Button 
              size={isMobile ? "icon" : "sm"}
              variant="ghost" 
              className="rounded-full hover:bg-primary/10 hover:text-primary"
              onClick={handleSelectFood}
            >
              <Info size={18} />
              {!isMobile && <span className="ml-1">Info</span>}
            </Button>
            
            <Button 
              size={isMobile ? "icon" : "sm"}
              variant="outline" 
              className="rounded-full text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/50"
              onClick={handleSelectFood}
            >
              <Plus size={18} />
              {!isMobile && <span className="ml-1">Add</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
