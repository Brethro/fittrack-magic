
import { useState, useEffect } from "react";
import { useFoodLog, type FoodLogEntry } from "@/contexts/FoodLogContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import MealTypeSelector from "./MealTypeSelector";

interface QuickFoodEntryProps {
  onAddSuccess?: () => void;
  editingEntry?: FoodLogEntry | null;
  onEditSuccess?: () => void;
}

interface NutritionInputs {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
}

const QuickFoodEntry = ({ 
  onAddSuccess, 
  editingEntry = null,
  onEditSuccess
}: QuickFoodEntryProps) => {
  const { addFoodEntry, currentDate, updateFoodEntry } = useFoodLog();
  const [foodName, setFoodName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("g");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");
  const [nutrition, setNutrition] = useState<NutritionInputs>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugars: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Load editing entry data if present
  useEffect(() => {
    if (editingEntry) {
      setFoodName(editingEntry.foodName);
      setAmount(editingEntry.amount.toString());
      setUnit(editingEntry.unit);
      setMealType(editingEntry.mealType);
      setNutrition({
        calories: editingEntry.nutrition.calories || 0,
        protein: editingEntry.nutrition.protein || 0,
        carbs: editingEntry.nutrition.carbs || 0,
        fat: editingEntry.nutrition.fat || 0,
        fiber: editingEntry.nutrition.fiber || 0,
        sugars: editingEntry.nutrition.sugars || 0
      });
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [editingEntry]);
  
  const resetForm = () => {
    setFoodName("");
    setAmount("");
    setUnit("g");
    setMealType("snack");
    setNutrition({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugars: 0
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim() || !amount || isNaN(Number(amount))) {
      return;
    }
    
    const entry = {
      foodName: foodName.trim(),
      amount: Number(amount),
      unit,
      date: currentDate,
      mealType,
      nutrition: {
        calories: Number(nutrition.calories),
        protein: Number(nutrition.protein),
        carbs: Number(nutrition.carbs),
        fat: Number(nutrition.fat),
        fiber: Number(nutrition.fiber),
        sugars: Number(nutrition.sugars)
      },
      source: "custom" as const
    };
    
    if (isEditing && editingEntry) {
      // Update existing entry
      updateFoodEntry({
        ...entry,
        id: editingEntry.id,
        sourceId: editingEntry.sourceId
      });
      
      if (onEditSuccess) {
        onEditSuccess();
      }
    } else {
      // Add new entry
      addFoodEntry(entry);
      
      if (onAddSuccess) {
        onAddSuccess();
      }
    }
    
    resetForm();
  };
  
  const handleNutritionChange = (field: keyof NutritionInputs, value: string) => {
    setNutrition(prev => ({
      ...prev,
      [field]: value === "" ? 0 : Number(value)
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">
        {isEditing ? "Edit Food Entry" : "Quick Add Food"}
      </h3>
      
      {/* Food name */}
      <div>
        <Label htmlFor="food-name">Food Name</Label>
        <Input
          id="food-name"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="E.g., Apple, Chicken Breast"
          required
        />
      </div>
      
      {/* Amount and unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="unit">
              <SelectValue placeholder="g" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="g">grams (g)</SelectItem>
              <SelectItem value="oz">ounces (oz)</SelectItem>
              <SelectItem value="ml">milliliters (ml)</SelectItem>
              <SelectItem value="cup">cup</SelectItem>
              <SelectItem value="tbsp">tablespoon</SelectItem>
              <SelectItem value="tsp">teaspoon</SelectItem>
              <SelectItem value="serving">serving</SelectItem>
              <SelectItem value="piece">piece</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Meal type */}
      <div>
        <Label className="mb-2 block">Meal Type</Label>
        <MealTypeSelector 
          selectedMeal={mealType} 
          onChange={setMealType as (value: string) => void} 
        />
      </div>
      
      <Separator className="my-4" />
      
      {/* Nutrition information */}
      <div>
        <h4 className="text-md font-medium mb-3">Nutrition Information</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              step="1"
              value={nutrition.calories || ""}
              onChange={(e) => handleNutritionChange("calories", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              min="0"
              step="0.1"
              value={nutrition.protein || ""}
              onChange={(e) => handleNutritionChange("protein", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              step="0.1"
              value={nutrition.carbs || ""}
              onChange={(e) => handleNutritionChange("carbs", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              min="0"
              step="0.1"
              value={nutrition.fat || ""}
              onChange={(e) => handleNutritionChange("fat", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="fiber">Fiber (g)</Label>
            <Input
              id="fiber"
              type="number"
              min="0"
              step="0.1"
              value={nutrition.fiber || ""}
              onChange={(e) => handleNutritionChange("fiber", e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="sugars">Sugars (g)</Label>
            <Input
              id="sugars"
              type="number"
              min="0"
              step="0.1"
              value={nutrition.sugars || ""}
              onChange={(e) => handleNutritionChange("sugars", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>
      
      {/* Submit button */}
      <Button type="submit" className="w-full mt-4">
        {isEditing ? "Update Food Entry" : "Add to Food Log"}
      </Button>
    </form>
  );
};

export default QuickFoodEntry;
