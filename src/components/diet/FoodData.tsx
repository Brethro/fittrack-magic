
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
import { useFoodDatabase } from "@/components/admin/diet/FoodUtils";
import { FoodCategory, FoodItem } from "@/types/diet";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Component for managing and providing food data from Open Food Facts API
 */
const FoodData = () => {
  const { initializeFoodData, isLoading, foodItems } = useFoodDatabase();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        await initializeFoodData();
        setIsInitialized(true);
      }
    };
    
    initializeData();
  }, [initializeFoodData, isInitialized]);

  if (isLoading && !isInitialized) {
    return (
      <div className="space-y-4">
        <Alert variant="default" className="mb-6 bg-secondary border-secondary-foreground/20">
          <AlertTitle>Loading Food Database</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Loading food data from Open Food Facts API...
            </p>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Alert variant="default" className="mb-6 bg-secondary/80 border-secondary-foreground/20">
      <AlertTitle className="text-foreground">Open Food Facts Integration Active</AlertTitle>
      <AlertDescription className="text-foreground">
        <p className="mb-2">
          Your diet plan is now using Open Food Facts data with {foodItems.length} food items available.
        </p>
        <p className="flex items-center text-sm">
          <ExternalLink className="w-4 h-4 mr-1" />
          <a 
            href="https://openfoodfacts.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Open Food Facts - Free food database
          </a>
        </p>
      </AlertDescription>
    </Alert>
  );
};

// Generate food categories from food items for backward compatibility
export const processFoodItems = (items: FoodItem[]): FoodCategory[] => {
  const categorizedFoods: Record<string, FoodItem[]> = {};
  
  // Group foods by primary category
  items.forEach(item => {
    const category = item.primaryCategory;
    if (!categorizedFoods[category]) {
      categorizedFoods[category] = [];
    }
    categorizedFoods[category].push(item);
  });
  
  // Convert to FoodCategory array
  return Object.entries(categorizedFoods).map(([name, items]) => ({
    name,
    items,
    displayName: getCategoryDisplayName(name)
  }));
};

// Helper to get display names for categories
const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    meat: "Meat",
    redMeat: "Red Meat",
    poultry: "Poultry",
    fish: "Fish",
    seafood: "Seafood",
    shellfish: "Shellfish",
    dairy: "Dairy",
    egg: "Eggs",
    grain: "Grains",
    legume: "Legumes",
    vegetable: "Vegetables",
    fruit: "Fruits",
    nut: "Nuts",
    seed: "Seeds",
    oil: "Oils",
    sweetener: "Sweeteners",
    herb: "Herbs",
    spice: "Spices",
    processedFood: "Processed Foods",
    other: "Other Foods"
  };
  
  return displayNames[category] || category;
};

// Export the foodCategoriesData for backward compatibility
export const foodCategoriesData: FoodCategory[] = [];

export default FoodData;
