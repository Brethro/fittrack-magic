
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info, Star, Plus } from "lucide-react";

interface FoodItemProps {
  product: any;
  onSelect?: (product: any) => void;
}

const FoodItem = ({ product, onSelect }: FoodItemProps) => {
  const navigate = useNavigate();

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
    <div className={`glass-panel p-4 rounded-lg ${highlighted ? 'border-l-4 border-primary' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{productName}</h3>
            {highlighted && <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-sm text-muted-foreground">{brand}</p>
            
            {mainCategory && (
              <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {mainCategory}
              </span>
            )}
          </div>
          
          {categories && categories !== mainCategory && (
            <p className="text-xs italic text-primary/70">{categories}</p>
          )}
          
          {ingredients && (
            <p className="text-xs text-muted-foreground mt-1">{ingredients}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="bg-accent/30 rounded-full px-2 py-1">
              {Math.round(calories)} kcal
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              P: {protein.toFixed(1)}g
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              C: {carbs.toFixed(1)}g
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              F: {fat.toFixed(1)}g
            </span>
          </div>
          
          {(nutriscoreGrade || novaGroup) && (
            <div className="flex gap-2 mt-1 text-xs">
              {nutriscoreGrade && (
                <span className="text-green-600 font-semibold">{nutriscoreGrade}</span>
              )}
              {novaGroup && (
                <span className="text-blue-600 font-semibold">{novaGroup}</span>
              )}
            </div>
          )}
          
          <p className="text-xs mt-1">Serving: {servingSize}</p>
        </div>
        
        {product.image_url && (
          <img 
            src={product.image_url} 
            alt={productName} 
            className="w-16 h-16 object-contain rounded-md ml-2"
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        
        <div className="flex flex-col gap-2 ml-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex-shrink-0"
            onClick={handleSelectFood}
          >
            <Info size={16} />
            <span className="sr-only">View Details</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-shrink-0 text-primary border-primary/20 hover:bg-primary/10"
            onClick={handleSelectFood}
          >
            <Plus size={16} />
            <span className="sr-only">Add Food</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
