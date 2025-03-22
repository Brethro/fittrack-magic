
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database, AlertCircle, Plus, Trash, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { foodCategoriesData } from "@/data/diet";
import { reparseFoodDatabaseForDietTypes } from "@/utils/diet/foodDataProcessing";
import { addFoodItem, initializeFoodCategories, getCurrentFoodCategories } from "@/utils/diet/foodManagement";
import { FoodItem, FoodPrimaryCategory } from "@/types/diet";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Import all food data modules directly to ensure we parse everything
import { meatsAndPoultryData } from "@/data/diet/meatData";
import { nutsAndSeedsData } from "@/data/diet/nutsAndSeedsData";
import { healthyFatsData } from "@/data/diet/healthyFatsData";
import { spicesAndHerbsData } from "@/data/diet/spicesData";
import { beveragesData } from "@/data/diet/beveragesData";
import { starchyVegetablesData } from "@/data/diet/starchyVegetablesData";
import { otherVegetablesData } from "@/data/diet/otherVegetablesData";
import { greenVegetablesData } from "@/data/diet/greenVegetablesData";
import { plantProteinsData } from "@/data/diet/plantProteinsData";
import { condimentsAndSaucesData } from "@/data/diet/condimentsData";
import { fishAndSeafoodData } from "@/data/diet/seafoodData";
import { breadsAndBreakfastData } from "@/data/diet/breadsData";
import { eggsAndDairyData } from "@/data/diet/dairyData";
import { grainsAndPastasData } from "@/data/diet/grainsData";
import { fruitsData } from "@/data/diet/fruitsData";

// Define the primary categories for the dropdown
const PRIMARY_CATEGORIES: FoodPrimaryCategory[] = [
  "meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg", 
  "grain", "legume", "vegetable", "fruit", "nut", "seed", "oil", 
  "sweetener", "herb", "spice", "processedFood", "other"
];

export const AdminDietTools = () => {
  const { toast } = useToast();
  const [isReparsing, setIsReparsing] = useState(false);
  const [lastParseResults, setLastParseResults] = useState<string[]>([]);
  const [totalFoodItems, setTotalFoodItems] = useState<number>(0);
  
  // New state for the food form
  const [newFood, setNewFood] = useState<Partial<FoodItem>>({
    id: "",
    name: "",
    protein: 0,
    carbs: 0,
    fats: 0,
    caloriesPerServing: 0,
    servingSizeGrams: 100,
    servingSize: "100g",
    primaryCategory: "other",
    diets: []
  });
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [dietInput, setDietInput] = useState("");

  // Get all raw food data (including categories that might be filtered out in foodCategoriesData)
  const getAllRawFoodData = () => {
    const allRawData = [
      meatsAndPoultryData,
      nutsAndSeedsData,
      healthyFatsData,
      spicesAndHerbsData,
      beveragesData,
      starchyVegetablesData,
      otherVegetablesData,
      greenVegetablesData,
      plantProteinsData,
      condimentsAndSaucesData,
      fishAndSeafoodData,
      breadsAndBreakfastData,
      eggsAndDairyData,
      grainsAndPastasData,
      fruitsData
    ];
    
    // Count total food items across all categories
    const total = allRawData.reduce((sum, category) => 
      sum + (category.items?.length || 0), 0);
    setTotalFoodItems(total);
    
    return allRawData;
  };

  const handleReparse = () => {
    setIsReparsing(true);
    
    // Small timeout to ensure UI updates
    setTimeout(() => {
      try {
        // Use ALL raw food data directly instead of the processed foodCategoriesData
        const allRawFoodData = getAllRawFoodData();
        console.log(`Reparsing with ALL food data - ${allRawFoodData.length} categories with ${totalFoodItems} total items`);
        
        const results = reparseFoodDatabaseForDietTypes(allRawFoodData);
        setLastParseResults(results);
        
        toast({
          title: "Database Reparsed",
          description: `Found ${results.length} diet types from ${totalFoodItems} food items`,
        });
      } catch (error) {
        console.error("Error reparsing food database:", error);
        toast({
          title: "Error Reparsing Database",
          description: "Check console for details",
          variant: "destructive",
        });
      } finally {
        setIsReparsing(false);
      }
    }, 100);
  };

  // Handle input changes for the new food form
  const handleFoodInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (["protein", "carbs", "fats", "caloriesPerServing", "servingSizeGrams"].includes(name)) {
      setNewFood(prev => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setNewFood(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle adding a diet to the new food
  const handleAddDiet = () => {
    if (dietInput.trim() && !newFood.diets?.includes(dietInput.trim())) {
      setNewFood(prev => ({
        ...prev,
        diets: [...(prev.diets || []), dietInput.trim()]
      }));
      setDietInput("");
    }
  };

  // Handle removing a diet from the new food
  const handleRemoveDiet = (dietToRemove: string) => {
    setNewFood(prev => ({
      ...prev,
      diets: (prev.diets || []).filter(diet => diet !== dietToRemove)
    }));
  };

  // Handle submitting the new food form
  const handleAddFood = () => {
    setIsAddingFood(true);
    
    try {
      // Make sure we have the required fields
      if (!newFood.id || !newFood.name || !newFood.primaryCategory) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields (ID, Name, Primary Category)",
          variant: "destructive",
        });
        setIsAddingFood(false);
        return;
      }
      
      // Get the current food categories
      const currentCategories = getCurrentFoodCategories();
      
      // Add the new food item
      const result = addFoodItem(newFood as FoodItem);
      
      if (result.success) {
        // Update the last parse results
        setLastParseResults(result.dietTypes);
        
        toast({
          title: "Food Added",
          description: result.message,
        });
        
        // Reset the form
        setNewFood({
          id: "",
          name: "",
          protein: 0,
          carbs: 0,
          fats: 0,
          caloriesPerServing: 0,
          servingSizeGrams: 100,
          servingSize: "100g",
          primaryCategory: "other",
          diets: []
        });
        setDietInput("");
      } else {
        toast({
          title: "Error Adding Food",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding food:", error);
      toast({
        title: "Error Adding Food",
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setIsAddingFood(false);
    }
  };

  // Initialize food categories on mount
  useEffect(() => {
    const processedCategories = getAllRawFoodData();
    initializeFoodCategories(foodCategoriesData);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Diet Database Tools
          </CardTitle>
          <CardDescription>
            Tools for managing the diet database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Reparse Food Database for Diet Types</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will scan all {totalFoodItems} food items in the database and update the available diet types.
              </p>
              <Button 
                onClick={handleReparse} 
                disabled={isReparsing}
                className="flex items-center"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isReparsing ? 'animate-spin' : ''}`} />
                {isReparsing ? "Reparsing..." : "Reparse Diet Database"}
              </Button>
            </div>

            {lastParseResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Last Parse Results:</h4>
                <div className="bg-secondary/50 p-3 rounded text-sm">
                  <p>Found {lastParseResults.length} diet types from {totalFoodItems} food items:</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lastParseResults.map((diet) => (
                      <div key={diet} className="bg-primary/10 px-2 py-1 rounded text-xs">
                        {diet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add New Food Form */}
            <div className="mt-10 pt-6 border-t">
              <h3 className="text-sm font-medium mb-2">Add New Food Item</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a new food item to the database. Diet types will be automatically reparsed.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic information */}
                <div>
                  <Label className="text-xs font-medium">ID* (unique identifier)</Label>
                  <Input 
                    name="id"
                    value={newFood.id}
                    onChange={handleFoodInputChange}
                    placeholder="e.g., chicken_breast_grilled"
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Name*</Label>
                  <Input 
                    name="name"
                    value={newFood.name}
                    onChange={handleFoodInputChange}
                    placeholder="e.g., Grilled Chicken Breast"
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Primary Category*</Label>
                  <select
                    name="primaryCategory"
                    value={newFood.primaryCategory}
                    onChange={handleFoodInputChange as any}
                    className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {PRIMARY_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Serving Size</Label>
                  <Input 
                    name="servingSize"
                    value={newFood.servingSize}
                    onChange={handleFoodInputChange}
                    placeholder="e.g., 100g"
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Serving Size (grams)</Label>
                  <Input 
                    name="servingSizeGrams"
                    type="number"
                    value={newFood.servingSizeGrams}
                    onChange={handleFoodInputChange}
                    className="mb-2"
                  />
                </div>
                
                {/* Macronutrients */}
                <div>
                  <Label className="text-xs font-medium">Protein (g)</Label>
                  <Input 
                    name="protein"
                    type="number"
                    value={newFood.protein}
                    onChange={handleFoodInputChange}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Carbs (g)</Label>
                  <Input 
                    name="carbs"
                    type="number"
                    value={newFood.carbs}
                    onChange={handleFoodInputChange}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Fats (g)</Label>
                  <Input 
                    name="fats"
                    type="number"
                    value={newFood.fats}
                    onChange={handleFoodInputChange}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <Label className="text-xs font-medium">Calories Per Serving</Label>
                  <Input 
                    name="caloriesPerServing"
                    type="number"
                    value={newFood.caloriesPerServing}
                    onChange={handleFoodInputChange}
                    className="mb-2"
                  />
                </div>
                
                {/* Diet Types */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-medium">Diet Types</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input 
                      value={dietInput}
                      onChange={(e) => setDietInput(e.target.value)}
                      placeholder="e.g., vegan, keto, etc."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDiet();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddDiet}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Display added diet types */}
                  {newFood.diets && newFood.diets.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newFood.diets.map((diet) => (
                        <div 
                          key={diet} 
                          className="bg-primary/10 px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {diet}
                          <button
                            type="button"
                            onClick={() => handleRemoveDiet(diet)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={handleAddFood} 
                  disabled={isAddingFood}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isAddingFood ? "Adding..." : "Add Food Item"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
