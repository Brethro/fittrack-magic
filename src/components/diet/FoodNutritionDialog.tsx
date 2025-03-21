
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FoodItem } from "@/types/diet";
import { PieChart, PieChartIcon } from "lucide-react";

interface FoodNutritionDialogProps {
  food: FoodItem | null;
  open: boolean;
  onClose: () => void;
}

export function FoodNutritionDialog({ food, open, onClose }: FoodNutritionDialogProps) {
  if (!food) return null;

  // Calculate macronutrient percentages for the pie chart reference
  const totalCaloriesFromMacros = 
    (food.protein * 4) + 
    (food.carbs * 4) + 
    (food.fats * 9);
  
  const proteinPercentage = Math.round((food.protein * 4 / totalCaloriesFromMacros) * 100);
  const carbsPercentage = Math.round((food.carbs * 4 / totalCaloriesFromMacros) * 100);
  const fatsPercentage = Math.round((food.fats * 9 / totalCaloriesFromMacros) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{food.name}</DialogTitle>
          <DialogDescription>
            Nutrition information per {food.servingSize} ({food.servingSizeGrams}g)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calorie and Macronutrient Summary */}
          <div className="glass-panel p-3 rounded-md">
            <div className="text-center mb-2">
              <span className="text-xl font-semibold">{food.caloriesPerServing}</span>
              <span className="text-sm text-muted-foreground ml-1">calories</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-md font-medium">{food.protein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
                <div className="text-xs">{proteinPercentage}%</div>
              </div>
              <div>
                <div className="text-md font-medium">{food.carbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
                <div className="text-xs">{carbsPercentage}%</div>
              </div>
              <div>
                <div className="text-md font-medium">{food.fats}g</div>
                <div className="text-xs text-muted-foreground">Fats</div>
                <div className="text-xs">{fatsPercentage}%</div>
              </div>
            </div>
          </div>

          {/* Detailed Nutrition Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrient</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Calories</TableCell>
                <TableCell className="text-right">{food.caloriesPerServing}</TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Fats</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Total Fat</TableCell>
                <TableCell className="text-right">{food.fats}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Saturated Fat</TableCell>
                <TableCell className="text-right">{food.saturatedFat}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Trans Fat</TableCell>
                <TableCell className="text-right">{food.transFat}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Polyunsaturated Fat</TableCell>
                <TableCell className="text-right">{food.polyunsaturatedFat}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Monounsaturated Fat</TableCell>
                <TableCell className="text-right">{food.monounsaturatedFat}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Cholesterol</TableCell>
                <TableCell className="text-right">{food.cholesterol}mg</TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Carbohydrates</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Total Carbs</TableCell>
                <TableCell className="text-right">{food.carbs}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Dietary Fiber</TableCell>
                <TableCell className="text-right">{food.fiber}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Total Sugars</TableCell>
                <TableCell className="text-right">{food.sugars}g</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Added Sugars</TableCell>
                <TableCell className="text-right">{food.addedSugars}g</TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Protein</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Protein</TableCell>
                <TableCell className="text-right">{food.protein}g</TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold">Vitamins & Minerals</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Sodium</TableCell>
                <TableCell className="text-right">{food.sodium}mg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Potassium</TableCell>
                <TableCell className="text-right">{food.potassium}mg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Calcium</TableCell>
                <TableCell className="text-right">{food.calcium}mg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Iron</TableCell>
                <TableCell className="text-right">{food.iron}mg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Vitamin D</TableCell>
                <TableCell className="text-right">{food.vitaminD}mcg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Vitamin A</TableCell>
                <TableCell className="text-right">{food.vitaminA}mcg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Vitamin C</TableCell>
                <TableCell className="text-right">{food.vitaminC}mg</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Diet Compatibility */}
          {food.diets && food.diets.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Compatible Diets:</h3>
              <div className="flex flex-wrap gap-1">
                {food.diets.map(diet => (
                  <span 
                    key={diet} 
                    className="px-2 py-0.5 bg-muted rounded-full text-xs"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
