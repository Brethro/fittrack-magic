
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface FoodItemProps {
  product: any;
}

const FoodItem = ({ product }: FoodItemProps) => {
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
  const productName = product.product_name || "Unnamed Product";
  const brand = product.brands || "Unknown Brand";
  const servingSize = product.serving_size || "100g";
  
  // Add categories for additional context about the food
  const categories = product.categories?.split(',').slice(0, 2).join(', ') || '';

  const handleSelectFood = () => {
    // For now, just log the selection - we'll implement the details page later
    console.log("Selected product:", product);
    // TODO: Navigate to food detail page or open modal with product details
  };

  return (
    <div className="glass-panel p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-1 flex-1">
          <h3 className="font-medium">{productName}</h3>
          <p className="text-sm text-muted-foreground">{brand}</p>
          {categories && (
            <p className="text-xs italic text-muted-foreground">{categories}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            <span className="bg-accent/30 rounded-full px-2 py-1">
              {Math.round(calories)} kcal
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              Protein: {protein.toFixed(1)}g
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              Carbs: {carbs.toFixed(1)}g
            </span>
            <span className="bg-accent/30 rounded-full px-2 py-1">
              Fat: {fat.toFixed(1)}g
            </span>
          </div>
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

export default FoodItem;
