
import React, { useState, useEffect } from "react";
import { useFoodLog } from "@/contexts/FoodLogContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import MealTypeSelector from "./MealTypeSelector";
import { FoodLogEntry } from "@/contexts/FoodLogContext";
import { extractNutritionInfo, UsdaFoodItem } from "@/utils/usdaApi";

interface FoodDetailViewProps {
  food: any;
  source: "usda" | "openfoodfacts" | "custom";
  onClose: () => void;
  onSave?: (food: any) => void;
}

const FoodDetailView: React.FC<FoodDetailViewProps> = ({ 
  food, 
  source,
  onClose,
  onSave
}) => {
  
  const [amount, setAmount] = useState(100);
  const [isNutrientsOpen, setIsNutrientsOpen] = useState(false);
  const { addFoodEntry } = useFoodLog();
  const { toast } = useToast();
  
  // Get nutrition values based on source
  const getNutritionValues = () => {
    if (source === 'usda') {
      // For USDA foods, directly use the extractNutritionInfo function
      const { nutritionValues } = extractNutritionInfo(food as UsdaFoodItem);
      return nutritionValues;
    } else if (source === 'openfoodfacts') {
      // OpenFoodFacts format
      return {
        calories: food.nutriments?.['energy-kcal_100g'] || 
                food.nutriments?.['energy-kcal'] || 
                (food.nutriments?.['energy_100g'] || food.nutriments?.energy || 0) / 4.184,
        protein: food.nutriments?.proteins_100g || food.nutriments?.proteins || 0,
        carbs: food.nutriments?.carbohydrates_100g || food.nutriments?.carbohydrates || 0,
        fat: food.nutriments?.fat_100g || food.nutriments?.fat || 0,
        fiber: food.nutriments?.fiber_100g || food.nutriments?.fiber || 0,
        sugars: food.nutriments?.sugars_100g || food.nutriments?.sugars || 0
      };
    }
    
    // Default empty nutrition
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugars: 0
    };
  };
  
  // Get initial nutrition values
  const baseNutrition = getNutritionValues();
  
  // Set initial amount based on source and available serving information
  useEffect(() => {
    if (source === 'usda') {
      // For USDA, use the serving info from extractNutritionInfo
      const { servingInfo } = extractNutritionInfo(food as UsdaFoodItem);
      if (servingInfo && servingInfo.size) {
        setAmount(servingInfo.size);
      }
    } else if (source === 'openfoodfacts') {
      // For Open Food Facts, use existing logic
      if (food.serving_size_g && !isNaN(food.serving_size_g)) {
        setAmount(Number(food.serving_size_g));
      } else if (food.serving_qty && !isNaN(food.serving_qty)) {
        setAmount(Number(food.serving_qty));
      }
    }
  }, [food, source]);
  
  // Form setup for food entry
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      mealType: "snack" as "breakfast" | "lunch" | "dinner" | "snack",
      amount: amount,
      unit: 'g',
      date: new Date(),
    }
  });
  
  // Update amount on form when amount slider changes
  useEffect(() => {
    setValue('amount', amount);
  }, [amount, setValue]);
  
  // Helper function to determine if a property should be shown
  const shouldShowProperty = (value: any) => {
    return value !== undefined && 
           value !== null && 
           value !== '' && 
           value !== 0 &&
           !isNaN(value);
  };
  
  // Calculate all nutrient values based on amount
  const calculateNutrients = () => {
    const scaleFactor = amount / 100;
    
    const nutrients = [
      { 
        name: 'Calories', 
        value: Math.round(baseNutrition.calories * scaleFactor), 
        unit: 'kcal' 
      },
      { 
        name: 'Protein', 
        value: (baseNutrition.protein * scaleFactor).toFixed(1), 
        unit: 'g' 
      },
      { 
        name: 'Carbs', 
        value: (baseNutrition.carbs * scaleFactor).toFixed(1), 
        unit: 'g' 
      },
      { 
        name: 'Fat', 
        value: (baseNutrition.fat * scaleFactor).toFixed(1), 
        unit: 'g' 
      },
    ];
    
    // Add additional nutrients if they exist
    if (shouldShowProperty(baseNutrition.fiber)) {
      nutrients.push({
        name: 'Fiber',
        value: (baseNutrition.fiber * scaleFactor).toFixed(1),
        unit: 'g'
      });
    }
    
    if (shouldShowProperty(baseNutrition.sugars)) {
      nutrients.push({
        name: 'Sugars',
        value: (baseNutrition.sugars * scaleFactor).toFixed(1),
        unit: 'g'
      });
    }
    
    // Add more detailed nutrients for specific sources
    if (source === 'usda' && food.foodNutrients) {
      const additionalNutrients = [
        { name: 'Saturated Fat', key: 'saturated' },
        { name: 'Sodium', key: 'sodium', multiplier: 1, unit: 'mg' },
        { name: 'Potassium', key: 'potassium', multiplier: 1, unit: 'mg' },
        { name: 'Calcium', key: 'calcium', multiplier: 1, unit: 'mg' },
        { name: 'Iron', key: 'iron', multiplier: 1, unit: 'mg' },
      ];
      
      for (const nutrient of additionalNutrients) {
        const foundNutrient = food.foodNutrients.find((n: any) => 
          n.nutrientName.toLowerCase().includes(nutrient.key.toLowerCase())
        );
        
        if (foundNutrient && shouldShowProperty(foundNutrient.value)) {
          nutrients.push({
            name: nutrient.name,
            value: (foundNutrient.value * (nutrient.multiplier || 1) * scaleFactor).toFixed(1),
            unit: nutrient.unit || foundNutrient.unitName || 'g'
          });
        }
      }
    }
    
    return nutrients;
  };
  
  // Extract product details with fallbacks
  const productName = food.product_name || food.description || "Unnamed Food";
  const brandName = source === 'usda' 
    ? food.brandOwner || food.brandName || "USDA Database" 
    : food.brands || "Unknown Brand";
  
  // Handle form submission
  const onSubmit = (data: any) => {
    const scaleFactor = data.amount / 100;
    
    // Create food entry with correctly scaled nutrition values
    const foodEntry: Omit<FoodLogEntry, "id"> = {
      foodName: food.product_name || food.description || "Unnamed Food",
      amount: data.amount,
      unit: data.unit,
      date: data.date,
      mealType: data.mealType,
      nutrition: {
        calories: Math.round(baseNutrition.calories * scaleFactor),
        protein: parseFloat((baseNutrition.protein * scaleFactor).toFixed(1)),
        carbs: parseFloat((baseNutrition.carbs * scaleFactor).toFixed(1)),
        fat: parseFloat((baseNutrition.fat * scaleFactor).toFixed(1)),
        fiber: parseFloat((baseNutrition.fiber * scaleFactor).toFixed(1)),
        sugars: parseFloat((baseNutrition.sugars * scaleFactor).toFixed(1))
      },
      source,
      sourceId: food.code || food.fdcId || food.id || undefined
    };
    
    // Add entry to food log
    addFoodEntry(foodEntry);
    
    // Show success message
    toast({
      title: 'Food Added',
      description: `Added ${foodEntry.foodName} to your food log`,
    });
    
    // Close modal
    onClose();
  };
  
  // Nutrients for display
  const nutrients = calculateNutrients();
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}>
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex justify-between items-center space-y-0">
          <DialogTitle className="text-xl">Food Details</DialogTitle>
        </DialogHeader>
        
        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Food name and brand */}
            <div>
              <h3 className="text-lg font-semibold">{productName}</h3>
              <p className="text-sm text-muted-foreground">{brandName}</p>
              
              {/* Source badge */}
              <Badge 
                variant="outline" 
                className="mt-1 bg-primary/5 text-primary"
              >
                {source === 'usda' ? 'USDA Database' : 'Open Food Facts'}
              </Badge>
            </div>
            
            {/* Amount selector with slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Amount</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-16 text-center"
                    min={0}
                    max={2000}
                  />
                  <span>g</span>
                </div>
              </div>
              
              <Slider
                value={[amount]}
                min={0}
                max={500}
                step={5}
                onValueChange={(value) => setAmount(value[0])}
                className="py-2"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0g</span>
                <span>250g</span>
                <span>500g</span>
              </div>
            </div>
            
            {/* Nutrition facts */}
            <div className="border rounded-md p-3 space-y-3">
              <h4 className="font-medium">Nutrition Facts (for {amount}g)</h4>
              
              <div className="grid grid-cols-2 gap-2">
                {nutrients.slice(0, 4).map((nutrient, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-1">
                    <span className="text-sm">{nutrient.name}</span>
                    <span className="text-sm font-medium">{nutrient.value} {nutrient.unit}</span>
                  </div>
                ))}
              </div>
              
              {/* Secondary nutrients */}
              {nutrients.length > 4 && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {nutrients.slice(4).map((nutrient, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-dashed pb-1">
                      <span className="text-xs text-muted-foreground">{nutrient.name}</span>
                      <span className="text-xs">{nutrient.value} {nutrient.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add to log form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              
              <h4 className="font-medium">Add to Food Log</h4>
              
              {/* Meal type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Meal</label>
                <Controller
                  name="mealType"
                  control={control}
                  render={({ field }) => (
                    <MealTypeSelector 
                      selectedMeal={field.value}
                      onChange={field.onChange} 
                    />
                  )}
                />
              </div>
              
              {/* Amount field - linked to slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Portion</label>
                <div className="flex items-center gap-2">
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={2000}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          setAmount(value);
                        }}
                        className="flex-1"
                      />
                    )}
                  />
                  
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-20">
                            {field.value}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-0">
                          <div className="flex flex-col">
                            {['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece'].map((unit) => (
                              <Button
                                key={unit}
                                variant="ghost"
                                className="justify-start rounded-none h-8"
                                onClick={() => field.onChange(unit)}
                              >
                                {unit}
                                {field.value === unit && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </div>
              
              {/* Detailed nutrients collapsible */}
              <Collapsible
                open={isNutrientsOpen}
                onOpenChange={setIsNutrientsOpen}
                className="border rounded-md overflow-hidden"
              >
                
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium mb-0">Detailed Nutrients</h4>
                    <CollapsibleTrigger>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-8"
                      >
                        {isNutrientsOpen ? "Hide" : "Show"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-0">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {source === 'openfoodfacts' && food.nutriments && Object.entries(food.nutriments)
                        .filter(([key, value]) => 
                          typeof value === 'number' && 
                          !key.includes('_serving') && 
                          !key.includes('_value') &&
                          !key.endsWith('_unit') &&
                          !key.endsWith('_label') &&
                          value !== 0
                        )
                        .map(([key, value], index) => (
                          <div key={index} className="flex flex-col">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/_100g$/, '').replace(/-/g, ' ')}
                            </span>
                            <span>
                              {((Number(value) / 100) * amount).toFixed(1)}
                              {key.includes('sodium') || key.includes('salt') ? 'mg' : 'g'}
                            </span>
                          </div>
                        ))
                      }
                      
                      {source === 'usda' && food.foodNutrients && food.foodNutrients
                        .filter((n: any) => n.value && n.value !== 0)
                        .map((nutrient: any, index: number) => (
                          <div key={`usda-nutrient-${index}`} className="flex flex-col">
                            <span className="text-muted-foreground">
                              {nutrient.nutrientName}
                            </span>
                            <span>
                              {((nutrient.value / 100) * amount).toFixed(1)}
                              {nutrient.unitName?.toLowerCase() || 'g'}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Submit button */}
              <Button type="submit" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add to Food Log
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodDetailView;
