
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFoodLog } from "@/contexts/FoodLogContext";
import MealTypeSelector from "./MealTypeSelector";

interface QuickFoodEntryFormData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
}

const QuickFoodEntry = () => {
  const { toast } = useToast();
  const { addFoodEntry } = useFoodLog();
  const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuickFoodEntryFormData>({
    defaultValues: {
      foodName: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      amount: 100,
      unit: "g"
    }
  });
  
  const onSubmit = (data: QuickFoodEntryFormData) => {
    // Create a new food log entry
    const newEntry = {
      foodName: data.foodName,
      amount: data.amount,
      unit: data.unit,
      date: new Date(),
      mealType: selectedMeal,
      nutrition: {
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
      },
      source: "custom" as const
    };
    
    // Add to food log
    addFoodEntry(newEntry);
    
    // Show success toast
    toast({
      title: "Food added",
      description: `${data.foodName} added to your ${selectedMeal}`
    });
    
    // Reset form
    reset();
  };
  
  return (
    <div className="glass-panel p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-3">Quick Add Food</h3>
      
      <MealTypeSelector 
        selectedMeal={selectedMeal} 
        onChange={setSelectedMeal} 
      />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Food Name */}
        <div>
          <Input
            placeholder="Food name"
            {...register("foodName", { required: "Food name is required" })}
            className={errors.foodName ? "border-destructive" : ""}
          />
          {errors.foodName && (
            <p className="text-destructive text-xs mt-1">{errors.foodName.message}</p>
          )}
        </div>
        
        {/* Amount and Unit */}
        <div className="flex gap-2">
          <div className="w-1/2">
            <Input
              type="number"
              placeholder="Amount"
              {...register("amount", { 
                required: "Required", 
                min: { value: 0, message: "Must be positive" } 
              })}
              className={errors.amount ? "border-destructive" : ""}
            />
          </div>
          <div className="w-1/2">
            <Input
              placeholder="Unit (g, ml, oz)"
              {...register("unit", { required: "Required" })}
              className={errors.unit ? "border-destructive" : ""}
            />
          </div>
        </div>
        
        {/* Nutritional Values */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              type="number"
              placeholder="Calories"
              {...register("calories", { 
                required: "Required", 
                min: { value: 0, message: "Must be positive" } 
              })}
              className={errors.calories ? "border-destructive" : ""}
            />
          </div>
          <div>
            <Input
              type="number"
              step="0.1"
              placeholder="Protein (g)"
              {...register("protein", { 
                required: "Required", 
                min: { value: 0, message: "Must be positive" } 
              })}
              className={errors.protein ? "border-destructive" : ""}
            />
          </div>
          <div>
            <Input
              type="number"
              step="0.1"
              placeholder="Carbs (g)"
              {...register("carbs", { 
                required: "Required", 
                min: { value: 0, message: "Must be positive" } 
              })}
              className={errors.carbs ? "border-destructive" : ""}
            />
          </div>
          <div>
            <Input
              type="number"
              step="0.1"
              placeholder="Fat (g)"
              {...register("fat", { 
                required: "Required", 
                min: { value: 0, message: "Must be positive" } 
              })}
              className={errors.fat ? "border-destructive" : ""}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add to Log
        </Button>
      </form>
    </div>
  );
};

export default QuickFoodEntry;
