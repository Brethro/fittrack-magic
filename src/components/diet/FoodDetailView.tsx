import React, { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Save, Clock, Database, Plus, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { type UsdaFoodItem, extractNutritionInfo } from "@/utils/usdaApi";
import { useUserData } from "@/contexts/UserDataContext";

interface FoodDetailViewProps {
  food: any;
  source: "usda" | "openfoodfacts";
  onClose: () => void;
  onSave?: (food: any) => void;
}

interface ServingForm {
  amount: number;
  unit: string;
}

const FoodDetailView: React.FC<FoodDetailViewProps> = ({ 
  food, 
  source, 
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const { userData } = useUserData();
  
  // State for collapsible nutrients section
  const [isNutrientsOpen, setIsNutrientsOpen] = useState(false);
  
  // Get base nutrition values from the food item
  const [baseNutrition, setBaseNutrition] = useState<any>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugars: 0,
    serving: "100g",
  });
  
  // Calculate user's remaining calories and macros for the day
  const remainingCalories = userData.dailyCalories ? userData.dailyCalories : null;
  
  // Form for serving size
  const [multiplier, setMultiplier] = useState(1);
  const { control, setValue, watch, handleSubmit } = useForm<ServingForm>({
    defaultValues: {
      amount: 100,
      unit: "g"
    }
  });
  
  const amount = watch("amount");
  const unit = watch("unit");
  
  // Available units based on food type
  const [availableUnits, setAvailableUnits] = useState<string[]>(["g", "oz", "cup"]);
  
  // Calculate current nutrition based on serving size
  const [currentNutrition, setCurrentNutrition] = useState({ ...baseNutrition });
  
  // Extract detailed nutrients for display
  const [detailedNutrients, setDetailedNutrients] = useState<any[]>([]);
  
  // Initialize on component mount
  useEffect(() => {
    if (source === "usda") {
      initializeUsdaFood(food);
    } else {
      initializeOpenFoodFacts(food);
    }
  }, [food, source]);
  
  // Initialize from USDA food data
  const initializeUsdaFood = (usdaFood: UsdaFoodItem) => {
    // Extract basic nutrition
    const nutrition = extractNutritionInfo(usdaFood);
    setBaseNutrition(nutrition);
    setCurrentNutrition(nutrition);
    
    // Set default serving
    const defaultServing = usdaFood.servingSize || 100;
    const defaultUnit = usdaFood.servingSizeUnit || "g";
    
    setValue("amount", defaultServing);
    setValue("unit", defaultUnit);
    
    // Generate available units from food portions if available
    if (usdaFood.foodPortions && usdaFood.foodPortions.length > 0) {
      const units = usdaFood.foodPortions.map(p => 
        p.measureUnit?.abbreviation || "g"
      );
      setAvailableUnits([...new Set(["g", "oz", ...units])]);
    }
    
    // Extract detailed nutrients
    const detailedNutrients = usdaFood.foodNutrients.map(n => ({
      id: n.nutrientId,
      name: n.nutrientName,
      value: n.value,
      unit: n.unitName,
    }));
    
    // Group and sort nutrients by category
    const groupedNutrients = groupNutrientsByCategory(detailedNutrients);
    setDetailedNutrients(groupedNutrients);
  };
  
  // Initialize from Open Food Facts data
  const initializeOpenFoodFacts = (offFood: any) => {
    // Extract basic nutrition from Open Food Facts format
    const nutrition = {
      calories: offFood.nutriments?.["energy-kcal_100g"] || 
               offFood.nutriments?.["energy-kcal"] || 
               offFood.nutriments?.energy_100g || 
               offFood.nutriments?.energy || 0,
      protein: offFood.nutriments?.proteins_100g || 
              offFood.nutriments?.proteins || 0,
      carbs: offFood.nutriments?.carbohydrates_100g || 
             offFood.nutriments?.carbohydrates || 0,
      fat: offFood.nutriments?.fat_100g || 
           offFood.nutriments?.fat || 0,
      fiber: offFood.nutriments?.fiber_100g || 
             offFood.nutriments?.fiber || 0,
      sugars: offFood.nutriments?.sugars_100g || 
              offFood.nutriments?.sugars || 0,
      serving: "100g",
    };
    
    setBaseNutrition(nutrition);
    setCurrentNutrition(nutrition);
    
    // Set serving size from product if available
    let defaultAmount = 100;
    let defaultUnit = "g";
    
    if (offFood.serving_size) {
      const servingMatch = offFood.serving_size.match(/(\d+\.?\d*)\s*([a-zA-Z]+)/);
      if (servingMatch) {
        defaultAmount = parseFloat(servingMatch[1]);
        defaultUnit = servingMatch[2].toLowerCase();
      }
    }
    
    setValue("amount", defaultAmount);
    setValue("unit", defaultUnit);
    
    // Generate available units based on food type
    const foodCategory = (offFood.categories || "").toLowerCase();
    let suggestedUnits = ["g", "oz"];
    
    if (foodCategory.includes("beverage") || 
        foodCategory.includes("drink") || 
        foodCategory.includes("milk") || 
        foodCategory.includes("juice")) {
      suggestedUnits = ["ml", "fl oz", "cup"];
    } else if (foodCategory.includes("cereal") || 
               foodCategory.includes("grain") || 
               foodCategory.includes("pasta") || 
               foodCategory.includes("rice")) {
      suggestedUnits = ["g", "oz", "cup"];
    }
    
    setAvailableUnits([...new Set([...suggestedUnits, defaultUnit])]);
    
    // Extract detailed nutrients from Open Food Facts format
    const detailedNutrients = Object.entries(offFood.nutriments || {})
      .filter(([key]) => !key.endsWith("_100g") && !key.endsWith("_serving") && key !== "energy-kcal" && key !== "energy")
      .map(([key, value]) => {
        // Format the nutrient name from the key
        const formattedName = key
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          id: key,
          name: formattedName,
          value,
          unit: key.includes("vitamin") || key.includes("mineral") ? "%" : "g"
        };
      });
    
    // Group and sort nutrients
    const groupedNutrients = groupNutrientsByCategory(detailedNutrients);
    setDetailedNutrients(groupedNutrients);
  };
  
  // Group nutrients by category for better display
  const groupNutrientsByCategory = (nutrients: any[]) => {
    // Define nutrient categories and their priority order
    const categories = {
      "Macronutrients": ["Protein", "Total fat", "Carbohydrates", "Fiber", "Sugars"],
      "Vitamins": ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E", "Vitamin K", "Thiamin", "Riboflavin", "Niacin", "Vitamin B6", "Folate", "Vitamin B12"],
      "Minerals": ["Calcium", "Iron", "Magnesium", "Phosphorus", "Potassium", "Sodium", "Zinc", "Copper", "Manganese", "Selenium"],
      "Fats": ["Saturated", "Monounsaturated", "Polyunsaturated", "Trans", "Cholesterol"],
      "Carbohydrates": ["Starch", "Sucrose", "Glucose", "Fructose", "Lactose"],
      "Other": []
    };
    
    // Sort nutrients into categories
    const categorized: any = {};
    Object.keys(categories).forEach(category => {
      categorized[category] = [];
    });
    
    nutrients.forEach(nutrient => {
      let assigned = false;
      
      for (const [category, keywords] of Object.entries(categories)) {
        if (category === "Other") continue;
        
        const found = keywords.some(keyword => 
          nutrient.name.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (found) {
          categorized[category].push(nutrient);
          assigned = true;
          break;
        }
      }
      
      if (!assigned) {
        categorized["Other"].push(nutrient);
      }
    });
    
    // Flatten the categorized nutrients with headers
    const result: any[] = [];
    Object.entries(categorized).forEach(([category, items]) => {
      if ((items as any[]).length > 0) {
        // Add category header
        result.push({
          isHeader: true,
          name: category
        });
        
        // Add nutrients in this category
        (items as any[]).forEach(item => {
          result.push(item);
        });
      }
    });
    
    return result;
  };
  
  // Update nutrition values based on serving size
  useEffect(() => {
    const calculateNutrition = () => {
      // Convert to standard unit (g or ml) for calculation
      let standardAmount = amount;
      
      // Conversions for common units
      if (unit === "oz") standardAmount = amount * 28.35;
      if (unit === "lb") standardAmount = amount * 453.592;
      if (unit === "cup") standardAmount = amount * 240; // rough approximation for solids/liquids
      if (unit === "tbsp") standardAmount = amount * 15;
      if (unit === "tsp") standardAmount = amount * 5;
      if (unit === "fl oz") standardAmount = amount * 29.57;
      
      // Calculate multiplier based on 100g/ml standard
      const newMultiplier = standardAmount / 100;
      setMultiplier(newMultiplier);
      
      // Update nutrition values
      setCurrentNutrition({
        calories: Math.round(baseNutrition.calories * newMultiplier),
        protein: parseFloat((baseNutrition.protein * newMultiplier).toFixed(1)),
        carbs: parseFloat((baseNutrition.carbs * newMultiplier).toFixed(1)),
        fat: parseFloat((baseNutrition.fat * newMultiplier).toFixed(1)),
        fiber: parseFloat((baseNutrition.fiber * newMultiplier).toFixed(1)),
        sugars: parseFloat((baseNutrition.sugars * newMultiplier).toFixed(1)),
        serving: `${amount}${unit}`
      });
    };
    
    calculateNutrition();
  }, [amount, unit, baseNutrition]);
  
  // Calculate macronutrient percentages
  const calculateMacroPercentage = () => {
    const totalCalories = 
      (currentNutrition.protein * 4) + 
      (currentNutrition.carbs * 4) + 
      (currentNutrition.fat * 9);
    
    if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round((currentNutrition.protein * 4 / totalCalories) * 100),
      carbs: Math.round((currentNutrition.carbs * 4 / totalCalories) * 100),
      fat: Math.round((currentNutrition.fat * 9 / totalCalories) * 100)
    };
  };
  
  const macroPercentages = calculateMacroPercentage();
  
  // Handle serving amount adjustments
  const incrementAmount = () => {
    setValue("amount", Math.min(9999, amount + (amount < 10 ? 1 : 5)));
  };
  
  const decrementAmount = () => {
    setValue("amount", Math.max(0, amount - (amount <= 10 ? 1 : 5)));
  };
  
  // Save food to log or pantry
  const handleSaveFood = () => {
    const foodWithNutrition = {
      ...food,
      customServing: {
        amount,
        unit,
        multiplier
      },
      calculatedNutrition: currentNutrition,
      source
    };
    
    if (onSave) {
      onSave(foodWithNutrition);
    } else {
      console.log("Food saved:", foodWithNutrition);
      toast({
        title: "Food saved",
        description: `Added to your food log with serving size ${amount}${unit}`,
      });
    }
    
    onClose();
  };
  
  // Format name based on source
  const foodName = source === "usda" 
    ? food.description
    : food.product_name || food.product_name_en || "Unnamed Product";
  
  // Format brand or source based on source
  const brandOrSource = source === "usda"
    ? `USDA FoodData Central (${food.dataType})`
    : food.brands || "Unknown Brand";
  
  // Determine which chevron icon to show based on isNutrientsOpen state
  const ChevronIcon = isNutrientsOpen ? ChevronUp : ChevronDown;
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Food Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Food info section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium">{foodName}</h3>
            <div className="flex items-center gap-2 mt-1 mb-2">
              <p className="text-sm text-muted-foreground">{brandOrSource}</p>
              {source === "usda" && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-300/20">
                  <Database className="mr-1 h-3 w-3" /> USDA
                </Badge>
              )}
              {source === "openfoodfacts" && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-300/20">
                  Open Food Facts
                </Badge>
              )}
            </div>
          </div>
          
          {/* Serving size editor */}
          <div className="glass-panel p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-3">Serving Size</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-r-none"
                  onClick={decrementAmount}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  className="max-w-[80px] rounded-none text-center"
                  value={amount}
                  onChange={(e) => setValue("amount", parseFloat(e.target.value) || 0)}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-l-none"
                  onClick={incrementAmount}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[70px]">
                    {unit}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="flex flex-col">
                    {availableUnits.map((unitOption) => (
                      <Button
                        key={unitOption}
                        variant="ghost"
                        className="justify-start rounded-none"
                        onClick={() => setValue("unit", unitOption)}
                      >
                        {unitOption}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="mt-4">
              <label className="text-sm text-muted-foreground mb-1 block">
                Adjust serving size:
              </label>
              <Slider
                value={[amount]}
                min={0}
                max={500}
                step={1}
                onValueChange={(values) => setValue("amount", values[0])}
              />
            </div>
          </div>
          
          {/* Nutrition summary panel */}
          <div className="glass-panel p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Nutrition Facts</h4>
              <p className="text-sm text-muted-foreground">
                Per {amount}{unit} serving
              </p>
            </div>
            
            {/* Calories */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Calories</span>
                <span className="text-lg font-semibold">{currentNutrition.calories}</span>
              </div>
              
              {remainingCalories && (
                <div className="flex justify-end text-xs text-muted-foreground">
                  <span>{Math.round((currentNutrition.calories / remainingCalories) * 100)}% of daily goal</span>
                </div>
              )}
            </div>
            
            {/* Macros */}
            <div className="space-y-3">
              {/* Protein */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Protein</span>
                  <span>{currentNutrition.protein}g</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${macroPercentages.protein}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>{macroPercentages.protein}% of calories</span>
                  <span>{Math.round(currentNutrition.protein * 4)} kcal</span>
                </div>
              </div>
              
              {/* Carbs */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Carbohydrates</span>
                  <span>{currentNutrition.carbs}g</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-1">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full" 
                    style={{ width: `${macroPercentages.carbs}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>{macroPercentages.carbs}% of calories</span>
                  <span>{Math.round(currentNutrition.carbs * 4)} kcal</span>
                </div>
                
                {/* Fiber & Sugar */}
                <div className="grid grid-cols-2 gap-4 pl-4 mt-2">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fiber</span>
                      <span className="text-sm">{currentNutrition.fiber}g</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sugars</span>
                      <span className="text-sm">{currentNutrition.sugars}g</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fats */}
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Fat</span>
                  <span>{currentNutrition.fat}g</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-1">
                  <div 
                    className="bg-rose-500 h-1.5 rounded-full" 
                    style={{ width: `${macroPercentages.fat}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>{macroPercentages.fat}% of calories</span>
                  <span>{Math.round(currentNutrition.fat * 9)} kcal</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed nutrients - Now collapsible */}
          {detailedNutrients.length > 0 && (
            <Collapsible 
              className="glass-panel p-4 rounded-lg"
              open={isNutrientsOpen}
              onOpenChange={setIsNutrientsOpen}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-medium mb-0">Detailed Nutrients</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8">
                    <ChevronIcon className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-3">
                <div className="divide-y">
                  {detailedNutrients.map((nutrient, index) => (
                    <div 
                      key={index}
                      className={`py-2 ${nutrient.isHeader ? 'bg-secondary/30 -mx-4 px-4 py-1' : ''}`}
                    >
                      {nutrient.isHeader ? (
                        <h5 className="font-medium text-sm">{nutrient.name}</h5>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{nutrient.name}</span>
                          <span className="text-sm">
                            {(parseFloat(nutrient.value) * multiplier).toFixed(1)} {nutrient.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        
        {/* Footer with action buttons */}
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-1"
              onClick={handleSaveFood}
            >
              <Clock className="h-4 w-4" />
              Log Food
            </Button>
            <Button 
              variant="default"
              className="gap-1"
              onClick={handleSaveFood}
            >
              <Plus className="h-4 w-4" />
              Add to Diary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailView;
