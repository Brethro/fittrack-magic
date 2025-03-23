
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FreeMealOptionProps {
  includeFreeMeal: boolean;
  setIncludeFreeMeal: (include: boolean) => void;
  dailyCalories: number;
}

export function FreeMealOption({
  includeFreeMeal,
  setIncludeFreeMeal,
  dailyCalories
}: FreeMealOptionProps) {
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-medium mb-2">Free Meal Option</h3>
      <div className="flex items-start space-x-2 mb-3">
        <Checkbox 
          id="free-meal"
          checked={includeFreeMeal}
          onCheckedChange={() => setIncludeFreeMeal(!includeFreeMeal)}
        />
        <div>
          <Label
            htmlFor="free-meal"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Include a free meal
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Reserve up to {Math.round(dailyCalories * 0.2)} calories (20% of your daily total) for a meal of your choice.
          </p>
        </div>
      </div>
    </div>
  );
}
