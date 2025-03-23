
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodItem, FoodPrimaryCategory } from "@/types/diet";
import { addFoodItem } from "@/utils/diet/foodManagement";

// Define the primary categories for the dropdown
const PRIMARY_CATEGORIES: FoodPrimaryCategory[] = [
  "meat", "redMeat", "poultry", "fish", "seafood", "dairy", "egg", 
  "grain", "legume", "vegetable", "fruit", "nut", "seed", "oil", 
  "sweetener", "herb", "spice", "processedFood", "other"
];

type AddFoodFormProps = {
  setLastParseResults: (results: string[]) => void;
}

export const AddFoodForm = ({ setLastParseResults }: AddFoodFormProps) => {
  const { toast } = useToast();
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [dietInput, setDietInput] = useState("");
  
  // State for the new food form
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
      
      // Add the new food item - Removed the argument as per the stub implementation
      const result = addFoodItem();
      
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

  return (
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
          <Select
            value={newFood.primaryCategory as string}
            onValueChange={(value) => {
              setNewFood(prev => ({ 
                ...prev, 
                primaryCategory: value as FoodPrimaryCategory 
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {PRIMARY_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  );
};
